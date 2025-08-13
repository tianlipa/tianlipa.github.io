---
title: 8-XXE漏洞
date: 2025-08-13 13:45:17
tags: [CTF, web, 马士兵]
---

XML: eXtensible Markup Language, 可扩展标记语言

用作配置文件，交换数据

XML格式要求：
- 必须有根元素
- 必须有关闭标签
- 标签对大小写敏感
- 元素必须被正确地嵌套
- 属性必须加引号

XML格式校验：
DTD: Document Type Definition, 文档类型定义

内部实体 internal entity
外部实体 external entity

如果Web应用的脚本代码没有限制XML引入外部实体，会导致用户可以插入外部实体，其中的内容会被服务器端执行，插入的代码可能导致**任意文件读取、系统命令执行、内网端口探测、攻击内网网站**等危害。

无回显利用：
DNSLog, http接口参数写入文件