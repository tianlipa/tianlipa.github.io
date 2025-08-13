---
title: 1-信息收集
date: 2025-08-13 13:29:51
tags: [CTF, web, 马士兵]
---

## 域名信息收集

### whois

- whois查询
- whois反查
- kali中的whois命令
- 隐私保护
- icp备案查询

### 子域名

- 字典猜解
- 枚举

子域名挖掘：
- layer
- subDomainsBurute

<!--more-->

### 域名解析信息(DNS: Domain Name Server)

记录类型：
- A：将域名指向一个IPv4地址
- CNAME：别名记录，将域名指向另一个域名地址
- MX：用于邮件服务器
- TXT：可填写附加文本信息
- NS：域名服务器记录，可将指定域名交由其他DNS服务商解析管理
- AAAA：将域名指向一个IPv6地址

查询工具：
- dbcha.com
- netcraft.com
- jsons.com
- Maltego

## IP信息收集

### ping/nslookup

ping: Packet INternet Groper

### IP归属信息查询

- ipwhois.cnnic.net.cn
- ip138.com

### 获得CDN背后的IP

CDN: Content Delivery Network 内容分发网络
相同的内容分发到不同城市的服务器节点

- 超级ping (chinaz.com)
- 历史DNS (dnshistory.org, netcraft.com, ipip.net)
- 通过子域名查询IP
- 国外主机解析 (host-tracker.com, webpagetest.org, pingdom.com)
- 其他：邮件，SSL证书，手机APP抓包，网络空间搜索引擎等

## 端口信息收集

### 端口扫描思路和代码实现

查看本机端口信息：
- Windows: netstat -aon|findstr 3306
- Linux: netstat -an|grep 3306

常用扫描工具：
- telnet
- wget
- nc -vz

```bash
nc -vz xx.xx.xx.xx 80-9000
```

### 常见端口及漏洞

- 文件共享服务
    - 21/22/69  FTP/SFTP文件传输协议
    - 2049  NFS(Network File System)
    - 139  Samba服务
    - 389  LDAP目录访问协议
- 远程连接服务端口
    - 22  SSH远程连接
    - 23  Telnet远程连接
    - 3389  RDP远程桌面连接
    - 5900  VNC
    - 5632  PcAnywhere远程控制服务
- Web应用服务端口
    - 80/443/8080  常见的web服务端口
    - 7001/7002  Weblogic控制台
    - 8080/8089  Jobss/resin/jetty/Jenkins
    - 9090  Websphere控制台
    - 4848  Glassfish控制台
    - 1352  Lotus domino邮件服务
    - 10000 Webmin-web控制面板
- 数据库服务端口
    - 3306  MySQL
    - 1433  MSSQL数据库
    - 1521  Oracle数据库
    - 5432  PostgreSQL水库
    - 27017/27018  MongoDB
    - 6379  Redis数据库
    - 5000  Sysbase/DB2数据库
- 邮件服务端口
    - 25  SMTP邮件服务
    - 110  POP3协议
    - 143  IMAP协议
- 网络常见协议端口
    - 53  DNS域名系统
    - 67/68  DHCP服务
    - 161  SNMP协议
- 特殊服务端口
    - 2181  Zookeeper服务
    - 8069  Zabbix服务
    - 9200/9300  ElasticSearch服务
    - 11211  Memcached服务
    - 512/513/514  Linux Rexec服务
    - 873  Rsync服务
    - 3690  SVN服务
    - 50000  SAP Management Console

### 端口扫描工具

Nmap/Zenmap
- 扫描主机
- 扫描端口
- 探测操作系统，软件版本

> TARGET SPECIFICATION: 目标，对什么进行扫描，比如是域名、IP或者网络
> HOST DISCOVERY: 主机发现，怎么对主机进行扫描，比如简单扫描，还是全部扫一遍，或者用相应的协议扫
> SCAN TECHNIQUES: 扫描技术，协议的设置
> PORT SPECIFICATION AND SCAN ORDER: 端口和扫描顺序设置
> SERVICE/VERSION DETECTION: 服务和版本识别
> SCRIPT SCAN: 使用脚本，nmap本身内置了大量的lua脚本，而且还可以自己编写脚本
> OS DETECTION: 操作系统识别
> TIMING AND PERFORMANCE: 时间和性能设置，比如扫描频率、重试次数等等
> FIREWALL/IDS EVASION AND SPOOFING: 防火墙绕过和欺骗，比如使用代理,假IP等
> OUTPUT: 把扫描接出输出到文件
> MISC: 启用IPv6等等配置

