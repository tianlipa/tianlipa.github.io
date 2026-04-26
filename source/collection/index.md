---
title: 收藏
date: 2025-08-20 09:26:44
---

## 笔记

<div class="text-center">{% btn /tags/数据库基础/, 数据库基础,, %} {% btn /tags/计算机网络, 计算机网络,, %} {% btn /tags/计算机安全, 计算机安全,, %}</div>

## 随笔

<div class="text-center" style="margin-top: 1rem;">
  {% btn /what-to-read, 待看清单,, 总有一天我会全部看完的 %} {% btn /what-to-write, 待写清单,, 听说每个作家都有个小本子记这些 %}
</div>

<div class="text-center">
  {% btn /tags/随笔, 随笔合集,, %}
</div>

## 资料

<div class="text-center">{% btn https://about.oi-wiki.org/, OI Wiki,, %} {% btn https://www.hello-algo.com/chapter_hello_algo/, Hello 算法,, %} {% btn https://www.programmercarl.com/, 代码随想录,, %} {% btn https://neetcode.io/practice/practice/neetcode150, NeetCode 150,, %} {% btn https://www.runoob.com/, 菜鸟教程,, %}</div>

## 杂项

<div class="text-center">{% btn /abracadabra, 魔曰,, 一个有趣的文本对称加密程序 %} {% btn /shitpost, 勾史文案,, 请输入文本 %} {% btn /proust-questionnaire, 普鲁斯特问卷,, 被用来衡量成长轨迹的35个问题 %}</div>

<div class="text-center">
  {% btn /what-to-do, 待办清单,, 我完蛋了 %}
</div>

<div class="text-center random-btn">
  {% btn /hachimi, I'm Feeling Lucky,, %}
</div>

<script src="/js/randombtn.js"></script>


<div id="insult-counter"></div>

<script>
  // 2026-1-07
  const startDate = new Date('2026-04-17T00:00:00+08:00');
  const now = new Date();
  const utc8Now = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const diffDays = Math.floor((utc8Now - startDate) / (1000 * 60 * 60 * 24));
  document.getElementById('insult-counter').innerText =
    `已坚持 ${diffDays} 天不在网上骂人`;
</script>


## 友情链接

<div class="text-center">{% btn https://wanye1307.github.io/, Words Exist,, %} {% btn https://517adam.github.io/, Yuanzhong Chen's Blog,, %}</div>