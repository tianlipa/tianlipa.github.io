---
title: Badencoder 复现尝试
tags: [科研, LINKE]
---

又到了喜闻乐见的配环境时间.

又要装CUDA了, 感觉我迟早得想办法再扩展一下我的存储空间.

查看电脑支持的最高CUDA版本:

```
nvidia-smi
```

不知道为什么宿舍网速非常劲, 能到30MB/s.

```powershell
conda create -n badencoder python=3.10
conda activate badencoder
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```

检查CUDA是否可用:

```Python
import torch
print(torch.cuda.is_available())
```

<!--more-->

## ResNet50

50层的Residual Network残差网络, 通过残差连接(跨级汇报)让神经网络即使在层数很多时也不容易丢失原始信息.



正常模型和植入模型, 比较干净输入的准确率(99.3%), 和攻击成功率(95%)

找一个具体的场景

### CIFAR-10

CIFAR-10是一个包含10个类别, 每个类别6000个图像的小型数据集, 3 通道的彩色RGB 图像, 图片尺寸为32×32, 