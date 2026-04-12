---
title: 20天狂宴Pytorch-Day5
date: 2025-08-31 23:46:00
tags: [大模型, pytorch, USTC-MINE]
categories: 笔记
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

张量的基本概念.

## 数据类型

张量的数据类型(dtype)基本和`numpy.array`一致, 但不支持str类型. 包括:

```python
torch.float64(torch.double),
torch.float32(torch.float),
torch.float16,
torch.int64(torch.long),
torch.int32(torch.int),
torch.int16,
torch.int8,
torch.uint8,
torch.bool
```

一般使用`torch.float32`类型.

<!--more-->

```python
i = torch.tensor(1, dtype=torch.int32)
x = torch.tensor(2.0, dtype=torch.double)

i = torch.IntTensor(1) # torch.int32
x = torch.Tensor(np.array(2.0)) # 等价于torch.FloatTensor, torch.float32
b = torch.BoolTensor(np.array([1,0,2,0])) # 非零为True, torch.bool

i = torch.tensor(1)
x = i.float()	# 调用float方法转换成浮点类型
y = i.type(torch.float)	# 使用type函数转换成浮点类型
z = i.type_as(x)	# 使用type_as方法转换成某个Tensor相同类型
```

## 张量的维度

标量0维, 向量1维, 矩阵2维, 彩色图像有RGB三维, 可以用3维张量表示, 视频还有时间维, 可以用4维.

省流: 有几层中括号就是几维.

```python
tensor3 = torch.tensor([[[1.0,2.0],[3.0,4.0]],[[5.0,6.0],[7.0,8.0]]])	# 3维张量
print(tensor3)
print(tensor3.dim())

tensor4 = torch.tensor([[[[1.0,1.0],[2.0,2.0]],[[3.0,3.0],[4.0,4.0]]],
                        [[[5.0,5.0],[6.0,6.0]],[[7.0,7.0],[8.0,8.0]]]])	# 4维张量
print(tensor4)
print(tensor4.dim())
```

## 张量的尺寸

可以使用shape属性或size()方法查看张量在每一维的长度, 使用view方法或reshape方法改变张量的尺寸.

```python
vector = torch.arange(0,12)
print(vector)
print(vector.shape)

matrix34 = vector.view(3,4)
print(matrix34)
print(matrix34.shape)

matrix43 = vector.view(4,-1) # -1表示我懒得算, 让python给我算
print(matrix43)
print(matrix43.shape)
```

view要求数据是连续存放的, 转置等操作后, 数据不再连续存放, 可以使用reshape方法.

```python
matrix26 = torch.arange(0,12).view(2,6)
print(matrix26)
print(matrix26.shape)
matrix62 = matrix26.t()
print(matrix62.is_contiguous())

matrix34 = matrix62.reshape(3,4) #等价于matrix34 = matrix62.contiguous().view(3,4)
print(matrix34)
```

## 张量和numpy数组

可以用numpy方法从张量得到numpy数组, 也可以用`torch.from_numpy`从numpy数组得到张量. 这样得到的张量和数组共享内存, 改变其中一个, 另一个也会改变. 可以通过clone方法中断这种改变.

可以用item方法从标量张量得到对应数值, 通过tolist方法从张量得到对应的数值列表.

```python
arr = np.zeros(3)
tensor = torch.from_numpy(arr)
print(arr)
print(tensor)

np.add(arr,1, out = arr)
print(arr)
print(tensor)

tensor = torch.zeros(3)
arr = tensor.numpy()
print(tensor)
print(arr)


# 带下划线的方法表示计算结果会返回给调用张量
tensor.add_(1)	# 或torch.add(tensor, 1, out=tensor)
print(tensor)
print(arr)


tensor = torch.zeros(3)
arr = tensor.clone().numpy() # 或tensor.data.numpy()


# item方法和tolist方法可以将张量转换成python数值和数值列表
scalar = torch.tensor(1.0)
s = scalar.item()
print(s)
print(type(s))
tensor = torch.rand(2, 2)
t = tensor.tolist()
print(t)
print(type(t))
```

