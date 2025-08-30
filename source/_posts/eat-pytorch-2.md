---
title: 20天狂宴Pytorch-Day2
date: 2025-08-27 11:42:35
tags: [大模型, pytorch, USTC-MINE]
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

图片数据建模.

## 准备数据

cifar2数据集包含5000张飞机airplane照片和5000张机动车automobile照片, 任务目标是训练一个模型区分airplane和automobile两种图片.

在Pytorch中构建图片数据管道通常有两种方法:

- 使用torchvision中的datasets.ImageFolder读取图片, 然后用DataLoader并行加载
- 通过继承torch.utils.data.Dataset实现用户自定义读取逻辑, 然后用DataLoader并行加载

本文介绍第一种方法.

<!--more-->

```python
import torch 
from torch import nn
from torch.utils.data import Dataset,DataLoader
from torchvision import transforms as T
from torchvision import datasets 

transform_img = T.Compose(	# 可以把多个图像处理步骤打包为一个流程, 如旋转裁切, 这里只有一步转换为tensor
    [T.ToTensor()])	# 把PIL图片或Numpy数组转换成tensor, 并把像素值压缩为[0, 1]的浮点数
def transform_label(x):	# 处理标签, 把x转换为一维浮点数tensor
    return torch.tensor([x]).float()
```

ImageFolder是torchvision里最常用的数据集加载工具之一, 需要准备一个文件夹, 每个子文件夹的名字就是类别名, 如:

```
cifar2/train/
    0_airplane/
    1_automobile/
cifar2/test/
    0_airplane/
    1_automobile/
```

ImageFolder会自动扫描这些子文件夹, 给每个类别分配一个编号, 然后返回 (图像, 标签).

使用方法如下:

```python
ds_train = datasets.ImageFolder("./eat_pytorch_datasets/cifar2/train/",
            transform = transform_img,target_transform = transform_label)
ds_val = datasets.ImageFolder("./eat_pytorch_datasets/cifar2/test/",
            transform = transform_img,target_transform = transform_label)
```

用DataLoader封装.

```python
dl_train = DataLoader(ds_train,batch_size = 50,shuffle = True)
dl_val = DataLoader(ds_val,batch_size = 50,shuffle = False)
```

可以运行如下代码查看部分样本和shape.

```python
from matplotlib import pyplot as plt 
plt.figure(figsize=(8,8)) 
for i in range(9):
    img,label = ds_train[i]
    img = img.permute(1,2,0)
    ax=plt.subplot(3,3,i+1)
    ax.imshow(img.numpy())
    ax.set_title("label = %d"%label.item())
    ax.set_xticks([])
    ax.set_yticks([]) 
plt.show()

for features,labels in dl_train:
    print(features.shape,labels.shape) 
    break
```

![](/img/eat-pytorch-2/1.png)

```
torch.Size([50, 3, 32, 32]) torch.Size([50, 1])
```

Pytorch的图片默认顺序是Batch, Channel, Width, Height.

## 建立模型

Pytorch通常有三种方式构建模型: 使用nn.Sequential按层顺序构建模型, 继承nn.Module基类构建自定义模型, 继承nn.Module基类构建模型并辅助应用模型容器进行封装, 此处选用继承nn.Module基类构建自定义模型.

```python
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(in_channels=3,out_channels=32,kernel_size = 3)
        self.pool = nn.MaxPool2d(kernel_size = 2,stride = 2)
        self.conv2 = nn.Conv2d(in_channels=32,out_channels=64,kernel_size = 5)
        self.dropout = nn.Dropout2d(p = 0.1)
        self.adaptive_pool = nn.AdaptiveMaxPool2d((1,1))
        self.flatten = nn.Flatten()
        self.linear1 = nn.Linear(64,32)
        self.relu = nn.ReLU()
        self.linear2 = nn.Linear(32,1)
        
    def forward(self,x):
        x = self.conv1(x)
        x = self.pool(x)
        x = self.conv2(x)
        x = self.pool(x)
        x = self.dropout(x)
        x = self.adaptive_pool(x)
        x = self.flatten(x)
        x = self.linear1(x)
        x = self.relu(x)
        x = self.linear2(x)
        return x 

net = Net()
print(net)
```

Conv2d: 二维卷积层, 把图片通过一组filter变换成新的多通道特征.

