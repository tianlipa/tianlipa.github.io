---
title: 7-SSRF漏洞
date: 2025-08-13 13:44:18
tags: [CTF, web, 马士兵]
---

php curl扩展：
获取网页资源，爬虫
webservice, 获取接口数据
FTP, 下载文件
php.ini extension=php_curl.dll

SSRF: Server-Side Request Forgery, 服务端请求伪造，由攻击者构造形成由服务端发起请求的一种安全漏洞。

危害：
- 扫描资产
- 获取敏感信息
- 绕过防火墙攻击内网服务器
- 访问大文件造成溢出
- 通过Redis写入WebShell或建立反弹连接

可能导致SSRF漏洞的函数：
curl_exec(): 执行cURL会话
file_get_contents(): 将整个文件读入为一个字符串
fsockopen(): 打开一个网络连接或一个Unix套接字连接

<!--more-->

### curl协议

file: 查看文件，curl -v ‘file:///etc/passwd’

dict: 探测端口，http://localhost/ssrf/ssrf1.php?url=dict://127.0.0.1:3306

gopher: 反弹shell

gopher协议发送POST请求：
1. 写好POST请求
2. 进行一次URL编码
3. 把%0A全部替换为%0D%0A, 我也不知道为什么
4. 再进行一次URL编码，因为服务器收到请求时会解码一次，curl会再解码一次
5. /?url=gopher://127.0.0.1:80/_POST%2520…

### 检测工具

SSRF-Testing
SSRFmap
Gopherus
ssrf_proxy

### 防御
禁用协议
限制请求端口
设置URL白名单
过滤返回信息
统一错误信息

----

Server Side Request Forgery, 服务端请求伪造，通过构造数据进而伪造服务端发起请求的漏洞。因为请求是由服务端内部发起的，所以一般情况下SSRF的目标往往是从外网无法访问的内部系统。

SSRF漏洞形成的原理多是服务端提供了从外部服务获取数据的功能，但没有对目标的地址、协议等重要参数进行过滤和限制，从而导致可以自由构造参数，发起预期外的请求。

![](/img/msb/17378583293736.png)

![](/img/msb/17378586215344.png)

常见文件路径：

- /etc/passwd: 几乎所有linux发行版都包含的文件，可用于判断能否读取本地文件，同时保存了系统中有哪些用户
- /ect/apache2/*: apache2的配置文件，可得知web目录，开放端口等信息
- /etc/issue: 一般表示该系统是什么linux发行版
- /proc: 存放系统运行的状态信息，其中含有以pid命名的文件夹，保存着这个进程的信息，还有一个self软连接指向当前运行的进程
- /proc/[pid]/cmdline: 程序运行的命令行
- /proc/[pid]/env: 程序运行的环境变量
- /proc/[pid]/fd/*: 程序打开的文件
- /proc/net: 系统的网络状态信息