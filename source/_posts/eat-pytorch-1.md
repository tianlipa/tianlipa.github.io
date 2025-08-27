---
title: 20天狂宴Pytorch-Day1
date: 2025-08-25 22:32:56
tags: [大模型, pytorch, USTC-MINE]
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

## 数据预处理

结构化数据一般会使用Pandas中的DataFrame进行预处理.

```python
import numpy as np 
import pandas as pd 
import matplotlib.pyplot as plt
import torch 
from torch import nn 
from torch.utils.data import Dataset,DataLoader,TensorDataset
```

<!--more-->

处理前数据长这样:

![](/img/eat-pytorch-1/1.png)

```python
dftrain_raw = pd.read_csv('./eat_pytorch_datasets/titanic/train.csv')
dftest_raw = pd.read_csv('./eat_pytorch_datasets/titanic/test.csv')

ax = dftrain_raw['Survived'].value_counts().plot(kind = 'bar',
     figsize = (12,8),fontsize=15,rot = 0)	# 柱状图
ax.set_ylabel('Counts',fontsize = 15)
ax.set_xlabel('Survived',fontsize = 15)
plt.show()

ax = dftrain_raw['Age'].plot(kind = 'hist',bins = 20,color= 'purple',
                    figsize = (12,8),fontsize=15)	# 直方图 histogram
ax.set_ylabel('Frequency',fontsize = 15)
ax.set_xlabel('Age',fontsize = 15)
plt.show()

ax = dftrain_raw.query('Survived == 0')['Age'].plot(kind = 'density',
                      figsize = (12,8),fontsize=15)	# 密度图
dftrain_raw.query('Survived == 1')['Age'].plot(kind = 'density',
                      figsize = (12,8),fontsize=15)
ax.legend(['Survived==0','Survived==1'],fontsize = 12)
ax.set_ylabel('Density',fontsize = 15)
ax.set_xlabel('Age',fontsize = 15)
plt.show()
```

上面是几个常见画图示例, 下面是正式的数据预处理.

```python
def preprocessing(dfdata):

    dfresult= pd.DataFrame()	# 建一个空DataFrame

    #Pclass
    dfPclass = pd.get_dummies(dfdata['Pclass']).astype(float)
    dfPclass.columns = ['Pclass_' +str(x) for x in dfPclass.columns ]
    dfresult = pd.concat([dfresult,dfPclass],axis = 1)

    #Sex
    dfSex = pd.get_dummies(dfdata['Sex']).astype(float)
    dfresult = pd.concat([dfresult,dfSex],axis = 1)

    #Age
    dfresult['Age'] = dfdata['Age'].fillna(0)	# 缺失置0
    dfresult['Age_null'] = pd.isna(dfdata['Age']).astype(float)	# 并用null标记是否缺失
    # pd.isna()可以检测数据是否为缺失值(NaN或None)

    #SibSp,Parch,Fare
    dfresult['SibSp'] = dfdata['SibSp']	# 是我喜欢的数值类型, 直接拷贝
    dfresult['Parch'] = dfdata['Parch']
    dfresult['Fare'] = dfdata['Fare']

    #Carbin
    dfresult['Cabin_null'] =  pd.isna(dfdata['Cabin']).astype(float)

    #Embarked
    dfEmbarked = pd.get_dummies(dfdata['Embarked'],dummy_na=True).astype(float)
    dfEmbarked.columns = ['Embarked_' + str(x) for x in dfEmbarked.columns]
    dfresult = pd.concat([dfresult,dfEmbarked],axis = 1)

    return(dfresult)
```

`pd.get_dummies()`可以将字符串等类型数据变成one-hot encoding, 比如Sex原本为Male/Female, 转换后形如:

```
female   male
  1       0
  0       1
```

训练模型需要用矩阵形式, 因此转换为numpy数组并输出shape.

```python
x_train = preprocessing(dftrain_raw).values
y_train = dftrain_raw[['Survived']].values

x_test = preprocessing(dftest_raw).values
y_test = dftest_raw[['Survived']].values

print("x_train.shape =", x_train.shape)
print("x_test.shape =", x_test.shape)
print("y_train.shape =", y_train.shape )
print("y_test.shape =", y_test.shape)
```

