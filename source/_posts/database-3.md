---
title: 数据库复习笔记 三.关系数据库标准查询语言SQL
date: 2025-12-16 23:03:31
tags: [笔记, 数据库基础]
categories: 笔记
---

这篇文章的标题结构很乱, 因为我很懒.

## 数据定义语言DDL

定义, 删除与修改基本表

```sql
CREATE TABLE 表名 (
    列名1  数据类型  [列级完整性约束],
    列名2  数据类型  [列级完整性约束],
    ...
    [表级完整性约束]
);
```

<!--more-->

例:

```sql
CREATE TABLE S()
		S＃ CHAR(5),
		SN CHAR(20) NOT NULL UNIQUE,
		SA INT,
		SD CHAR(3),
		PRIMARY KEY (S#)
);
```

CHAR(n): 定长, 如身份证, 学号, 长度固定.
VARCHAR(n): 变长, 如名字, 地址, 长度不固定, 省空间.

```sql
CREATE TABLE Student (
    Sno    CHAR(9) PRIMARY KEY,       /* 学号, 设为主键(唯一且不为空) */
    Sname  VARCHAR(20) UNIQUE,        /* 姓名, 设为唯一(不能重名) */
    Ssex   CHAR(2),                   /* 性别 */
    Sage   SMALLINT,                  /* 年龄 */
    Sdept  CHAR(20)                   /* 所在系 */
);
```

修改表:

```sql
ALTER TABLE <表名>
	[ADD <新列名><数据类型>[列级约束条件]]
	[DROP <完整性约束条件>]
	[MODIFY <列名><数据类型>];
```

```sql
ALTER TABLE Student ADD EntTime DATE;
-- 给Student表增加一个叫EntTime的列, 类型是日期

ALTER TABLE Student MODIFY Sage INT;
-- 把Sage列属性换成INT

ALTER TABLE Student DROP COLUMN Sdept;
-- 删掉某一列, 不是删掉整个表

DROP TABLE Student;
-- 删库跑路
```

#### 索引

类似书籍目录, 能加速查询等操作, 但占用磁盘, 写操作变慢.

```sql
CREATE [UNIQUE][CLUSTER] INDEX <索引名>
ON <表名>(<列名1>[<次序>][, <列名2><次序>... ...])
<次序>可以是ASC和DESC
```

```sql
CREATE [UNIQUE] INDEX Stusname ON Student(Sname);
-- UNIQUE表示唯一索引(如果该列有重复值就不能建UNIQUE)
-- Stusname 是你给这个索引起的名字
-- Student 是表名
-- Sname 是你要给哪一列建索引
CREATE UNIQUE INDEX S_S# ON S(S#)
CREATE UNIQUE INDEX C_C# ON C(C#)
CREATE UNIQUE INDEX SC_S#_C# ON SC(S# ASC,C# DESC)

DROP INDEX [<表名>.]<索引名>
DROP INDEX [S.]S_S#
-- 删除索引
```

## SQL的数据查询DML

```sql
SELECT [ALL|DISTINCT] {*|<目标表达式1> [,<目标表达式2> ... ...]}
	FROM <表名或视图名1> [, <表名或视图名2>]... ...
	[WHERE <条件表达式>]
	[GROUP BY <列名表达式1>[, <列名表达式2>]] [HAVING <条件表达式> ]
	[ORDER BY <列名表达式1> [ASC|DESC]], <列名表达式2> [ASC|DESC]]
```

执行流程:

1. 先按WHERE子句条件从FROM子句指定的表/视图中找出满足条件的元组(选择)
2. 如有GROUP子句, 则将结果按<列名表达式>的值分组, 该<列名表达式>值相等的元组为一个组, 通常会在每组中使用聚合函数.
3. 如果GROUP子句带HAVING子句, 则对组进行过滤, 只输出满足条件的组
4. 再按SELECT子句中的目标表达式选择出元组中的属性, 形成结果表(投影)
5. 如果有ORDER子句, 则将结果按<列名表达式1>的值升序或降序排列

