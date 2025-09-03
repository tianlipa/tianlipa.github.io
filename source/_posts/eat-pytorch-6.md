---
title: 20天狂宴Pytorch-Day6
date: 2025-09-01 23:38:45
tags: [大模型, pytorch, USTC-MINE]
---

[GitHub链接](https://github.com/lyhue1991/eat_pytorch_in_20_days)

自动微分机制.

神经网络通常依赖反向传播求梯度来更新网络参数, 求梯度过程通常复杂且易出错, 而深度学习框架可以帮我们自动求梯度.

Pytorch一般通过反向传播方法求梯度, 该方法求得的梯度存在对应自变量张量的grad属性下, 也可以调用`torch.autograd.grad`函数求梯度.

<!--more-->

## backward方法求导数

backward方法通常在一个标量张量上调用, 该方法求得的梯度将存在对应自变量张量的grad属性下. 如果调用的张量不是标量, 则需要传入一个和它同形状的gradient参数张量, 用gradient和调用张量作向量点乘, 得到的结果再求梯度.

```python
# 标量的反向传播

# f(x) = a*x**2 + b*x + c

x = torch.tensor(0.0,requires_grad = True) # x需要被求导
a = torch.tensor(1.0)
b = torch.tensor(-2.0)
c = torch.tensor(1.0)
y = a*torch.pow(x,2) + b*x + c 

y.backward()
dy_dx = x.grad
print(dy_dx)


# 非标量的反向传播

x = torch.tensor([[0.0,0.0],[1.0,2.0]],requires_grad = True)
a = torch.tensor(1.0)
b = torch.tensor(-2.0)
c = torch.tensor(1.0)
y = a*torch.pow(x,2) + b*x + c 

gradient = torch.tensor([[1.0,1.0],[1.0,1.0]])

print("x:\n",x)
print("y:\n",y)
y.backward(gradient = gradient)
x_grad = x.grad
print("x_grad:\n",x_grad)

# 用标量的反向传播实现非标量的反向传播

x = torch.tensor([[0.0,0.0],[1.0,2.0]],requires_grad = True)
a = torch.tensor(1.0)
b = torch.tensor(-2.0)
c = torch.tensor(1.0)
y = a*torch.pow(x,2) + b*x + c 

gradient = torch.tensor([[1.0,1.0],[1.0,1.0]])
z = torch.sum(y*gradient)

print("x:",x)
print("y:",y)
z.backward()
x_grad = x.grad
print("x_grad:\n",x_grad)
```

## autograd.grad方法求导数

```python
x = torch.tensor(0.0,requires_grad = True)
a = torch.tensor(1.0)
b = torch.tensor(-2.0)
c = torch.tensor(1.0)
y = a*torch.pow(x,2) + b*x + c

# create_graph设置为True, 允许创建更高阶的导数 
dy_dx = torch.autograd.grad(y,x,create_graph=True)[0]
print(dy_dx.data)

# 求二阶导数
dy2_dx2 = torch.autograd.grad(dy_dx,x)[0] 

print(dy2_dx2.data)
```

`torch.autograd.grad`方法返回的是一个元组, 所以要加[0]取第一个元素.

```python
x1 = torch.tensor(1.0,requires_grad = True) # x需要被求导
x2 = torch.tensor(2.0,requires_grad = True)
y1 = x1*x2
y2 = x1+x2

# 允许同时对多个自变量求导数
(dy1_dx1,dy1_dx2) = torch.autograd.grad(outputs=y1,inputs = [x1,x2],retain_graph = True)
print(dy1_dx1,dy1_dx2)

# 如果有多个因变量，相当于把多个因变量的梯度结果求和
(dy12_dx1,dy12_dx2) = torch.autograd.grad(outputs=[y1,y2],inputs = [x1,x2])
print(dy12_dx1,dy12_dx2)
```

## 利用自动微分和优化器求最小值

```python
x = torch.tensor(0.0,requires_grad = True)
a = torch.tensor(1.0)
b = torch.tensor(-2.0)
c = torch.tensor(1.0)

optimizer = torch.optim.SGD(params=[x],lr = 0.01)

def f(x):
    result = a*torch.pow(x,2) + b*x + c 
    return(result)

for i in range(500):
    optimizer.zero_grad()
    y = f(x)
    y.backward()
    optimizer.step()

print("y=",f(x).data,";","x=",x.data)
```

SGD为Stochastic Gradient Descent随机梯度下降优化器, 用一个样本或小批量算梯度, 用于逼近最小值.