---
title: 20天狂宴Pytorch-Day9
date: 2025-09-06 22:17:27
tags: [大模型, pytorch, USTC-MINE]
categories: 笔记
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

张量的结构操作.

## 创建张量

张量的创建方法类似numpy中创建array的方法.

<!--more-->

```python
a = torch.tensor([1,2,3],dtype = torch.float)
b = torch.arange(1,10,step = 2)
c = torch.linspace(0.0,2*3.14,10)
d = torch.zeros((3,3))

a = torch.ones((3,3),dtype = torch.int)
b = torch.zeros_like(a,dtype = torch.float)

torch.fill_(b,5)

# 均匀随机分布
torch.manual_seed(42)
minval,maxval = 0, 10
a = minval + (maxval-minval)*torch.rand([5])

# 正态分布随机
b = torch.normal(mean = torch.zeros(3,3), std = torch.ones(3,3))

# 正态分布随机
mean,std = 2, 5
c = std*torch.randn((3,3)) + mean

# 整数随机排列
d = torch.randperm(20)

# 特殊矩阵
I = torch.eye(3,3) # 单位矩阵
print(I)
t = torch.diag(torch.tensor([1,2,3])) # 对角矩阵
```

## 索引切片

几乎和numpy相同, 切片时支持缺省参数和省略号, 可以通过索引和切片对部分元素进行修改.

对于不规则的切片提取, 可以使用`torch.index_select`, `torch.masked_select`, `torch.take`.

如果要通过修改张量的某些元素得到新的张量, 可以使用`torch.where`, `torch.masked_fill`, `torch.index_fill`.

```python
# 均匀随机分布
torch.manual_seed(42)
minval,maxval = 0, 10
t = torch.floor(minval + (maxval-minval)*torch.rand([5,5])).int()


print(t[0])	# 第0行
print(t[-1])	# 倒数第1行

# 第1行第3列
print(t[1,3])
print(t[1][3])

print(t[1:4,:])	# 第1行至第3行

# 使用索引和切片修改部分元素
x = torch.Tensor([[1,2],[3,4]])
x.data[1,:] = torch.tensor([0.0,0.0])

a = torch.arange(27).view(3,3,3)

print(a[...,1])	# 省略号可以表示多个冒号
```

对于不规则的切片提取, 可以使用`torch.index_select`, `torch.masked_select`, `torch.take`.

有4个班级, 每个班级5个学生, 每个学生7门科目成绩, 可以用一个4×5×7的张量来表示.

```python
minval = 0
maxval = 100
scores = torch.floor(minval + (maxval-minval)*torch.rand([4,5,7])).int()

# 抽取每个班级第0个学生, 第2个学生, 第4个学生的全部成绩
torch.index_select(scores,dim = 1,index = torch.tensor([0,2,4]))

# 抽取每个班级第0个学生, 第2个学生, 第4个学生的第1门课程, 第3门课程, 第6门课程成绩
q = torch.index_select(torch.index_select(scores,dim = 1,index = torch.tensor([0,2,4])),dim=2,index = torch.tensor([1,3,6]))

# 抽取第0个班级第0个学生的第0门课程, 第2个班级的第3个学生的第1门课程, 第3个班级的第4个学生第6门课程成绩
# take将输入看成一维数组，输出和index同形状
s = torch.take(scores,torch.tensor([0*5*7+0,2*5*7+3*7+1,3*5*7+4*7+6]))

# 抽取大于等于80分的分数(布尔索引)
# 结果是1维张量
g = torch.masked_select(scores,scores>=80)

# 如果分数大于60分, 赋值成1, 否则赋值成0
ifpass = torch.where(scores>60,torch.tensor(1),torch.tensor(0))

# 将每个班级第0个学生, 第2个学生, 第4个学生的全部成绩赋值成满分
torch.index_fill(scores,dim = 1,index = torch.tensor([0,2,4]),value = 100)
# 等价于 scores.index_fill(dim = 1,index = torch.tensor([0,2,4]),value = 100)

# 将分数小于60分的分数赋值成60分
b = torch.masked_fill(scores,scores<60,60)
# 等价于 b = scores.masked_fill(scores<60,60)
```

## 维度变换

相关函数有`torch.reshape`(改变形状, 或者调用张量的view方法), `torch.squeeze`(减少维度), `torch.unsqueeze`(增加维度), `torch.transpose/torch.permute`(交换维度).

```python
torch.manual_seed(0)
minval,maxval = 0,255
a = (minval + (maxval-minval)*torch.rand([1,3,3,2])).int()
b = a.view([3,6])	# torch.reshape(a,[3,6])
c = torch.reshape(b,[1,3,3,2])	# b.view([1,3,3,2])
```

如果张量在某个维度上只有一个元素, 利用torch.squeeze可以消除这个维度. torch.unsqueeze作用相反.

```python
a = torch.tensor([[1.0,2.0]])
s = torch.squeeze(a)
d = torch.unsqueeze(s,axis=0)
```

torch.transpose可以交换张量的维度, 常用于图片存储格式变换.

如果是二维矩阵, 通常会调用矩阵的转置方法`matrix.t()`, 等价于`torch.transpose(matrix,0,1)`.

```python
minval=0
maxval=255
# Batch,Height,Width,Channel
data = torch.floor(minval + (maxval-minval)*torch.rand([100,256,256,4])).int()

# 转换成Pytorch默认的图片格式 Batch,Channel,Height,Width 
# 需要交换两次
data_t = torch.transpose(torch.transpose(data,1,2),1,3)
print(data_t.shape)

data_p = torch.permute(data,[0,3,1,2]) #对维度的顺序做重新编排
```

## 合并分割

可以用torch.cat方法和torch.stack方法将多个张量合并, 可以用torch.split方法把一个张量分割成多个张量.

torch.cat是连接, 不会增加维度, torch.stack是堆叠, 会增加维度.

```python
a = torch.tensor([[1.0,2.0],[3.0,4.0]])
b = torch.tensor([[5.0,6.0],[7.0,8.0]])
c = torch.tensor([[9.0,10.0],[11.0,12.0]])

abc_cat = torch.cat([a,b,c],dim = 0)
abc_stack = torch.stack([a,b,c],axis = 0)	# torch中dim和axis参数名可以混用

torch.cat([a,b,c],axis = 1)
torch.stack([a,b,c],axis = 1)
```

torch.split是torch.cat的逆运算, 可以指定分割份数平均分割, 也可以通过指定每份的记录数量进行分割.

```python
a,b,c = torch.split(abc_cat,split_size_or_sections = 2,dim = 0)	# 每份2个进行分割
p,q,r = torch.split(abc_cat,split_size_or_sections =[4,1,1],dim = 0)	# 每份分别为[4,1,1]
```