MaxPool2d: 池化层, 压缩图片数据, 保留重要信息.

Dropout2d: 丢弃层, 随机遮挡一部分数据, 迫使网络不过度依赖某几个通道, 而是学会更普遍的特征.

ReLu: 激活函数.

可以利用`torchkeras.summary(net, input_data = features)`总结网络结构, 输出如下.

```
--------------------------------------------------------------------------
Layer (type)                            Output Shape              Param #
==========================================================================
Conv2d-1                            [-1, 32, 30, 30]                  896
MaxPool2d-2                         [-1, 32, 15, 15]                    0
Conv2d-3                            [-1, 64, 11, 11]               51,264
MaxPool2d-4                           [-1, 64, 5, 5]                    0
Dropout2d-5                           [-1, 64, 5, 5]                    0
AdaptiveMaxPool2d-6                   [-1, 64, 1, 1]                    0
Flatten-7                                   [-1, 64]                    0
Linear-8                                    [-1, 32]                2,080
ReLU-9                                      [-1, 32]                    0
Linear-10                                    [-1, 1]                   33
==========================================================================
Total params: 54,273
Trainable params: 54,273
Non-trainable params: 0
--------------------------------------------------------------------------
Input size (MB): 0.000076
Forward/backward pass size (MB): 0.359627
Params size (MB): 0.207035
Estimated Total Size (MB): 0.566738
--------------------------------------------------------------------------
```

## 训练模型

和上次一样用仿照Keras风格的训练循环.

```python
import os,sys,time
import numpy as np
import pandas as pd
import datetime 
from tqdm import tqdm 

import torch
from torch import nn 
from copy import deepcopy

def printlog(info):
    nowtime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print("\n"+"=========="*8 + "%s"%nowtime)
    print(str(info)+"\n")

class StepRunner:	# 一个batch
    def __init__(self, net, loss_fn,
                 stage = "train", metrics_dict = None, 
                 optimizer = None
                 ):
        self.net,self.loss_fn,self.metrics_dict,self.stage = net,loss_fn,metrics_dict,stage
        self.optimizer = optimizer
            
    def step(self, features, labels):
        # loss
        preds = self.net(features)
        loss = self.loss_fn(preds,labels)
        
        # backward()
        if self.optimizer is not None and self.stage=="train": 
            loss.backward()	# 计算每个权重的梯度
            self.optimizer.step()	# 根据梯度更新权重
            self.optimizer.zero_grad()	# 清空梯度

        # metrics
        step_metrics = {self.stage+"_"+name:metric_fn(preds, labels).item() 
                        for name,metric_fn in self.metrics_dict.items()}
        return loss.item(),step_metrics
    
    def train_step(self,features,labels):
        self.net.train() # 训练模式, dropout层发生作用
        return self.step(features,labels)
    
    @torch.no_grad()
    def eval_step(self,features,labels):
        self.net.eval() # 预测模式, dropout层不发生作用
        return self.step(features,labels)
    
    def __call__(self,features,labels):
        if self.stage=="train":
            return self.train_step(features,labels) 
        else:
            return self.eval_step(features,labels)

class EpochRunner:	# 一个epoch(废话)
    def __init__(self,steprunner):
        self.steprunner = steprunner
        self.stage = steprunner.stage   
    def __call__(self,dataloader):
        total_loss,step = 0,0
        loop = tqdm(enumerate(dataloader),total =len(dataloader),file = sys.stdout)
        for i, batch in loop: 
            loss, step_metrics = self.steprunner(*batch)
            step_log = dict({self.stage+"_loss":loss},**step_metrics)
            total_loss += loss
            step+=1
            if i!=len(dataloader)-1:
                loop.set_postfix(**step_log)
            else:
                epoch_loss = total_loss/step
                epoch_metrics = {self.stage+"_"+name:metric_fn.compute().item() 
                                 for name,metric_fn in self.steprunner.metrics_dict.items()}
                epoch_log = dict({self.stage+"_loss":epoch_loss},**epoch_metrics)
                loop.set_postfix(**epoch_log)

                for name,metric_fn in self.steprunner.metrics_dict.items():
                    metric_fn.reset()
        return epoch_log

def train_model(net, optimizer, loss_fn, metrics_dict, 
                train_data, val_data=None, 
                epochs=10, ckpt_path='checkpoint.pt',
                patience=5, monitor="val_loss", mode="min"):
    history = {}
    for epoch in range(1, epochs+1):
        printlog("Epoch {0} / {1}".format(epoch, epochs))

        # 1，train -------------------------------------------------  
        train_step_runner = StepRunner(net = net,stage="train",
                loss_fn = loss_fn,metrics_dict=deepcopy(metrics_dict),
                optimizer = optimizer)
        train_epoch_runner = EpochRunner(train_step_runner)
        train_metrics = train_epoch_runner(train_data)

        for name, metric in train_metrics.items():
            history[name] = history.get(name, []) + [metric]

        # 2，validate -------------------------------------------------
        if val_data:
            val_step_runner = StepRunner(net = net,stage="val",
                loss_fn = loss_fn,metrics_dict=deepcopy(metrics_dict))
            val_epoch_runner = EpochRunner(val_step_runner)
            with torch.no_grad():
                val_metrics = val_epoch_runner(val_data)
            val_metrics["epoch"] = epoch
            for name, metric in val_metrics.items():
                history[name] = history.get(name, []) + [metric]

        # 3，early-stopping -------------------------------------------------
        arr_scores = history[monitor]
        best_score_idx = np.argmax(arr_scores) if mode=="max" else np.argmin(arr_scores)
        if best_score_idx==len(arr_scores)-1:
            torch.save(net.state_dict(),ckpt_path)
            print("<<<<<< reach best {0} : {1} >>>>>>".format(monitor,
                 arr_scores[best_score_idx]),file=sys.stderr)
        if len(arr_scores)-best_score_idx>patience:
            print("<<<<<< {} without improvement in {} epoch, early stopping >>>>>>".format(
                monitor,patience),file=sys.stderr)
            break 
        net.load_state_dict(torch.load(ckpt_path,weights_only=True))

    return pd.DataFrame(history)
```

