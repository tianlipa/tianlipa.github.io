---
title: 20天狂宴Pytorch-Day7
date: 2025-09-02 23:52:58
tags: [大模型, pytorch, USTC-MINE]
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

Pytorch的动态计算图.

## 动态计算图

Pytorch的计算图由节点和边组成, 节点表示张量或者Function, 边表示张量和Function之间的依赖关系.

Pytorch的计算图是动态图:

- 计算图的正向传播是立即执行的, 无需等待完整的计算图创建完毕, 每条语句都会在计算图中动态添加节点和边, 并立即执行正向传播得到计算结果.
- 计算图在反向传播后立即销毁. 如果在程序中使用了backward方法执行了反向传播, 或者利用`torch.autograd.grad`方法计算了梯度, 那么创建的计算图会被立即销毁, 下次调用需要重新创建.

<!--more-->

```python
import torch 
w = torch.tensor([[3.0,1.0]],requires_grad=True)
b = torch.tensor([[3.0]],requires_grad=True)
X = torch.randn(10,2)
Y = torch.randn(10,1)
Y_hat = X @ w.t() + b
# Y_hat定义后其正向传播被立即执行，与其后面的loss创建语句无关

loss = torch.mean(torch.pow(Y_hat-Y,2))
print(loss.data)
print(Y_hat.data)

loss.backward()
loss.backward() # 再次反向传播将报错
```

## 计算图中的Function

计算图中的另外一种节点是Function, 即Pytorch中各种对张量操作的函数, 但其同时包括正向计算的逻辑和反向传播的逻辑.

可以通过继承`torch.autograd.Function`来创建这种支持反向传播的Function.

```python
class MyReLU(torch.autograd.Function):
   
    # 正向传播逻辑
    # 可以用ctx存储一些值供反向传播使用
    @staticmethod
    def forward(ctx, input):
        ctx.save_for_backward(input)
        return input.clamp(min=0)

    # 反向传播逻辑
    @staticmethod
    def backward(ctx, grad_output):
        input, = ctx.saved_tensors
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0
        return grad_input

import torch 
w = torch.tensor([[3.0,1.0]],requires_grad=True)
b = torch.tensor([[3.0]],requires_grad=True)
X = torch.tensor([[-1.0,-1.0],[1.0,1.0]])
Y = torch.tensor([[2.0,3.0]])

relu = MyReLU.apply
Y_hat = relu(X@w.t() + b)
loss = torch.mean(torch.pow(Y_hat-Y,2))
loss.backward()
print(w.grad)
print(b.grad)
# Y_hat的梯度函数即MyReLU.backward
print(Y_hat.grad_fn)
```

## 计算图与反向传播

```python
import torch 

x = torch.tensor(3.0,requires_grad=True)
y1 = x + 1
y2 = 2*x
loss = (y1-y2)**2

loss.backward()
```

调用`loss.backward()`后, 依次发生:

1. 从loss标量出发, loss自身的grad梯度赋值为1
2. loss根据其自身梯度以及关联的backward方法, 计算出其对应的自变量(y1和y2)的梯度, 将该值赋值到y1.grad和y2.grad
3. y1和y2根据其自身梯度以及关联的backward方法, 计算出其对应的自变量(x)的梯度, x.grad将收到的多个梯度值累加

因此张量的grad梯度不会自动清零, 需要手动清零.

## 叶子节点和非叶子节点

```普通
import torch 

x = torch.tensor(3.0,requires_grad=True)
y1 = x + 1
y2 = 2*x
loss = (y1-y2)**2

loss.backward()
print("loss.grad:", loss.grad)
print("y1.grad:", y1.grad)
print("y2.grad:", y2.grad)
print(x.grad)
```

执行上述代码发现, loss.grad并非期望的1, 而是None, 类似地y1.grad和y2.grad也是None. 原因是它们不是叶子节点张量, 在反向传播过程中, 只有`is_leaf=True`的节点, 导数结果才会被保留.

叶子节点张量需要满足两个条件:

- 是由用户直接创建的张量, 而非由某个Function通过计算得到的张量
- requires_grad属性必须为True

所有依赖于叶子节点张量的张量, 其requires_grad属性必定为True, 但其梯度值只在计算过程中被用到, 不会最终存储到grad属性中.

如果需要保留中间计算结果的梯度到grad属性中, 可以使用retain_grad方法; 如果仅仅是为了调试代码查看梯度值, 可以利用register_hook打印日志. 利用retain_grad可以保留非叶子节点的梯度值, 利用register_hook可以查看非叶子节点的梯度值.

```python
import torch 

# 正向传播
x = torch.tensor(3.0,requires_grad=True)
y1 = x + 1
y2 = 2*x
loss = (y1-y2)**2

# 非叶子节点梯度显示控制
y1.register_hook(lambda grad: print('y1 grad: ', grad))
y2.register_hook(lambda grad: print('y2 grad: ', grad))
loss.retain_grad()

# 反向传播
loss.backward()
print("loss.grad:", loss.grad)
print("x.grad:", x.grad)
```