WHERE 对应个体, 如 age > 18, HAVING 对应统计结果, 如AVG, SUM, COUNT, HAVING AVG(Score) > 80.

查询平均成绩大于 80 分的学生的学号:

```sql
SELECT Sno, AVG(Grade)
FROM SC
GROUP BY Sno
HAVING AVG(Grade) > 80;
```

这里用 WHERE 会报错, 因为按 WHERE 匹配的时候还没有分组, 平均分还没法算.

查询不及格的课程门数超过 2 门的学生的学号:

```sql
SELECT Sno
FROM SC
WHERE Grade < 60          -- 只留不及格的记录
GROUP BY Sno              -- 按人分组
HAVING COUNT(*) > 2;      -- 只留挂科数量超过2门的人
```

COUNT(\*): 统计行数, 如果是NULL也会被算进去.

COUNT(列名): 不包括NULL.

- DISTINCT 去重.
- 比较大小: <, <= , >, >=, =, <>
  `SELECT SN,SA FROM S WHERE SD='CS'`
  `SELECT * FROM S WHERE SA<20`
- 确定范围: BETWEEN... AND
  `SELECT * FROM S WHERE SA BETWEEN 20 AND 21`
- 确定集合: IN
  `SELECT * FROM S WHERE SD IN ('CS','IS','MA')`
- 字符匹配: LIKE, % 表示任意长度的任意字符, \_ 表示单个字符, 反斜线 \\ 转义.
  `SELECT * FROM S WHERE S# LIKE 'TB%'`
  `SELECT * FROM S WHERE SN LIKE '刘_'`
- 涉及空值的查询: IS NULL
  `SELECT * FROM SC WHERE GR IS NULL`
- 多重条件查询:
  `SELECT * FROM S WHERE SD='CS' AND SA<20 `
- 查询结果排序: ASCending 升序, DESCending 降序
  	 `ORDER BY <字段表达式> ASC|DESC `
  `SELECT * FROM SC WHERE C#='3' ORDER BY GR DESC`
- 使用集(聚合)函数
  `COUNT , SUM, AVG, MAX, MIN`
  `SELECT COUNT(*) FROM S`
  `SELECT COUNT(DISTINCT S#) FROM SC`
  `SELECT AVG(GR) FROM SC WHERE S#='95001'`
  `SELECT MAX(GR) FROM SC WHERE C#='1'`
- 查询分组: GROUP BY
  `SELECT C#,COUNT(*) FROM SC GROUP BY C#`
  `SELECT S# FROM SC GROUP BY S# HAVING COUNT(*) >2`
  检索选修 > 3 门的课学生学号
- 输出前n条
  `SELECT * FROM student LIMIT n`
- 输出第n条, 其中OFFSET n-1 表示跳过前n-1条
  `SELECT * FROM student LIMIT 1 OFFSET n-1`

### 连接查询

#### 等值连接

学生表 (Student): [学号 Sno, 姓名 Sname]
数据: 001 张三, 002 李四

成绩表 (SC): [学号 Sno, 成绩 Grade]
数据: 001 90分

查询每个学生的姓名和成绩:

```sql
SELECT Student.*, SC.*
FROM Student, SC
WHERE Student.Sno = SC.Sno;
```

结果:

```
001 | 张三 | 001 | 90
```

#### 自然连接

```sql
SELECT Student.Sno, Sname, Grade
FROM Student, SC
WHERE Student.Sno = SC.Sno;
```

结果:

```
001 | 张三 | 90
```

#### 外连接

李四没有成绩, 于是结果里没有李四.

左外连接: 保留左边表里的所有人.

```sql
SELECT Student.Sname, SC.Grade
FROM Student LEFT OUTER JOIN SC ON Student.Sno = SC.Sno;
```

#### 复合条件连接

就是复合条件连接.

#### 自连接

自己↗连↘自己.

| 员工编号 (ID) | 姓名 (Name) | **上司编号 (BossID)** |
| ------------- | ----------- | --------------------- |
| 001           | **马云**    | NULL (没上司)         |
| 002           | **张勇**    | 001                   |
| 003           | **吉米**    | 002                   |