```python
import torchmetrics 

class Accuracy(torchmetrics.Accuracy):
    def __init__(self, dist_sync_on_step=False):
        super().__init__(dist_sync_on_step=dist_sync_on_step)
        
    def update(self, preds: torch.Tensor, targets: torch.Tensor):
        super().update(torch.sigmoid(preds),targets.long())	# 重写update函数, 用sigmoid把数字压缩到0~1之间
            
    def compute(self):
        return super().compute()
    
    
loss_fn = nn.BCEWithLogitsLoss()
optimizer= torch.optim.Adam(net.parameters(),lr = 0.01)
metrics_dict = {"acc":Accuracy(task='binary')}

dfhistory = train_model(net,
    optimizer,
    loss_fn,
    metrics_dict,
    train_data = dl_train,
    val_data= dl_val,
    epochs=10,
    patience=5,
    monitor="val_acc", 
    mode="max")
```

## 评估模型

dfhistory如下.

```
   train_loss  train_acc  val_loss  val_acc  epoch
0    0.489415     0.7691  0.332821   0.8540      1
1    0.344483     0.8530  0.440991   0.7675      2
2    0.339193     0.8565  0.288581   0.8860      3
3    0.294807     0.8776  0.272804   0.8900      4
4    0.249944     0.8997  0.223067   0.9150      5
5    0.212562     0.9115  0.238513   0.9040      6
6    0.219863     0.9117  0.231890   0.9055      7
7    0.231824     0.9038  0.213779   0.9070      8
8    0.213917     0.9132  0.276232   0.8860      9
9    0.209967     0.9150  0.202512   0.9160     10
```

## 使用模型

```python
# 预测概率
y_pred_probs = predict(net,dl_val)
# 预测类别
y_pred = torch.where(y_pred_probs>0.5,
        torch.ones_like(y_pred_probs),torch.zeros_like(y_pred_probs))
```

## 保存模型

建议使用保存参数方式保存模型.

```python
print(net.state_dict().keys())

torch.save(net.state_dict(), "./data/net_parameter.pt")

net_clone = Net()
net_clone.load_state_dict(torch.load("./data/net_parameter.pt",weights_only=True))

predict(net_clone,dl_val)
```

昨天出去玩了没看, 有上一篇的经验之后似乎理解的东西稍微多一点了.