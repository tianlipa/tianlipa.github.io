---
title: 20天狂宴Pytorch-Day4
date: 2025-08-30 09:22:58
tags: [大模型, pytorch, USTC-MINE]
categories: 笔记
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

时间序列数据建模.

## 准备数据

通过继承torch.utils.data.Dataset实现自定义时间序列数据集.

torch.utils.data.Dataset是一个抽象类, 加载自定义数据只需要继承该类并覆写`__len__`方法返回数据集大小和`__getitem__`方法返回第i个样本即可.

<!--more-->

```python
import torch 
from torch import nn 
from torch.utils.data import Dataset,DataLoader,TensorDataset


# 用某日前8天窗口数据作为输入预测该日数据
WINDOW_SIZE = 8

class Covid19Dataset(Dataset):
        
    def __len__(self):
        return len(dfdiff) - WINDOW_SIZE
    
    def __getitem__(self, i):
        x = dfdiff.loc[i:i+WINDOW_SIZE-1,:]
        feature = torch.tensor(x.values)
        y = dfdiff.loc[i+WINDOW_SIZE,:]
        label = torch.tensor(y.values)
        return (feature,label)
    
ds_train = Covid19Dataset()

# 数据较小，可以将全部训练数据放入到一个batch中，提升性能
dl_train = DataLoader(ds_train,batch_size = 38)

for features,labels in dl_train:
    break 
    
# dl_train同时作为验证集
dl_val = dl_train
```

## 构建模型

继承nn.Module基类构建自定义模型.

```python
import torch
from torch import nn 
import importlib 
import torchkeras 
torch.random.seed()

class Block(nn.Module):
    def __init__(self):
        super(Block,self).__init__()
    
    def forward(self,x,x_input):
        x_out = torch.max((1+x)*x_input[:,-1,:],torch.tensor(0.0))
        return x_out
    
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        # 3层lstm
        self.lstm = nn.LSTM(input_size = 3,hidden_size = 3,num_layers = 5,batch_first = True)
        self.linear = nn.Linear(3,3)
        self.block = Block()
        
    def forward(self,x_input):
        x = self.lstm(x_input)[0][:,-1,:]
        x = self.linear(x)
        y = self.block(x,x_input)
        return y
        
net = Net()
print(net)
```

RNN: 循环神经网络, 每一步输出都依赖于前面的所有步骤, 但是虽然理论上可以处理任意长度信息, 实际存在梯度消失, 计算效率低等问题, 很难记住大量内容.

LSTM: 长短期记忆网络, 引入了输入门, 遗忘门, 输出门和记忆单元.

- 输入门: 决定输入多少新的信息
- 遗忘门: 决定丢弃多少旧的信息
- 输出门: 决定使用记忆中的哪一部分

summary如下.

```
--------------------------------------------------------------------------
Layer (type)                            Output Shape              Param #
==========================================================================
LSTM-1                                    [-1, 8, 3]                  480
Linear-2                                     [-1, 3]                   12
Block-3                                      [-1, 3]                    0
==========================================================================
Total params: 492
Trainable params: 492
Non-trainable params: 0
--------------------------------------------------------------------------
Input size (MB): 0.000076
Forward/backward pass size (MB): 0.000229
Params size (MB): 0.001877
Estimated Total Size (MB): 0.002182
--------------------------------------------------------------------------
```

## 训练模型

引入torchkeras中的KerasModel工具训练模型, 无需编写自定义循环.

注: 循环神经网络调试较为困难, 需要设置多个不同学习率多次尝试, 以取得较好的效果.

```python
from torchmetrics.regression import MeanAbsolutePercentageError

def mspe(y_pred,y_true):
    err_percent = (y_true - y_pred)**2/(torch.max(y_true**2,torch.tensor(1e-7)))
    return torch.mean(err_percent)

net = Net() 
loss_fn = mspe
metric_dict = {"mape":MeanAbsolutePercentageError()}

optimizer = torch.optim.Adam(net.parameters(), lr=0.01)
lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.0001)

from torchkeras import KerasModel 
keras_model = KerasModel(net,
       loss_fn = loss_fn,
       metrics_dict= metric_dict,
       optimizer = optimizer,
       lr_scheduler = lr_scheduler) 

dfhistory = keras_model.fit(train_data=dl_train,
            val_data=dl_val,
            epochs=100,
            ckpt_path='checkpoint',
            patience=10,
            monitor='val_loss',
            mode='min',
            callbacks=None,
            plot=True,
            cpu=True
            )
```

gamma改成1之后loss反而从0.5983降到了0.37左右, 理解不了是为什么. 反正就玄学吧.

## 评估和使用

此例数据较少, 仅可视化损失函数在训练集上的迭代情况.

使用模型预测疫情结束时间, 即新增确诊病例为0的时间.

```python
# 使用dfresult记录现有数据以及此后预测的疫情数据
dfresult = dfdiff[["confirmed_num","cured_num","dead_num"]].copy()
dfresult.tail()

# 预测此后1000天的新增走势,将其结果添加到dfresult中
for i in range(1000):
    arr_input = torch.unsqueeze(torch.from_numpy(dfresult.values[-38:,:]),axis=0)
    arr_predict = keras_model.forward(arr_input)

    dfpredict = pd.DataFrame(torch.floor(arr_predict).data.numpy(),
                columns = dfresult.columns)
    dfresult = pd.concat([dfresult,dfpredict],ignore_index=True)

dfresult.query("confirmed_num==0").head()
dfresult.query("cured_num==0").head()
```

仔细一看发现不仅相同参数跑出来的每次loss都不一样, 预测结果也是差的离谱, 有时候能两个月内终结病毒, 有时候能三年内解决不了病毒, 有时候能新增确诊为0但是新增治愈为inf, 治未病说是.