---
title: 4-CSRF漏洞渗透与防御
date: 2025-08-13 13:38:26
tags: [CTF, web, 马士兵]
categories: 笔记
---

CSRF(XSRF): Cross-Site Request Forgery, 跨站请求伪造

![](/img/msb/17379650021685.png)

典型案例：Gmail CSRF漏洞设置邮件转发，Weibo CSRF漏洞自动关注账号。

## CSRF漏洞挖掘

Burp Suite
CSRF Tester
github.com/s0md3v/Bolt

## 防御思路

区分请求来自自己的前端页面还是第三方网站
或让自己的前端页面的请求与伪造请求不一样

HTTP Request Header: Referer: 引用页，来源页面，用于跟踪来源，如访问统计和广告效果

<!--more-->

CSRF token:
1. 用户使用用户名和密码登录，服务端下发一个随机token给客户端，并且服务端把这个字段保存在session中
2. 客户端保存token，放在隐藏字段
3. 用户在登录状态下，以后访问时，都要携带这个token字段
4. 服务端从session中取出token进行对比，如果一致，说明请求合法
5. 用户退出，session销毁，token失效

二次验证

验证码

浏览器的Referrer Policy