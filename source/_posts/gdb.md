---
title: gdb调试ELF程序
date: 2025-06-29 16:48:15
tags: [CTF, reverse]
---
`run [args]` 运行并传参
`start` 运行到`main()`开头

`break func/地址` 在`func`函数或地址处设置断点
`delete` 删除断点
`info breakpoints` 查看断点

`info registers` 查看所有寄存器
`x/s 地址` 查看地址处字符串
`x/10xw 地址` 查看10个4字节的十六进制
`x/20i $rip` 查看当前附近的汇编指令
`info frame` 当前调用栈帧
`info locals` 查看局部变量(带符号)
`backtrace` 查看调用栈

`si` 逐汇编语句执行
`ni` 同上, 但不进入函数
`step` 逐C语句执行, 进入函数
`next` 逐C语句执行, 不进入函数
`finish` 执行至当前函数返回
`continue` 运行至下个断点

**x86_64 下函数参数位置**

| 参数  | 寄存器   |
| --- | ----- |
| a1  | `rdi` |
| a2  | `rsi` |
| a3  | `rdx` |
| a4  | `rcx` |
| a5  | `r8`  |
| a6  | `r9`  |
```
info registers rdi rsi   # 查看前两个参数的地址
x/s $rdi                 # 查看第一个参数指向的字符串
```

**搜索内存内容**

`search flag{`

`info functions` 查看所有函数
`disassemble func` 反汇编函数

`print varname` 查看变量
`p/x varname`  十六进制
`p/d varname` 十进制

**通用解**

IDA反汇编, 复制粘贴给GPT让它解决.