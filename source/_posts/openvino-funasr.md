---
title: 利用OpenVINO库加速FunASR语音识别
date: 2025-08-12 09:10:08
tags:
---

选取模型为[SenseVoiceSmall](https://www.modelscope.cn/models/iic/SenseVoiceSmall).

开始运行前首先需要将模型转换为OpenVINO IR格式. 原模型为PyTorch框架, 可以利用以下代码保存为ONNX格式.

```python
onnx_model = onnx.load(model_path)
onnx.save_model(onnx_model,
                'saved_model.onnx',
                save_as_external_data=True,
                all_tensors_to_one_file=True,
                location='data/weights_data',
                size_threshold=1024,
                convert_attribute=False)
```

也可以直接下载FunASR官方提供的[SenseVoiceSmall-onnx](https://www.modelscope.cn/models/iic/SenseVoiceSmall-onnx)模型. 准备好ONNX格式模型后, 可以利用OpenVINO提供的`mo`或`ovc`工具将其转换为OpenVINO IR格式. 在最新的OpenVINO版本中, `mo`工具已经被更简化的`OpenVINO Model Converter`即`ovc`工具所替代.

```bash
mo --input_model <INPUT_MODEL>.onnx
```

此命令会将模型优化并导出为OpenVINO IR格式模型. 注意, `--compress_to_fp16`默认处于开启状态, 会将模型压缩至fp16精度, 正常情况下不会导致明显的精度损失.

可以通过如下代码加载并编译OpenVINO IR模型.

<!--more-->

```python
import openvino as ov
model_path = r"/saved_model.xml"
model = ov.compile_model(model_path, "AUTO")
```

需要注意的是, 原模型采用FunASR提供的`AutoModel`类加载并调用, 而在转换为OpenVINO后由于模型类改变, 无法用原方法调用. 因此, 需要将原模型调用过程中, 对音频进行前处理后的数据导出, 用编译后的模型运算, 再将模型输出手动解码输出.

原模型的调用方法如下.

```python
from funasr import AutoModel
from funasr.utils.postprocess_utils import rich_transcription_postprocess

model = AutoModel(
    model=model_dir,
    trust_remote_code=True,
    device="gpu",
    disable_update=True,
)

res = model.generate(
    input="./vad_example.wav",
    cache={},
    language="auto",
    use_itn=True,
    batch_size_s=60,
    vad=False,
)

text = rich_transcription_postprocess(res[0]["text"])
print(text)
```

为导出前处理后数据, 需要给原模型的`encoder`添加hook, 代码如下.

```python
hook_layer = model.model.encoder.encoders0[0]
all_feats = []
def save_feats_hook(module, input, output):
    feats = input[0]
    feats_np = feats.detach().cpu().numpy()
    all_feats.append(feats_np)
    print("已保存中间特征: ", feats.shape)
hook_handle = hook_layer.register_forward_hook(save_feats_hook)

res = model.generate(
    input="./vad_example.wav",
    cache={},
    language="auto",
    use_itn=True,
    batch_size_s=60,
    vad=False,
)

all_feats = np.concatenate(all_feats, axis=1)
np.save("example_feats.npy", all_feats)
np.save("example_feats_len.npy", np.array([all_feats.shape[1]], dtype=np.int32))
hook_handle.remove()
```

注意, 如果在导出前处理数据时开启vad, 会导致按乱序导出数据, 识别内容虽然正确, 但对稍长的文本, 每句话之间的顺序会出现错乱, 故不应开启vad.

调用编译后模型代码如下.

```python
import numpy as np
speech = np.load("example_feats.npy")  # shape: [1, T, 560]
speech_lengths = np.load("example_feats_len.npy")  # shape: [1]

print(f"Speech shape: {speech.shape}, Lengths: {speech_lengths}")

language = np.array([0], dtype=np.int32)  # 0 = auto
textnorm = np.array([1], dtype=np.int32)  # 1 = do itn

inputs = {
    "speech": speech,
    "speech_lengths": speech_lengths,
    "language": language,
    "textnorm": textnorm,
}

results = model(inputs)
```

此时`results`内保存内容为识别文字对应token, 需手动解码并输出. 为此, 首先需要找到原模型的`tokens.json`文件, 并编写解码函数如下, 其中`rich_transcription_postprocess`是FunASR提供的用于将情感标识, 语言标识等符号转换为可读形式的函数.

```python
import json
# 原模型的tokens.json文件路径
with open(r".\SenseVoiceSmall-onnx\tokens.json", "r", encoding="utf-8") as f:
    token_list = json.load(f)
blank_id = token_list.index("<unk>")

logits = results["ctc_logits"]  # [1, T', vocab_size]
logits = np.squeeze(logits, axis=0)  # [time, vocab_size]
token_ids = np.argmax(logits, axis=-1)  # [time]

def decode(ids, blank=0):
    output = []
    prev = blank
    for i in ids:
        if i!= prev and i != blank:
            output.append(i)
        prev = i
    return output

decoded_ids = decode(token_ids, blank=blank_id)

text = "".join(token_list[i] for i in decoded_ids)
text = rich_transcription_postprocess(text)
print(text)
```

即可完成利用OpenVINO的模型调用, 效果如图.

![img](/img/openvino-funasr/识别1.jpg)

实验表明, 在音频不长(约1分钟)时, 是否使用OpenVINO对模型效率影响不大, 但在音频文件略长(约13分钟)时, 使用OpenVINO会显著提升模型效率, 如图.

![img](/img/openvino-funasr/识别2.jpg)

如果尝试在NPU上运行模型会导致报错, 错误信息如下.

```
Traceback (most recent call last):
  File "C:\FunASR\ov.py", line 15, in <module>
    model = ov.compile_model(model_path, "NPU")
  File "C:\Users\MTL659\AppData\Local\Programs\Python\Python310\lib\site-packages\openvino\runtime\ie_api.py", line 631, in compile_model
    return core.compile_model(model, device_name, {} if config is None else config)
  File "C:\Users\MTL659\AppData\Local\Programs\Python\Python310\lib\site-packages\openvino\runtime\ie_api.py", line 543, in compile_model
    super().compile_model(model, device_name, {} if config is None else config),
RuntimeError: Exception from src\inference\src\cpp\core.cpp:124:
Exception from src\inference\src\dev\plugin.cpp:58:
Exception from src\plugins\intel_npu\src\plugin\src\plugin.cpp:717:
Exception from src\plugins\intel_npu\src\compiler_adapter\src\ze_graph_ext_wrappers.cpp:389:
L0 pfnCreate2 result: ZE_RESULT_ERROR_INVALID_ARGUMENT, code 0x78000004 - generic error code for invalid arguments . [NPU_VCL] Compiler returned msg:
Upper bounds were not specified, got the default value - '9223372036854775807'
```

推测是NPU不支持动态`input shape`导致, 可能需要进一步研究.