查询吉米的上司的名字:

1. 先找到吉米
2. 找到吉米的上司编号 002
3. 根据 002 回到同一张表里找名字
4. 是张勇

```sql
SELECT A.Name AS 员工名,  B.Name AS 上司名
FROM   Employee A,  Employee B     -- 给 Employee 表起别名 A 和 B
WHERE  A.BossID = B.ID;            -- A的上司编号 = B的自己的编号
```

另外Gemini的攻击性疑似有点强了.

![](/img/database-2/8.png)

### 嵌套查询

把一个查询的结果当成另一个查询的条件.

#### IN

查询和刘晨在同一个系的同学:

```sql
SELECT Sno, Sname
FROM Student
WHERE Sdept IN (                -- IN: 只要在下面这个括号里出现过就算
    SELECT Sdept
    FROM Student
    WHERE Sname = '刘晨'
);
```

可以用连接实现.

#### 带比较运算的子查询

当确定子查询的返回值是唯一时, 可以使用比较运算符.

```sql
SELECT Sno, Grade
FROM SC
WHERE Grade > (
    SELECT AVG(Grade)
    FROM SC
);
```

#### ANY和ALL

查询比CS系中年龄最大的一个学生年龄小的非计算机系学生:

```sql
SELECT Sname, Sage
FROM Student
WHERE Sage < ANY (              -- 小于任意一个 = 小于最大的
    SELECT Sage
    FROM Student
    WHERE Sdept = 'CS'
)
AND Sdept <> 'CS';              -- 记得排除计算机系自己
```

~~(到底是什么情况需要用到这种查询)~~

#### EXISTS

查到了返回True, 否则返回False.

查询选修了1号课程的学生姓名:

```sql
SELECT Sname
FROM Student
WHERE EXISTS (                  -- 只要下面这个括号里能查到记录, 就把这个学生选出来
    SELECT *
    FROM SC
    WHERE Sno = Student.Sno     -- 关键: 拿着外面的学号, 去SC表里找
      AND Cno = '1'             -- 看看有没有选 1号课
);
```

然而实际上可以直接写:

```sql
SELECT Student.Sname
FROM Student, SC
WHERE Student.Sno = SC.Sno
  AND SC.Cno = '1';
```

**注意 NOT EXISTS**: 查询选择了所有课程 -> 没有一门课是没选的:

```sql
SELECT Sname
FROM Student
WHERE NOT EXISTS (                  -- 第一层否定: 不存在这样一门课...
    SELECT *
    FROM Course
    WHERE NOT EXISTS (              -- 第二层否定: ...这门课学生没有选
        SELECT *
        FROM SC
        WHERE Sno = Student.Sno     -- 学生对学生
          AND Cno = Course.Cno      -- 课对课
    )
);
```

查询至少选修了学生哈基米选修的全部课程的学生号码:

```sql
SELECT DISTINCT Sno
FROM SC AS SCX              -- 我们要找的人叫 SCX
WHERE NOT EXISTS (
    SELECT *
    FROM SC AS SCY          -- 这里的 SCY 代表 哈基米 的选课单
    WHERE SCY.Sname = '哈基米' -- 找出哈基米选的所有课
      AND NOT EXISTS (      -- 看看有没有哪门课是 SCX 没选的
          SELECT *
          FROM SC AS SCZ
          WHERE SCZ.Sno = SCX.Sno   -- SCX 选了
            AND SCZ.Cno = SCY.Cno   -- 哈基米选的那门课
      )
);
```

### 集合查询

**列的数量要一样**: 前面的查了2列, 后面的也得查2列.

**对应的数据类型要一样**: 不能第一列是学号(数字), 对应的那一列却是姓名(文字).

#### UNION

UNION: 并集

查询计算机系(CS)的学生 或者 年龄不大于19岁的学生:

