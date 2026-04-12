---
title: 6-文件包含漏洞
date: 2025-08-13 13:43:25
tags: [CTF, web, 马士兵]
categories: 笔记
---

## 简介

### 本地文件包含(LFI, Local File Inclusion)

目录遍历漏洞/文件任意访问漏洞
通过接口动态包含
可用于包含恶意代码或图片马
包含敏感文件

### 远程文件包含(RFI, Remote File Inclusion)


| 漏洞 | 描述            | 原因                                  | 后果                                                         |
| ---- | --------------- | ------------------------------------- | ------------------------------------------------------------ |
| XXE  | XML外部实体注入 | 使用XML传输数据，并且允许解析外部实体 | 导致访问敏感文件，探测端口，执行系统命令等                   |
| SSRF | 服务顿请求伪造  | 使用了curl_exec()之类的函数           | 导致端口扫描，攻击内网主机，绕过防火墙，获取敏感信息，访问大文件造成内存溢出，操作Redis等问题 |
| RFI  | 远程文件包含    | 使用了include                         | 导致任意文件访问，包含shell代码                              |

需要配置php.ini:
allow_url_fopen=On
allow_url_include=On

<!--more-->

## PHP相关函数和伪协议

| 函数              | 作用                      |
| ----------------- | ------------------------- |
| include()         | 包含并运行指定文件        |
| include_once()    | 只包含一次，不重复包含    |
| require()         | 同include，但出错时会停止 |
| require_once()    | 同                        |
| fopen()           | 打开文件或url             |
| readfile          | 读取文件并写入到输出缓冲  |
| highlight_file    | 语法高亮一个文件          |
| file_get_contents | 将整个文件读入一个字符串  |
| file              | 把整个文件读入一个数组    |

### PHP伪协议
![](media/17385011252030.png)

php://filter可以作为中间流处理其他流，例如php://filter/resource=/flag

?url=/etc/passwd测试是否能访问文件
?url=/var/log/nginx/access.log查看日志
日志注入

## 文件包含漏洞挖掘与利用

### URL关键字

URL参数名出现了page file filename include等关键字
URL参数值出现了文件名，如xxx.php xxx.html

如：
?file=content
?page=abc.asp
?home=abc.html

### 利用流程

发现漏洞，上传shell/读取敏感文件(FUZZ)，执行恶意代码

自动工具：
LFI Suite