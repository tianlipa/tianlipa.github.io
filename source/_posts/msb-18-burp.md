---
title: 18-Burp Suite
date: 2025-08-13 13:58:39
tags: [CTF, web, 马士兵]
categories: 笔记
---

集成化，自动化，可扩展的渗透测试工具

![](/img/msb/17375355782024.png)

<!--more-->

## Target模块

### 作用

按主机或域名分类记录并归纳整理所有经过Burp的HTTP流量。

- 把握网站的整体情况
- 对一次工作的域进行分析
- 分析网站存在的攻击面

### 设置作用域

![](/img/msb/17375364043663.png)

使用场景：
- 限定Sitemap和HTTP history记录哪些域的内容
- 限定Spider抓取哪些域的内容
- 限定Scanner扫描哪些域的安全漏洞

### 站点地图Sitemap

## 漏洞扫描

Scan: 主动扫描，给定地址爬取内容，检测漏洞
Live task: 被动扫描，对经过proxy, repeater, intruder的请求进行漏洞检测
crawl: 来自proxy的被动流量抓取
live audit from proxy: 流量的实时审计

### 主动扫描(actively scan, crawl and audit)

爬取所有链接检测漏洞，发送大量请求
针对：
- 客户端的漏洞，如XSS，HTTP头注入，操作重定向
- 服务端的漏洞，如SQL注入，命令行注入，文件遍历

### 被动扫描(passively scan, live audit)

只检测经过BP代理服务器的地址，不爬取，发送有限请求
针对：
![](/img/msb/17375495181302.png)