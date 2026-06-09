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

数据准备: 随机裁剪, 随机水平翻转, 转换为张量, 标准化.

```python
transform_train = transforms.Compose([
    transforms.RandomCrop(32, padding=4),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
])
```

原版ResNet是针对224×224的图片的, CIFAR-10图片分辨率为32×32, 需要替换原网络的第一层卷积, 并取消最大池化操作.

特征图尺寸计算:
$$
O = \lfloor\frac{I - K + 2P}{S}\rfloor + 1
$$
O为输出尺寸, I为输入尺寸, K为卷积核大小, P为填充, S为步长.

```python
def get_cifar_resnet50():
    model = resnet50(weights=None, num_classes=10)
    # 不使用预训练权重, 输出类别为 10
    model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
    model.maxpool = nn.Identity()
    return model

model = get_cifar_resnet50().to(DEVICE)
```

交叉熵损失函数, 随机梯度下降(SGD) 优化器, 余弦退火学习率调度器.

```python
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=LR, momentum=0.9, weight_decay=5e-4)
# 余弦退火
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)
```

训练与验证.

```python
def train(epoch):
    model.train()
    train_loss = 0
    correct = 0
    total = 0
    
    pbar = tqdm(trainloader, desc=f'Epoch {epoch}/{EPOCHS} [Train]')
    for batch_idx, (inputs, targets) in enumerate(pbar):
        inputs, targets = inputs.to(DEVICE), targets.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

        pbar.set_postfix({'Loss': f'{train_loss/(batch_idx+1):.3f}', 'Acc': f'{100.*correct/total:.2f}%'})

def test(epoch):
    model.eval()
    test_loss = 0
    correct = 0
    total = 0
    with torch.no_grad():
        pbar = tqdm(testloader, desc=f'Epoch {epoch}/{EPOCHS} [Test] ')
        for batch_idx, (inputs, targets) in enumerate(pbar):
            inputs, targets = inputs.to(DEVICE), targets.to(DEVICE)
            outputs = model(inputs)
            loss = criterion(outputs, targets)

            test_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

            pbar.set_postfix({'Loss': f'{test_loss/(batch_idx+1):.3f}', 'Acc': f'{100.*correct/total:.2f}%'})
    
    return 100.*correct/total
```

## CIFAR-10

CIFAR-10是一个包含10个类别, 每个类别6000个图像的小型数据集, 3 通道的彩色RGB 图像, 图片尺寸为32×32.

跑了75个epoch, 最佳准确率是92.55%, 那就这样吧.

做到这里突然发现不对劲, 这tm是监督学习, BadEncoder攻击的是自监督学习.



线性层跑了100个epoch之后Best Test Acc: 0.7979, 后期基本没有什么提升了, 感觉还是要再跑一下编码器部分.

跑了400个epoch, loss是4.7510左右, best acc 0.7928, 但我这个线性层是接着上次100个epoch后面跑的, 我觉得可以重新试试.

clean成功率: 0.8186



Epoch 3 | Clean Acc (CDA): 0.6996 | Attack Success Rate (ASR): 0.9787

Epoch 60 | Clean Acc (CDA): 0.7008 | Attack Success Rate (ASR): 0.7890

正常模型和植入模型, 比较干净输入的准确率(99.3%), 和攻击成功率(95%)

找一个具体的场景