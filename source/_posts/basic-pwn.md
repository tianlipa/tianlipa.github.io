---
title: Pwn 入门
date: 2026-05-20 20:04:17
tags: [笔记, CTF, pwn]
categories: 笔记
---

例如这个程序:

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
void shell() { system("/bin/sh"); }
void init() {
    setbuf(stdin, NULL);
    setbuf(stdout, NULL);
    setbuf(stderr, NULL);
}
void menu() {
    puts("=== Bikini Bottom Snack Machine ===");
    puts("1. Talk to SpongeBob");
    puts("2. Order Jumbo Krabby Patty");
    puts("3. Exit");
    printf("> ");
}
void vuln() {
    char note[32];
    int cnt;
    puts("How many kelp slices do you want? (4 max)");
    scanf("%d", &cnt);
    if(cnt < 0){
        puts("Wrong slices");
    }
    cnt = cnt + 1;
    if(cnt < 0){
        shell();
    };
}
int main() {
    int c;
    init();
    puts("Welcome to Bikini Bottom!");
    while (1) {
        menu();
        scanf("%d", &c);
        getchar();
        if (c == 1) puts("Do you want to get some some some some some?");
        else if (c == 2) vuln();
        else break;
    }
    return 0;
}
```

<!--more-->

对应的pwntools脚本如下:

```python
from pwn import *
# 配置当前代码运⾏环境：OS = "Linux"，代表在Linux环境下运⾏
# arch: 主要分为 "amd64" 和 "i386",
# i386 和 amd64 是两种主要的 x86 处理器架构版本，核⼼区别在于位数和性能：i386 是 32 位架构
# log_level: 主要分为 info、debug、warn、error
context.update(os = "Linux", arch = "amd64", log_level = "debug")
# 本地运⾏使⽤ process("file_path") 
# 如果是远程运⾏，则换为 remote(HOST, POST)
# p = remote("127.0.0.1", 8080)
p = process("./challenge_1")
# 接收字节流 直到""的出现
p.recvuntil(b"> ")
# 发送⼀⾏内容，!!! 会在具体 content 后⾯补 b"\n" !!!
p.sendline(b"2")
p.recvuntil(b"(4 max)\n")
p.sendline(b"2147483647")
# 进⼊ terminal 交互模式
p.interactive()
```

当然你直接输入2然后输入2147483647也可以.

## 基础知识

### x86_64 常见寄存器

#### RIP (Instruction Pointer - 指令指针寄存器)

存放下一条将要执行的指令的内存地址.

劫持 RIP 就等于控制了整个程序. 栈溢出漏洞的本质就是通过覆盖栈上的返回地址, 让程序在执行 ret 指令时, 把我们伪造的地址弹进 RIP, 从而跳转到恶意代码.

#### RSP (Stack Pointer - 栈指针寄存器)

永远指向当前栈顶的内存地址.

栈通常从高地址向低地址增长, 所以压栈后 rsp 往往会减小, 出栈后 rsp 会增大.

例如:

```com
push rax
```

这条指令做了两件事:

1. rsp = rsp - 8
2. 把 rax 的值写到 [rsp]

#### RBP (Base Pointer - 栈基址指针)

通常作为栈基指针寄存器使用, 指向当前函数栈帧的底部.

很多函数的开头是:

```
push rbp
mov rbp, rsp
sub rsp, 0x20
```

含义是:

1. 把旧的rbp压栈保存
2. 让新的rbp指向当前栈帧基址
3. 给局部变量在栈上开0x20字节的空间

#### rdi, rsi, rdx, rcx, r8, r9

依次存放前六个整数或指针类型参数.

#### rax (Accumulator Register - 累加寄存器)

用于存放返回值, 某些场景中也参与运算, 作为默认累加器使用.

#### rbx

通用寄存器, 没有固定语义, 用于临时保存数据.

#### eflags

记录运算结果状态, 例如是否为0, 是否进位, 是否为负, 是否溢出.

### x86_64 常见汇编指令

#### mov

数据传送. 方括号表示取对应内存.

#### lea (Load Effective Address)

用于计算地址, 例如rbp = 0x7fffffffe000, 则

```
lea rax, [rbp-0x20]
```

执行后, rax = 0x7fffffffdfe0. 一般来说第二个操作数都是需要带方括号的.

#### add, sub

加减法.

#### inc, dec

加减1.

#### cmp

比较两个操作数, 本质是做一次减法但不保存结果, 只改变标志位.

#### test

按位与, 不保存结果, 只改变标志位.

常见用途包括使用

```
test eax, eax
```

判断eax是否为0, 若为0则零标志被置位.

#### 条件跳转指令

- je/jz: 相等则跳转
- jne/jnz: 不相等则跳转
- jg/jl: 大于/小于则跳转
- jge/jle: 大于等于/小于等于则跳转

例如:

```
cmp eax, 4
jg 0x401220
```

若 eax > 4, 则跳到这个地址.

#### jmp

无条件跳转.

#### call

调用函数. 把返回地址压栈, 然后跳到对应函数执行.

#### ret

函数返回, 把栈顶的8字节取出, 放入rip, 然后继续执行.

这也是为什么覆盖栈上的返回地址就能劫持控制流.

#### push/pop

push rbp: rsp -= 8, 然后把rbp写到[rsp]

pop rbp: 先把[rsp]读入rbp, 然后rsp += 8

#### leave

函数尾声指令, 等价于:

```
mov rsp, rbp
pop rbp
```

销毁当前栈帧, 把栈恢复到函数进入前的状态, 然后通常接一个 ret 返回.