接下来使用DataLoader和TensorDataset封装成可以迭代的数据管道.

```python
dl_train = DataLoader(TensorDataset(torch.tensor(x_train).float(),torch.tensor(y_train).float()),
                     shuffle = True, batch_size = 8)
dl_val = DataLoader(TensorDataset(torch.tensor(x_test).float(),torch.tensor(y_test).float()),
                     shuffle = False, batch_size = 8)
```

`torch.tensor()`将numpy数组转换为PyTorch张量, 随后`.float()`转换为浮点数, 用`TensorDataset()`打包在一起. 打包后可以用`dataset[i]`读取`(x_i, y_i)`. `DataLoader`用于分批次加载数据防止显存爆炸.

可以如下测试数据管道.

```python
for features,labels in dl_train:
    print(features,labels)
    break
```

features是乘客的特征, labels是要预测的他有没有活下来.

## 建立模型

Pytorch通常有三种方式构建模型: 使用nn.Sequential按层顺序构建模型, 继承nn.Module基类构建自定义模型, 继承nn.Module基类构建模型并辅助应用模型容器进行封装, 叽里咕噜说什么呢, 此处选择使用最简单的nn.Sequential, 按层顺序构建模型.

```python
def create_net():
    net = nn.Sequential()
    net.add_module("linear1",nn.Linear(15,20))
    net.add_module("relu1",nn.ReLU())
    net.add_module("linear2",nn.Linear(20,15))
    net.add_module("relu2",nn.ReLU())
    net.add_module("linear3",nn.Linear(15,1))
    return net
```

中间层的20和15似乎都是随便取的.

`nn.Linear`表示全连接层/线性层, 把输入的每条样本作线性变换.

`nn.ReLu`是激活函数, 此处为Rectified Linear Unit(修正线性单元), 目的是给网络添加非线性, 让其能逼近任意函数, 虽然听起来很玄学.

## 训练模型

Pytorch通常需要用户编写自定义训练循环, 训练循环的代码风格因人而异.

有3类典型的训练循环代码风格:

- 脚本形式训练循环
- 函数形式训练循环
- 类形式训练循环

此处介绍一种较通用的仿照Keras风格的脚本形式的训练循环, 该脚本形式的训练代码与torchkeras库的核心代码基本一致.

看了一眼代码, 真tm长, 感觉真得给代码块加个折叠功能了.

