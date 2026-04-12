---
title: 10-反序列化漏洞
date: 2025-08-13 13:47:44
tags: [CTF, web, 马士兵]
categories: 笔记
---

### PHP类与对象

类：一个共享相同结构和行为的对象的集合
对象：类的实例

### PHP Magic函数

魔术方法是一种特殊的方法，当对对象执行某些操作时会覆盖PHP的默认操作。

<!--more-->

![](/img/msb/17387600154271.png)

![](/img/msb/17387600155299.png)

### PHP序列化和反序列化

序列化：把对象转换为字符
反序列化：对单一的已序列化的变量进行操作，将其转换为PHP的值

serialize

其他序列化格式：
json字符串 json_encode
xml字符串  wddx_serialize_value
二进制格式
字节数组

若类中同时定义了__unserialize()方法和__wakeup()方法，则反序列化时只会调用__unserialize()方法

### 漏洞发生条件

- unserialize函数的参数可控
- 脚本中定义了Magic方法，方法中有读写php文件或执行命令的操作，如__destruct(), unlink()
- 操作的内容需要有对象中的成员变量的值，如filename

### 常见利用函数

命令执行：
exec(), passthru(), popen(), system(), call_user_func

文件操作：
file_put_contents(), file_get_contents(), unlink()