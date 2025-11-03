---
title: math-analysis
date: 2025-10-16 21:20:46
tags: 笔记
---

### 数列极限

#### 收敛数列的性质

极限唯一

改变数列的有限项, 不改变其敛散性和极限值

收敛数列必有界

#### 定理

$若\{a_n\}的极限是a, a>l, 则对充分大的n, 有a_n>l.$

$若对充分大的n有a_n\geq l, 则a\geq l.$ 注意, 大于不成立.

极限可四则运算.

$若a_n\geq b_n, 则a\geq b.$

$若a>b, 则对充分大的n, 有a_n>b_n.$ 注意, 大于等于不成立.

$a_n \to a, b_n \to a, a_n\leq c_n \leq b_n, 则c_n \to a.$

例: 求$\lim_{n \to \infty } \sqrt{1+\frac{1}{n^\alpha } } (\alpha >0) $

解: $1<\sqrt{1+\frac{1}{n^\alpha }}<1+\frac{1}{n^\alpha}。$

例: 求$\lim_{n \to \infty } (\frac{1}{ \sqrt[]{n^2+1}}+\frac{1}{ \sqrt[]{n^2+2}}+\cdots +\frac{1}{ \sqrt[]{n^2+n}} )  $

解: 大于n倍最小值, 小于n倍最大值.

例: 求$\lim_{n \to \infty }\sqrt[n]{n}  $

解: 设$\sqrt[n]{n} = 1+\lambda_n$,

有$n = (1+\lambda_n)^n>1+n\lambda_n$, 得$\lambda_n<1-\frac{1}{n}$

发现太松了, 于是多保留一项, 有

$n>1+\frac{n(n-1)}{2}\lambda_n^2$, 得$\lambda_n<\sqrt{\frac{2}{n}}$.

炫技解法:
$$
1\leq \sqrt[n]{n} = \sqrt[n]{\sqrt{n} \cdot \sqrt{n}\cdot 1\cdot 1\cdot \cdots \cdot 1}<\frac{\sqrt{n}+\sqrt{n}+n-2}{n}\to 1
$$

#### 子列

$a_n收敛于a\Leftrightarrow 其任意子列收敛于a.$