```sql
SELECT * FROM Student WHERE Sdept = 'CS'
UNION    -- 把上面的一堆人和下面的一堆人合在一起
SELECT * FROM Student WHERE Sage <= 19;
```

#### INTERSECT

INTERSECT: 交集

查询计算机系(CS)的学生并且年龄不大于19岁的学生:

```sql
SELECT * FROM Student WHERE Sdept = 'CS'
INTERSECT   -- 只要两边都有的人(既是CS系, 又<=19岁)
SELECT * FROM Student WHERE Sage <= 19;
```

#### MINUS

MINUS: 差集

查询计算机系(CS)的学生, 但是排除掉年龄不大于19岁的:

```sql
SELECT * FROM Student WHERE Sdept = 'CS'
MINUS       -- 苕皮不行
SELECT * FROM Student WHERE Sage <= 19;
```

查询没选1号课的学生:

```sql
SELECT Sno FROM Student               -- 全班名单
MINUS                                 -- 减去
SELECT Sno FROM SC WHERE Cno = '1';   -- 选了1号课的名单
```

就不用用NOT EXISTS嗯套了.

## SQL的数据更新DML

#### 插入

```sql
INSERT INTO 表名 (列1, 列2...) VALUES (值1, 值2...);

INSERT INTO Student (Sno, Sname, Ssex)
VALUES ('95001', '张三', '男');
```

带子查询的插入: 把查询结果批量插入到表中.

```sql
INSERT INTO Dept_Age (Sdept, Avgage)
SELECT Sdept, AVG(Sage)      -- 这里直接接 SELECT, 不要写 VALUES
FROM Student
GROUP BY Sdept;
```

#### 修改

```sql
UPDATE 表名 SET 列名 = 新值 WHERE 谁;

UPDATE Student
SET Sage = 8
WHERE Sno = 'PB20000000';
```

如果不加WHERE, 所有人都会变成8岁, 超新星纪元开始.

带子查询的修改: 把计算机系全体学生成绩清零:

```sql
UPDATE SC
SET Grade = 0
WHERE Sno IN (               -- 子查询: 谁是计算机系的
    SELECT Sno
    FROM Student
    WHERE Sdept = 'CS'
);
```

#### 删除

```sql
DELETE FROM 表名 WHERE 谁;

DELETE FROM Student
WHERE Sno = '95001';
```

带子查询的删除: 删除计算机系所有学生的选课记录

```sql
DELETE FROM SC
WHERE Sno IN (
    SELECT Sno
    FROM Student
    WHERE Sdept = 'CS'
);
```

## 视图

视图类似快捷方式, 是给一个复杂且常用的查询语句起的别名

#### 创建视图

```sql
CREATE VIEW <视图名> [(<列名1>[, <列名2>......])]
AS <子查询>
[WITH CHECK OPTION]
```

列名在以下情况必须列出:

- 子查询的目标列是集函数等, 不是单纯的列
- 多表连接时出现同名的列作为视图字段
- 需要在视图中启用新的名字

`WITH CHECK OPTION`表示对视图更新时自动验证子查询条件.

**行列子集视图**: 若一个视图是从单个基本表导出的, 并且只是去掉了基本表的某些行和某些列, 但保留了码, 称行列子集视图.

计算机系学生的视图:

```sql
CREATE VIEW CS_Student
AS
SELECT Sno, Sname, Sage
FROM Student
WHERE Sdept = 'CS';
```

**视图的消解**: 查询时, 数据库并不是真的去查视图, 而是把命令翻译为针对基本表的查询语句再执行.

```sql
-- 使用时, 直接:
SELECT * FROM CS_Student;

SELECT * FROM CS_Student WHERE Sage < 20;
-- 会被自动转换成:
SELECT Sno, Sname, Sage
FROM Student
WHERE Sdept = 'CS' AND Sage < 20;
```

视图之上也可以建立视图.

建立一个反映学生出生年月的视图:

```sql
CREATE VIEW BT_S(S＃, SN, SB)
AS
SELECT S#, SN, 2003－SA FROM S
```

建立一个学生学号和平均成绩的视图:

