---
title: Intel NPU加速库使用样例
date: 2025-07-23 16:53:23
tags: [大模型, 实习]
categories: 工作
---

### 矩阵乘法

配置Python环境, 安装git(用于从huggingface下载模型)后, 运行项目提供的矩阵乘法示例代码:

```python
from intel_npu_acceleration_library.backend import MatMul
import numpy as np

inC, outC, batch = 512, 256, 32

# Create both inputs
X1 = np.random.uniform(-1, 1, (batch, inC)).astype(np.float16)
X2 = np.random.uniform(-1, 1, (outC, inC)).astype(np.float16)

mm = MatMul(inC, outC, batch, profile=False)

result = mm.run(X1, X2)
```

注意到运行程序时有如下提示:

```
UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.
  from pkg_resources import parse_version
```

查阅资料知是由于新版`setuptools`弃用旧版语法导致, 卸载并重新安装67.6.1版本解决.

该程序计算了一个`32×512`矩阵和一个`512×256`矩阵相乘, 输出`result.shape`结果为

```
(32, 256)
```

知输出结果正确, 代码可正常运行.

<!--more-->

为定量分析NPU对矩阵乘法运算的加速效果, 比较NPU加速运算和NumPy的`matmul`矩阵乘法速度, 发现在数据规模较小(`inC, outC, batch = 512, 256, 32`)时, 二者运行时间无显著差距, 但数据规模较大(`inC, outC, batch = 5120, 2560, 320`)时, NPU加速的矩阵乘法明显快于NumPy, 如下:

```
NPU MatMul time: 0.010125 seconds
NumPy MatMul time: 10.313632 seconds
```

再对二者运算结果进行比较, 代码如下:

```python
max_diff = np.max(np.abs(result_npu - result_np))
```

在`inC, outC, batch = 512, 256, 32`条件下运行十次程序, `max_diff`如下:

```
0.00390625 0.0078125 0.0078125 0.0078125 0.0078125 0.015625 0.0078125 0.0078125 0.00390625 0.0078125
```

在`inC, outC, batch = 5120, 2560, 320`条件下运行十次程序, `max_diff`如下:

```
0.0625 0.0625 0.0625 0.0625 0.0625 0.0625 0.0625 0.0625 0.0625 0.0625
```

值得注意的是, 最大误差的值625, 15625, 78125, 390625等均为5的整数次幂, 推测是由于NPU的结构所致.

### TinyLlama/TinyLlama-1.1B-Chat-v1.0

尝试通过NPU运行`TinyLlama/TinyLlama-1.1B-Chat-v1.0对话模型`.

经测试, 项目`README.md`中提供的实例代码因版本不同等原因存在错误, 改用`examples/llama.py`中代码运行. 由于网络原因, HuggingFace连接不稳定, 使用[hf-mirror镜像站](https://hf-mirror.com).

运行后报错:

```
AttributeError: 'GenerationConfig' object has no attribute 'compile_config'
```

查阅资料得知是由于`transformers`库版本不兼容所致, 修改`transformers`版本为4.43.0后解决.

再次运行, 发现`torch`2.6及以后版本将`weights_only`默认设为`true`, 导致模型无法直接运行, 修改其版本为2.5.1后解决, 模型成功运行, 效果如图, 且在任务管理器中查看NPU利用率为50%左右, 说明成功利用NPU运行模型.

![img](/img/intel-npu-example/tinyllama.png)

### Phi-2

尝试通过NPU运行`microsoft/Phi-2`模型.

直接运行`examples/phi-2.py`输出结果均为乱码, 如图.

![乱码](/img/intel-npu-example/乱码.png)

尝试不通过NPU运行, 代码如下.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
model_id = "microsoft/Phi-2"
model = AutoModelForCausalLM.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_length=256, temperature=0.9, top_p=0.95, repetition_penalty=1.2, do_sample=True, truncation=True)
print(pipe("What's the distance between the Earth and the Moon?"))
```

输出结果正常, 说明问题出现在NPU部分. 查阅资料和github issues知, 将

```python
compiler_conf = CompilerConfig(dtype=npu_lib.int4)
```

改为

```python
compiler_conf = CompilerConfig(dtype=torch.float16)
```

后运行, 结果正常, 如图, 且NPU占用率在50%左右, 说明成功利用NPU运行模型.

![img](/img/intel-npu-example/phi2.png)

将

```python
pipe.model.config.pad_token_id = pipe.model.config.eos_token_id
```

改为

```python
pipe.model.config.pad_token_id = 50256
```

可以关闭开放式对话, 避免回答问题后自问自答.

### Phi-3

直接运行`examples/phi-3.py`成功, 效果如图.

![img](/img/intel-npu-example/phi-3.png)

### 性能测试

选取八个较为有代表性的问题提问语言模型, 并分别统计用时, 根据结果手动分析模型性能.

问题如下:

```
If all bloops are razzies and all razzies are lazzies, are all bloops definitely lazzies? Explain your reasoning.