简单扫描 `-sP`
指定端口或范围 `-p0-65535`
探测操作系统 `-O`
只进行主机发现，不进行端口扫描`nmap -sn 192.168.40.195/24`

Zenmap

### 其他扫描工具

在线扫描： coolaf.com/tool/port
masscan
nbtscan

## CMS指纹识别

### 指纹识别
通过关键特征，识别出目标的CMS(Content Management System)系统，服务器， 开发语言，操作系统，CDN，WAF的类别版本等。

### CMS识别思路
- 版权信息
- 特定文件MD5值(favicon.ico)
- 网页源代码
- 通过特定文件分析(robots.txt)

### 识别工具
- whatweb -v discuz.net
- Wappalyzer, whatruns插件
- whatweb.bugscaner.com, finger.tidesec.com
- cmseek

## CDN指纹识别
- ping
- nslookup
- 超级ping
- ldb(load balance detector)
- 国内：cdn.chinaz.com
- 国外：www.cdnplanet.com/tools/cndfinder
- 脚本：github.com/boy-hack/w8fuckcdn, github.com/3xp10it/xcdn

## WAF指纹识别

WAF: Web Application Firewall, Web应用防火墙

### WAF识别思路
- 额外的cookie
- 任何响应或请求的附加标头
- 响应内容
- 响应代码
- IP地址（云WAF）
- JS客户端模块（客户端WAF）

### 触发拦截
- XSS攻击`<script>alert(1)<script`
- sqli`UNION SELECT ALL FROM information_schema AND ’ or SLEEP(5) or ’`
- lfi`../../../../etc/passwd`
- rce`/bin/cat /ect/passwd; ping 127.0.0.1; curl google.com`
- xxe`<!ENTITY xxe SYSTEM “file:///etc/shadow”>]><pwn>&hack;</pwn>`

### 识别工具
- wafw00f
- `nmap example.com —-script=http-waf-detect.nse`
- `sqlmap -u “example.com?id=1” —identify-waf`
- github.com/0xInfection/Awesome-WAF

## 搜索引擎收集信息

![](/img/msb/17371719241921.png)

                                                        index of

### 语法数据库
- www.exploit-db.com/google-hacking-database
- github.com/BullsEye0/google_dork_list

### 工具
GitHub搜索google hacking/google dorks

## 网络空间搜索引擎

OSINT: Open Source Inelligence, 开源网络情报

- shodan.io
    - 命令行shodan
    - Awesome shodan queries
    - My Shodan Scripts
- censys.io
- zoomeye.org
    - Kunyu
- fofa.so
- DiscoverTarget
- saucerframe

## 目录扫描

### 本地文件包含

local file inclusion(LFI)
PHP:
- header.php
- common.php
- footer.php
- function.php

include(“../../..”)

require();

### 常见敏感目录和文件
- robots.txt
- sitemap.xml
- 备份文件/数据
- 后台登录
    - /admin
    - /manage
- 安装包（源码）
    - 1.zip
    - /install
- 上传目录
    - 文件上传漏洞，webshell
    - /upload
    - /upload.php
- MySQL管理页面
- 程序的安装路径
    - /install
- PHP探针
    - phpinfo
    - 雅黑探针
- 文本编辑器
    - Ueditor
    - kindeditor
    - CKeditor
- Linux
    - /etc/passwd
    - /etc/shadow
    - /etc/sudoers
- MacOS
    - DS Store
- 编辑器临时文件.swp
- 目录穿越
    - Windows IIS
    - Apache
- tomcat WEB-INF
    - WEB-INF-dict字典中查询

### 文件扫描思路

文件名直接拼接，若返回200则存在
- 递归扫描
- 字典模式
- 暴力破解
- 爬虫
- fuzz（模糊测试）
- 工具
    - dirb
    - dirbuster（过时）
    - 御剑
    - Burp Suite
    - DirBrute
    - Dirsearch
    - Dirmap
    - wfuzz

## Git信息收集