```sql
CREATE VIEW S_G(S＃, AVG_GR)
AS
SELECT S#, AVG(GR) FROM SC GROUP BY S#
```

#### 更新视图

```sql
UPDATE CS_Student
SET Sage = 20
WHERE Sno = 'PB20000000';
```

不允许修改的视图:

- 带聚合函数(COUNT, SUM, AVG, MAX, MIN)的
- 带GROUP BY的
- 带DISTINCT的
- 带表达式计算的
- 多表视图, 由多个表连接起来的
- 视图的字段来自常数或表达式, 只运行DELETE
- 视图定义有嵌套查询, 且内层查询涉及到导出本视图的基本表
- 不允许更新的视图上定义的视图

#### 删除视图

```sql
DROP VIEW CS_Student;
```

#### 视图的用途

- 简化用户操作
- 可以让用户从多角度看待同一数据
- 对重构数据库提供了一定的逻辑独立性
- 能对数据提供安全保护

## 数据控制语言DCL

#### 授权

```sql
GRANT <权限> ON <对象(表/视图)> TO <用户>;

GRANT SELECT ON Student TO U1;
GRANT ALL PRIVILEGES ON Student TO U1, U2;

GRANT SELECT ON Student TO U1
WITH GRANT OPTION; -- 允许 U1 把权限给别人
```

#### 移除权限

```sql
REVOKE <权限> ON <对象> FROM <用户>;

REVOKE SELECT ON Student FROM U1;
-- 默认处理级联(CASCADE), U1 给别人的权限也会被收回
```

## 嵌入式SQL语言

SQL 只管存取数据, 不干别的, 所以可以把SQL嵌入到其他高级语言如C, C++, Java等, 得到嵌入式SQL, Embedded SQL, ESQL.

主语言: 宿主.

一般形式:

```sql
EXEC SQL <SQL 语句>
```

### 游标

一次查询可能查出很多数据, 使用游标把这些数据逐个提取出来给主语言处理.

#### 定义游标

```sql
EXEC SQL DECLARE C1 CURSOR FOR   -- C1 是游标的名字
    SELECT Sno, Sname, Grade
    FROM SC
    WHERE Cno = '1';
```

#### 打开游标

```sql
EXEC SQL OPEN C1;
```

#### 推进游标

通常放在`while`循环里, 作用是把当前指着的这一行数据拿出来, 填到主变量里, 然后指针往下移一格.

```sql
EXEC SQL FETCH C1 INTO :v_sno, :v_sname, :v_grade;
```

INTO 后面是主变量, 带冒号.

#### 关闭游标

```sql
EXEC SQL CLOSE C1;
```

#### 修改游标当前对应数据

```sql
WHERE CURRENT OF 游标名

UPDATE SC
SET Grade = 60
WHERE CURRENT OF C1;  -- 把游标 C1 当前指着的那个人的成绩改成60
```

例: 用C语言把计算机系所有学生的姓名和学号打印出来.

