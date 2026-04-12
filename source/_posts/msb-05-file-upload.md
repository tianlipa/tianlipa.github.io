---
title: 5-文件上传漏洞
date: 2025-08-13 13:42:16
tags: [CTF, web, 马士兵]
categories: 笔记
---

## 原理

## Webshell

### 一句话木马

代码短，只有一行代码。
应用场景多，可以单独生成文件，也可以插入到图片中。
安全性高，隐匿性强，可以变形免杀。

### 小马

体积小，功能少，只有文件上传功能。

### 大马

体积大，功能全，能够管理数据库、文件管理、对站点进行快速信息收集，甚至能够提权。

## 网站控制工具

中国菜刀，中国蚁剑，weevely, godzilla, behinder

<!--more-->

## 示例

MIME: Multipurpose Internet Mail Extensions, 多用途互联网邮件扩展类型

常见类型：
test/html   HTML格式
application/json    JSON数据格式
multipart/form-data 文件上传（二进制数据）
image/jpeg  jpg图片格式

客户端使用：
GET请求不使用MIME字段
POST请求头，放在Content Type字段用来指定上传的文件类型，方便服务器解析。放在Accept，告诉服务端允许接收的响应类型。

服务端使用：
放在响应头，Content Type告诉客户端响应的数据类型，方便客户端解析。

等价扩展名：
asp: asa, cer, cdx
aspx: ashx, asmx, ascx
php: php2, php3, php4, php5, phps, phtml
jsp: jspx, jspf

.htaccess: Hypertext Access(超文本入口)
是Apache服务器中的一个配置文件，负责相关目录下的网页配置。
通过.htaccess文件，可以实现：网页301重定向，自定义404错误页面，改变文件扩展名，允许/阻止特定用户或目录的访问，禁止目录列表，配置默认文档等功能。
```
<FilesMatch “a.jpg”>
        SetHandler application/x-httpd-php
</FilesMatch>
```

Content-Disposition:
响应头指示回复的内容以内联方式展示，还是以附件形式下载并保存到本地。

文件名截断：
截断字符：chr(0), 类似C++的\0, url编码为%00，ASCII编码为0
filename=test.php%00.txt    ->  filename=text.php
注意可能需要处理十六进制

文件头：
png: 89 50 4E 47 0D 0A 1A 0A    (.PNG)
jpg: FF D8
gif: 47 49 46 38 39|37 61   (GIF89a, GIF87a)
bmp: 42 4D  (BM)
.class: ca fe ba be

```
copy a.gif /b + shell.php /a shell.gif  #Windows
cat a.gif shell.php > shell.gif #Linux
```

basename(): 
基于全路径字符串，返回基本文件名

imagecreatefromjpeg(): 
创建新图片

条件竞争：
在被删之前写入一个新的一句话木马文件

shell.php.*会被apache当作php文件解析。

Linux文件权限：
所有者 用户组 其他人
r: read, w: write, x: execute
r=4, w=2, x=1

## 总结

利用流程：
1. 找到上传位置
2. 尝试绕过校验，上传文件
3. 获取文件位置
4. 连接

绕过方式：
删除/禁用JavaScript，修改MIME，等价扩展名，大小写，htaccess，双写，空格，点，::$DATA，%00截断，0x00截断，图片马，条件竞争等。

fuxploider

防御：
扩展名黑白名单
MIME校验
文件头校验
对文件进行二次渲染
重命名
不要暴露上传文件等位置
禁用上传文件的执行权限