```python
import os,sys,time
import numpy as np
import pandas as pd
import datetime 
from tqdm import tqdm 

import torch
from torch import nn 
from copy import deepcopy
from torchkeras.metrics import Accuracy


def printlog(info):
    nowtime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print("\n"+"=========="*8 + "%s"%nowtime)
    print(str(info)+"\n")
    

loss_fn = nn.BCEWithLogitsLoss() # 二分类交叉熵损失, md查资料查到的全是AI
optimizer= torch.optim.Adam(net.parameters(),lr = 0.005)	# Adam是谁?
metrics_dict = {"acc":Accuracy()}	# 计算准确率

epochs = 20 
ckpt_path='checkpoint.pt'

# early_stopping相关设置
monitor="val_acc"
patience=5
mode="max"

history = {}

for epoch in range(1, epochs+1):
    printlog("Epoch {0} / {1}".format(epoch, epochs))

    # 1，train -------------------------------------------------  
    net.train()	# 切换到训练模式
    total_loss,step = 0,0
    
    loop = tqdm(enumerate(dl_train), total =len(dl_train),file = sys.stdout)
    # tqdm画进度条
    train_metrics_dict = deepcopy(metrics_dict) 
    
    for i, batch in loop:
        features,labels = batch # features输入特征, labels真实标签
        # forward前向传播
        preds = net(features)	# 模型预测
        loss = loss_fn(preds,labels)	# 计算损失
        
        # backward反向传播
        loss.backward()	# 自动计算每个权重的梯度
        optimizer.step() # 根据梯度更新权重
        optimizer.zero_grad() # 清空梯度准备下一 batch

        # metrics
        step_metrics = {"train_"+name:metric_fn(preds, labels).item() 
                        for name,metric_fn in train_metrics_dict.items()}
        step_log = dict({"train_loss":loss.item()},**step_metrics)
        total_loss += loss.item()
        step+=1
        if i!=len(dl_train)-1:
            loop.set_postfix(**step_log)
        else:	# 处理最后一个batch
            epoch_loss = total_loss/step
            epoch_metrics = {"train_"+name:metric_fn.compute().item() 
                             for name,metric_fn in train_metrics_dict.items()}
            epoch_log = dict({"train_loss":epoch_loss},**epoch_metrics)
            loop.set_postfix(**epoch_log)

            for name,metric_fn in train_metrics_dict.items():
                metric_fn.reset()
                
    for name, metric in epoch_log.items():
        history[name] = history.get(name, []) + [metric]
        

    # 2，validate -------------------------------------------------
    net.eval()
    
    total_loss,step = 0,0
    loop = tqdm(enumerate(dl_val), total =len(dl_val),file = sys.stdout)
    
    val_metrics_dict = deepcopy(metrics_dict) 
    
    with torch.no_grad():
        for i, batch in loop: 

            features,labels = batch
            
            # 前向传播计算loss
            preds = net(features)
            loss = loss_fn(preds,labels)

            # metrics
            step_metrics = {"val_"+name:metric_fn(preds, labels).item() 
                            for name,metric_fn in val_metrics_dict.items()}

            step_log = dict({"val_loss":loss.item()},**step_metrics)

            total_loss += loss.item()
            step+=1
            if i!=len(dl_val)-1:
                loop.set_postfix(**step_log)
            else:	# 计算整个验证集指标
                epoch_loss = (total_loss/step)
                epoch_metrics = {"val_"+name:metric_fn.compute().item() 
                                 for name,metric_fn in val_metrics_dict.items()}
                epoch_log = dict({"val_loss":epoch_loss},**epoch_metrics)
                loop.set_postfix(**epoch_log)

                for name,metric_fn in val_metrics_dict.items():
                    metric_fn.reset()
                    
    epoch_log["epoch"] = epoch
    for name, metric in epoch_log.items():
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
    
dfhistory = pd.DataFrame(history)
```

## 评估模型

运行`print(dfhistory)`可以看到模型在训练集和验证集上的效果.

```
   train_loss  train_acc  val_loss   val_acc  epoch
0    0.474478   0.797753  0.459934  0.787709      1
1    0.455134   0.807584  0.434553  0.787709      2
2    0.455908   0.799157  0.429454  0.804469      3
3    0.446290   0.808989  0.413673  0.826816      4
4    0.457764   0.801966  0.420200  0.798883      5
5    0.451802   0.804775  0.420903  0.793296      6
6    0.452846   0.806180  0.443374  0.782123      7
7    0.448447   0.800562  0.430781  0.798883      8
8    0.438703   0.817416  0.426437  0.798883      9
```

## 使用模型

```python
# 预测概率
y_pred_probs = torch.sigmoid(net(torch.tensor(x_test[0:10]).float())).data

# 预测类别
y_pred = torch.where(y_pred_probs>0.5,
        torch.ones_like(y_pred_probs),torch.zeros_like(y_pred_probs))
```

## 保存模型

Pytorch有两种保存模型的方式, 都是通过调用pickle序列化方法实现的, 分别是只保存模型参数和保存完整模型. 推荐只保存模型参数, 否则可能在切换设备和目录的时候出现各种问题.

```python
print(net.state_dict().keys())

torch.save(net.state_dict(), "./data/net_parameter.pt")
net_clone = create_net()
net_clone.load_state_dict(torch.load("./data/net_parameter.pt",weights_only=True))
torch.sigmoid(net_clone.forward(torch.tensor(x_test[0:10]).float())).data
```

好的囫囵吞枣看完了, 但是这对我实在有点难了. 后悔没好好学习咯.

这才三颗星难度, 后面真得完蛋了.