```C
/* AI 写的, 演都不演了 */
/* 1. 定义主变量 (C语言变量) */
EXEC SQL BEGIN DECLARE SECTION;
    char v_sno[10];    // 用来存学号
    char v_sname[20];  // 用来存姓名
    char v_dept[20] = "CS"; // 要查的系
EXEC SQL END DECLARE SECTION;

/* 2. 定义 SQL 通信区 (用来查 SQLCODE) */
EXEC SQL INCLUDE SQLCA;

int main() {
    /* 连接数据库 (考试一般不考这行, 但知道有这一步就行) */
    EXEC SQL CONNECT TO 'MySchoolDB';

    /* ==========================================
       关键步骤 1: 声明游标 (DECLARE)
       告诉电脑: 我要查 CS 系的学生, 把结果集准备好
       ========================================== */
    EXEC SQL DECLARE StudentCursor CURSOR FOR
        SELECT Sno, Sname
        FROM Student
        WHERE Sdept = :v_dept;   /* 注意: 用C变量要加冒号 */

    /* ==========================================
       关键步骤 2: 打开游标 (OPEN)
       电脑执行查询, 找到了一堆人, 但还在仓库里没拿出来
       ========================================== */
    EXEC SQL OPEN StudentCursor;

    /* ==========================================
       关键步骤 3: 循环提取 (FETCH)
       核心考点: 怎么判断读完了? 看 SQLCODE
       ========================================== */
    while (1) {
        // 拿出一行数据, 填到 v_sno 和 v_sname 变量里
        EXEC SQL FETCH StudentCursor INTO :v_sno, :v_sname;

        // 如果 SQLCODE = 100, 说明"没数据了/读完了", 跳出循环
        if (sqlca.sqlcode == 100) break;

        // 如果出错, 也处理一下
        if (sqlca.sqlcode < 0) break;

        // 打印这一行 (这是 C 语言的代码)
        printf("学号: %s, 姓名: %s\n", v_sno, v_sname);
    }

    /* ==========================================
       关键步骤 4: 关闭游标 (CLOSE)
       收摊, 释放资源
       ========================================== */
    EXEC SQL CLOSE StudentCursor;

    /* 断开连接 */
    EXEC SQL DISCONNECT CURRENT;
    return 0;
}
```

sqlcode:

- 为100: 查询结果没有满足条件的记录, 读完了或没找到
- 为0: 成功执行
- 小于0: 出错了

## 动态SQL

```sql
EXEC SQL EXECUTE MyCmd;
EXEC SQL EXECUTE IMMEDIATE :sql_string;
```

## 存储过程

估计是考试重点.

存储过程是一组为了完成特定功能的 SQL 语句集, 它被编译后存储在数据库中. 用户通过指定存储过程的名字并给定参数(如果有)来调用执行它.

优点: 预编译, 性能高; 减少网络流量; 安全; 可复用.

缺点: 难调试, 难移植.

```sql
CREATE PROCEDURE 过程名(参数列表)
BEGIN
    -- 这里写你的 SQL 逻辑
    -- 可以是 SELECT, UPDATE, INSERT, DELETE
    -- 甚至可以写 IF, WHILE 循环
END;
```

IN: 输入参数, 传递给存储过程的值

OUT: 输出参数, 存储过程返回的结果

INOUT: 输入输出参数, 既是输入也是输出

输入一个学生的 ID, 如果他的分数低于 60 分, 就把他的status字段标记为"不及格", 否则标记为"及格".

```sql
-- 创建存储过程
CREATE PROCEDURE CheckPass(IN stu_id INT)
BEGIN
    -- 定义一个变量来存分数
    DECLARE current_score INT;

    -- 1. 先查出分数, 赋值给变量
    SELECT score INTO current_score FROM Student WHERE id = stu_id;

    -- 2. 逻辑判断 (IF ... THEN ... ELSE)
    IF current_score < 60 THEN
        UPDATE Student SET status = '不及格' WHERE id = stu_id;
    ELSE
        UPDATE Student SET status = '及格' WHERE id = stu_id;
    END IF;

END;

CALL CheckPass(1001); -- 检查学号为 1001 的学生
```

## 函数

预定义的代码块, 接受一个或多个参数, 返回且必须返回一个结果值.

```sql
CREATE FUNCTION 函数名(参数列表) RETURNS 返回类型
BEGIN
    -- 定义变量
    DECLARE result 变量类型;

    -- 逻辑处理
    -- ...

    -- 必须要有 RETURN
    RETURN result;
END;
```

例: GetLevel, 输入分数, 如果大于90返回 A, 否则返回 B.

```sql
CREATE FUNCTION GetLevel(stu_score INT) RETURNS CHAR(1)
BEGIN
    -- 1. 声明一个变量存结果
    DECLARE level CHAR(1);

    -- 2. 逻辑判断
    IF stu_score >= 90 THEN
        SET level = 'A';
    ELSE
        SET level = 'B';
    END IF;

    -- 3. 返回结果
    RETURN level;
END;

SELECT name, GetLevel(score) FROM Student;
```
