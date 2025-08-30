---
title: 20天狂宴Pytorch-Day3
date: 2025-08-29 09:44:17
tags: [大模型, pytorch, USTC-MINE]
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

文本数据建模.

配环境配了一上午, gensim需要`scipy<1.14.0,>=1.7.0`, 没有对应的wheel, pip决定下载源码自己编译, 然后报了个网上搜不到的罕见错误, 升级了两遍我的MinGW, 从网上下了个patch.exe, 装了个MSYS2, 试图装了pkg-config和openblas, 还把之前卸掉的visual studio装了回来, 最后还是没搞好.

然后发现是python版本不兼容导致没有wheel, 换到python3.10马上就好了. 吃大份去吧.

<!--more-->

## 准备数据

imdb数据集的目标是根据电影评论的文本内容预测评论的情感标签, 训练集有20000条电影评论文本, 测试集有5000条电影评论文本, 其中正面评论和负面评论各占一半.

这里使用gensim中的词典工具, 自定义Dataset.

```python
from gensim import corpora
import string

# 去掉标点符号, 把句子按空格分成单词
def textsplit(text):
    translator = str.maketrans('', '', string.punctuation)
    words = text.translate(translator).split(' ')
    return words
        
# 构建词典
# gensim的Dictionary会统计文本中的所有单词, 给每个单词一个唯一编号
vocab = corpora.Dictionary((textsplit(text) for text in dftrain['text']))
vocab.filter_extremes(no_below=5,no_above=5000)
special_tokens = {'<pad>': 0, '<unk>': 1}
vocab.patch_with_special_tokens(special_tokens)
vocab_size = len(vocab.token2id) 
print('vocab_size = ',vocab_size)

# 序列填充
# 深度学习中, 模型一般需要固定长度的输入, 因此需要用<pad>填充或截断
def pad(seq,max_length,pad_value=0):
    n = len(seq)
    result = seq+[pad_value]*max_length
    return result[:max_length]


# 编码转换
def text_pipeline(text):
    tokens = vocab.doc2idx(textsplit(text))
    tokens = [x if x>0 else special_tokens['<unk>']  for x in tokens ]
    result = pad(tokens,MAX_LEN,special_tokens['<pad>'])
    return result 

print(text_pipeline("this is an example!")) 


# 构建数据管道
from torch.utils.data import Dataset,DataLoader

class ImdbDataset(Dataset):
    def __init__(self,df):
        self.df = df
    def __len__(self):
        return len(self.df)
    def __getitem__(self,index):
        text = self.df["text"].iloc[index]
        label = torch.tensor([self.df["label"].iloc[index]]).float()
        tokens = torch.tensor(text_pipeline(text)).int() 
        return tokens,label

ds_train = ImdbDataset(dftrain)
ds_val = ImdbDataset(dfval)

dl_train = DataLoader(ds_train,batch_size = 50,shuffle = True)
dl_val = DataLoader(ds_val,batch_size = 50,shuffle = False)
```

## 建立模型

Pytorch通常有三种方式构建模型: 使用nn.Sequential按层顺序构建模型, 继承nn.Module基类构建自定义模型, 继承nn.Module基类构建模型并辅助应用模型容器进行封装, 此处选用继承nn.Module构建模型并辅助应用模型容器(nn.Sequential, nn.ModuleList, nn.ModuleDict)进行封装.

```python
import torch
from torch import nn 
torch.manual_seed(42)

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        
        # 嵌入层, 把句子转换为矩阵
        # 设置padding_idx参数后将在训练过程中将填充的token始终赋值为0向量
        self.embedding = nn.Embedding(num_embeddings = vocab_size,embedding_dim = 3,padding_idx = 0)
        
        # 卷积层, 用卷积提取特征, 并用池化层放大
        self.conv = nn.Sequential()
        self.conv.add_module("conv_1",nn.Conv1d(in_channels = 3,out_channels = 16,kernel_size = 5))
        self.conv.add_module("pool_1",nn.MaxPool1d(kernel_size = 2))
        self.conv.add_module("relu_1",nn.ReLU())
        self.conv.add_module("conv_2",nn.Conv1d(in_channels = 16,out_channels = 128,kernel_size = 2))
        self.conv.add_module("pool_2",nn.MaxPool1d(kernel_size = 2))
        self.conv.add_module("relu_2",nn.ReLU())
        
        # 全连接层
        self.dense = nn.Sequential()
        # 把卷积的输出摊平成一个长向量
        self.dense.add_module("flatten",nn.Flatten())
        # 把摊平后的向量压缩到一个线性值, 6144是摊平后的长度
        self.dense.add_module("linear",nn.Linear(6144,1))

    def forward(self,x):
        x = self.embedding(x).transpose(1,2)
        x = self.conv(x)
        y = self.dense(x)
        return y
        
net = Net() 
print(net)
```

模型summary如下.

```
--------------------------------------------------------------------------
Layer (type)                            Output Shape              Param #
==========================================================================
Embedding-1                             [-1, 200, 3]               89,772
Conv1d-2                               [-1, 16, 196]                  256
MaxPool1d-3                             [-1, 16, 98]                    0
ReLU-4                                  [-1, 16, 98]                    0
Conv1d-5                               [-1, 128, 97]                4,224
MaxPool1d-6                            [-1, 128, 48]                    0
ReLU-7                                 [-1, 128, 48]                    0
Flatten-8                                 [-1, 6144]                    0
Linear-9                                     [-1, 1]                6,145
==========================================================================
Total params: 100,397
Trainable params: 100,397
Non-trainable params: 0
--------------------------------------------------------------------------
Input size (MB): 0.000076
Forward/backward pass size (MB): 0.287788
Params size (MB): 0.382984
Estimated Total Size (MB): 0.670849
--------------------------------------------------------------------------
```

## 训练模型

代码和前几次基本一模一样就不放了, 我本来以为每个模型都要捯饬一遍, 合着是套模板的, 草.

## 评估模型

似乎是过拟合了, val_acc并不高.

```python
%matplotlib inline
%config InlineBackend.figure_format = 'svg'
import matplotlib.pyplot as plt

def plot_metric(dfhistory, metric):
    train_metrics = dfhistory["train_"+metric]
    val_metrics = dfhistory['val_'+metric]
    epochs = range(1, len(train_metrics) + 1)
    plt.plot(epochs, train_metrics, 'bo--')
    plt.plot(epochs, val_metrics, 'ro-')
    plt.title('Training and validation '+ metric)
    plt.xlabel("Epochs")
    plt.ylabel(metric)
    plt.legend(["train_"+metric, 'val_'+metric])
    plt.show()
```

## 使用和保存模型

```python
def predict(net,dl):
    net.eval()
    with torch.no_grad():
        result = nn.Sigmoid()(torch.cat([net.forward(t[0]) for t in dl]))
    return(result.data)

net_clone = Net()
net_clone.load_state_dict(torch.load('checkpoint',weights_only=True))
```

## 总结

感觉得写个总结, 不然就是看一遍代码什么都没干.

文本模型的数据预处理包括:

1. 去掉标点符号, 按空格分成单词
2. 构建词典, 给每个词一个token
3. 添加`<unk>`和`<pad>`的对应token
4. padding填充/切割成固定长度
5. 构造数据管道, 便于把数据喂给模型

对处理文本的模型, 主要结构有:

1. 嵌入层, 把token映射成向量, 把文本转换成矩阵
2. 卷积层和池化层, 卷积类似小窗口提取关键特征, 池化压缩并保留重要信息
3. 全连接层, 把卷积输出结果摊平成一个向量, 再把这个向量加权组合左右特征, 计算得到最终结果