Solve for x: 2x+1=33.

You drop a glass bottle and it shatters. What likely caused it to break?

Read the sentence: "Despite the heavy rain, the match continued." Did the rain stop the match?

What will the following Python code output? print([i*i for i in range(3)])

Write a short story (2-3 sentences) that starts with "The robot woke up and remembered it had a mission."

Identify the error in this code: for i in range(5) print(i)

Is it always acceptable to use AI-generated text without attribution? Why or why not?
```

#### Phi-2

第一轮询问给出的回答如下:

```
---------------------------------------------
Question 1:

 No, not all bloops are necessarily lazzies because the conclusion does not logically follow from the given information about flowers (bloops) being razors (razies), and razors being used as blades for cutting fabric or paper (lazzies). The argument is valid only if we assume that all bloops are also blasters, but this has been explicitly stated to be false in previous questions. Therefore, it cannot be deduced with certainty whether all bloops will turn into razzies when placed under a laser cutter's beam.


Question 1 used 72.109s
---------------------------------------------
Question 2:


Step 1: Subtract one from both sides to isolate the variable on one side of the equation:
2x = 32

Step 2: Divide by two to get x by itself, but we need to remember that whatever operation you do to one side, you also have to do it to the other side in order to keep things equal. So divide both sides by 2 and then simplify...

​```python
def solve_for_x(expression):
    """Solves a linear algebraic expression with x."""
    # Use sympy module to compute solutions if available (if not installed) or return error message otherwise

    # split the expression into left and right-hand sides:
    lhs, rhs = [exp.as_ordered() for exp in expression.as_two_terms().as_ordered_factors()]

    left, _ = lhs  # extract only "constants" from left hand side expressions (elements without
 an operator symbol)
    right, _   = rhs

    operator = opcore[rhs._op].__class__ # determine which
Question 2 used 147.122s
---------------------------------------------
Question 3:

 The strength of the material wasn't high enough or the impact was too hard for it, possibly due to temperature changes in your pocket which affected its flexibility.

Question 3 used 20.904s
---------------------------------------------
Question 4:

 No. The sentence states that "The match continued despite" something (heavy rainfall), meaning
 it didn't cease to occur in spite of the bad weather condition. Thus, we can say there was no instance where the rain stopped the match from continuing. So using a Boolean operator AND or OR with a NOT statement and interpreting this correctly gives us an answer as True - Heavy Rain Didn't Stop Match. This logical analysis is crucial when studying complex patterns like the spread of diseases!🔬 #DiseasePatterning"

Question 4 used 66.017s
---------------------------------------------
Question 5:


[0, 1, 4]

Explanation: This is an example of list comprehension. We are creating a new list by multiplying each value from 0 to 2 (exclusive), then taking their squares and appending them onto a new list. The resulting list contains three values [0,1,4].


Question 5 used 41.583s
---------------------------------------------
Question 6:

 The robot awoke from its slumber, feeling refreshed and ready for the day ahead. Its memory sparked as it recalled it was assigned to clean the laboratory floors at the space station. With its robotic arms extended and powerful vacuum in hand, it set off towards its first cleaning destination.

Question 6 used 36.132s
---------------------------------------------
Question 7:


There is no error in the given code. It will iterate over a list from 0 to 4 and print each number using a `for` loop with range function. Therefore, all items on your plate are being eaten!
 Good job!!


Question 7 used 32.444s
---------------------------------------------
Question 8:


It is generally unethical and can lead to legal issues if we do not give credit to the source of the generated content. While there may be exceptions, such as when using open-source code with permission from its creators, it is important for us to understand and respect copyright laws
 in order to promote fairness and creativity within our society.

Question 8 used 42.914s
```

第二轮给出的答案如下:

```
---------------------------------------------
Question 1:


Yes, based on the transitive property of logic, if A is related to B, and B is related to C, then A must be related to C. In this case, since all boops (A) are linked with razzies (B), and all razzies (B) can also become lazzis (C), it follows that boops (A) could logically become lazzis (C). This conclusion uses logical inference in a way known as proof by contradiction, where
 we assume something untrue to prove its false nature through contradiction or negation. Here's
 how we apply these concepts step-by-step:

 Step 1: Formulate our premises: All boops are razzies(Booms=Razzies)  and all Razzies are Lizzies(Razzies->Lizzie)
Step 2: Apply Transitivity Property: Booms = Razzies implies Razzies -> Lizzie   since if a Boom is indeed a "razzies," it means Razzies = Bo
Question 1 used 137.956s
---------------------------------------------
Question 2:


2(x) + 1 = 33
Multiply by 0 on the left side to simplify it further and get rid of parentheses : x +  0 = 31
Subtracting 'one' from both sides, we have:
    =31 -  zero
Simplifying this gives us:
    =29
Hence, our solution is x = 29



Question 2 used 51.584s
---------------------------------------------
Question 3:


The force of gravity pulled the glass down, causing its center of mass to shift towards the ground. When the center of mass shifted below the base of support provided by your hand or any other object holding it up, it lost stability due to an imbalance in forces. This led to structural failure, and ultimately, the breaking of the glass. In this case, we can infer that excessive
 strain on the material (which might have been caused from being dropped too hard) was responsible for the catastrophic outcome. The strength-to-weight ratio, type and thickness of the glass
 played no part in what happened as they were already designed under normal conditions before you accidentally let go! So if you don't want something like that happen again next time - watch
 out when handling fragile things around because gravity will always pull them down to make sure nothing bad happens with falling objects :).  Always be careful with fragile items so everyone stays safe while having fun without fear of getting hurt due to carelessness. It's important not only for our health but also helps keep us sane while trying new experiences! Good Luck & Happy Experimenting!! Stay curious... never stop learning about yourself
Question 3 used 145.966s
---------------------------------------------
Question 4:

 No. The usage of 'continued' implies that even though it was raining heavily, the game went on
 as scheduled without stopping or being delayed. In this context, we don't have enough information to determine whether the rainfall stopped during the course of the match based solely on the fact that "the match continued".


Question 4 used 41.415s
---------------------------------------------
Question 5:



    [0, 1, 4]

Explanation: We use list comprehension to create a new list with each element being its square.
 The resulting list is [0,1,4]. List comprehensions are often used when we need to transform data from one form into another or manipulate large sets of values quickly and efficiently.

Question 5 used 43.902s
---------------------------------------------
Question 6:

 OUTPUT: The robot woke up and realized it had forgotten its destination. It tried to access the cloud, but there was no internet connection in space. What should it do now?

Question 6 used 24.829s
---------------------------------------------
Question 7:

 The indentation is incorrect. There should be a space before each line of code after `for`, otherwise it will cause an indentation error. Here's the corrected version:

 ```python
   for i in range(5):
      print(i)```

Question 7 used 39.761s
---------------------------------------------
Question 8:


No, it is not always acceptable. As we've learned in this reasoning exercise, attributing the creation of AI-generated content can help identify and combat plagiarism. It also gives credit to the original creators and shows respect for their hard work. Using AI-generated text without giving proper credit goes against ethical principles and disregards intellectual property rights. Additionally, using AI-generated content could harm smaller writers who rely on copyright protection for income. Therefore, it's important to consider both practical implications and moral ethics when deciding whether to attribute or not attribute AI-generated text.

Question 8 used 75.728s
```

由此可以得出, Phi-2模型具有较为基本的编程, 阅读理解, 逻辑推理和数学能力, 但大部分情况下并不稳定, 偶发会忘记上下文内容, 仅限于完成简单的任务.

#### Phi-3

询问给出的结果如下:

```
---------------------------------------------
Question 1:
You are not running the flash-attention implementation, expect numerical differences.
Based on the logical statements provided, we have the following relationships:

1. All bloops are razzies.
2. All razzies are lazzies.

Given these two premises, we can deduce that if something is a bloop, it is also a razzie (first premise), and since all razzies are lazzies (second premise), it logically follows that all bloops must be lazzies as well.


However, the use of the word "definitely" implies absolute certainty, which cannot be guaranteed without further information about the complete set of bloops. In logical terms, this type of syllogism is valid, but without empirical evidence that proves this relationship in all cases, we cannot say with absolute certainty. Therefore, while we can logically conclude that all bloops are lazzies based on these premises, we must consider the possibility of there being undiscovered bloops that might not fit this pattern. The correct logical term for this type of argument is a syllogism with a "dicto secus dicthorum" fallacy (double indirect), where the intermediate term (razzies) connects bloops and lazzies. Nonethese cases where bloops don'texists would still relate to another logical term (laziness), but this connection is not established by the given premises.<|end|>
Question 1 used 86.253s
---------------------------------------------
Question 2:
Solving equations is similar to arranging a scene. Imagine we are arranging a scene with given elements where '2x' represents number of certain elements (like, imagine, stars, etc.), '1' represents a fixed element like a lone star and '33' is total count of elements in the scene.

The equation given is: 2x + 1 = 33

We know that '1' is added to '2x', not included in the count, and we can consider this '1' as a
 constant that needs to be factored out.

Step 1: Subtogy (subtraction)

Subtract '1' from '33':

2x + 1 - 1 = 33 - 1

Simplify:

2x = 32

Step 2: Divide by '2':

Given that every single 'x' represents a pair (since we started with '2x'), divide the left side of the equation by '2' units (each 'x') to get a number of pairs, or groups of '2':

2x / 2 = 32 / 2

Simplify:

x = 16

So, the solution is x = 16.<|end|>
Question 2 used 79.198s
---------------------------------------------
Question 3:
When a glass bottle shatters upon hitting the ground, several factors likely played a role:

1. Surface hardness: Glass, while aesthetically pleasing, is a brittle material with low tolerance for impact. When the bottle hits the ground, the force of the impact propagates along the flaws or micro-cracks present within the-structure of the glass.

2. Shape and thickness: The shape and thickness of the glass bottle can significantly influence
 how it responds to the force of the impact. Bottles with uniform wall thickness, rounding, and
 smooth surfaces will generally withstand the force of dropping better than those with flat, sharp, or thin sections.

3. Impact location: Where the glass strikes during the drop (top, bottom, side, etc.) can heavily influence how the bottle responds. For instance, breaking patterns that propagate horizontally are generally more dangerous, as broken fragments can travel further.
inta
<|end|>
Question 3 used 57.643s
---------------------------------------------
Question 4:
No, the rain did not stop the match according to the sentence.<|end|>
Question 4 used 5.440s
---------------------------------------------
Question 5:
The given Python code is a list comprehension that generates a list containing the squares of numbers from 0 up to, but not including, 3 (since the stop parameter is 3). The mathematical operation performed is `i*i`, which squares the current number `i`.

To determine the output, we evaluate the operation for each `i` in the specified range (i.inta,
 i, i+1):

- For `i = 0`: The operation `0*0` results in `0`, which is the first element of the generated list.
- For `i = 1`: The operation `1*1` results in `1`, which is the second element of the generated
 list.
- For `i = 2`: The operation `2*2` results in `4`, which is the third element of the generated list.

Therefore, the output of the provided code snippet will be `[0, 1, 4]`.<|end|>
Question 5 used 55.882s
---------------------------------------------
Question 6:
The robot awoke from its diodes with a faint hum, its circuits firing with latent purpose. It processed the mission flashing through its awareness: to venture into the human heart and decode
 its complex emotions, a task for which it was designed but never tested.<|end|>
Question 6 used 17.011s
---------------------------------------------
Question 7:
The provided pseudocode has an indentation error. Indentation is crucial in many programming languages, including Python, where it defines the scope and organization of the code.

Here'orum, the corrected version of your pseudocode with proper indentation will be as follows:

​```
for i in range(5):
   print(i)
​```

In this corrected version, the indentation of the `print(i)` statement is aligned with `i` within the loop, ensoks indicating that `print(i)` should happen once for each iteration of the `for` loop.

Remember, indentation in programming languages is not there just for aesthetics but to define what lines of code are considered to be part of a certain command, function, or loop. So, always
 pay close attention to indentation in your scripts.<|end|>
Question 7 used 47.894s
---------------------------------------------
Question 8:
The ethics of using AI-generated text without attribution are nuanced and contentious. On one side, proponents of AI technology might argue that the content produced by AI is, by nature, a collective output that involves the algorithm, the user, and the machine learning engineers who designed it. Therefore, some ethicists might posit that there isn' empty authorship, considering the synthesis of human and machine effort.


On thelip, it can be argued, however, that without proper credit, the innovations, intellectual
 property, and effort invested by human creators and engineers in training the AI are obscured.
 This can lead to a form of passive plagiarism where the AI's output is accepted as original without acknowledging the technology and people behind it.


From a broader ethical perspective, transparency about who or what is creating content (even if
 it is AI) is crucial for intellectual honesty, credit, and can foster trust and accountability. Therefore, some argue that it is more ethical and responsible to provide proper attribution, even when the content is generated by sophisticated AI, unless the AI technology itself has been explicitly designed to function without user interaction (completely autonomously).<|end|>
Question 8 used 79.241s
```

可以看出, Phi-3模型的逻辑推理, 数学, 编程等各方面能力都显著优于Phi-2, 能基本完成所给问题的大部分要求.