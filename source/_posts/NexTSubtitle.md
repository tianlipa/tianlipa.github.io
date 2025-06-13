---
title: NexT主题Hexo博客如何显示动态Subtitle（随机显示Subtitle）
date: 2025-01-14 16:53:48
tags: 博客美化
---
起因是觉得Matery主题不太符合审美, 想换成NexT主题, 但又想像Matery那样添加每次刷新都显示的动态签名, 找了一下发现在NexT中签名是写在Subtitle里的, 但网上相关的博客只有两篇, 且都过时失效了, 剩下的基本都是互相抄袭的胡说八道, 遂自己研究了一下.

纯属照着AI依葫芦画瓢写出的东西, 很可能含有愚蠢的实现方式或错误, 贻笑大方, 但反正最后达到我想要的效果了.

打开博客根目录下`themes/next/layout/_partials/header/brand.swig`, 找到以下内容:

```html
{%- if subtitle %}
    <p class="site-subtitle" itemprop="description">{{ subtitle }}</p>
{%- endif %}
```

将其替换成

```html
{% if subtitle %}
    <div id="randomParagraph" class="site-subtitle" itemprop="description"></div>
    <script>
    var paragraphs = [
        "你想要的Subtitle",
        "我是奶龙",
        "你想要的另外的Subtitle",
        "再添加一个段落以供随机选择。"
    ];
    var randomIndex = Math.floor(Math.random() * paragraphs.length);
    var selectedParagraph = paragraphs[randomIndex];
    document.getElementById('randomParagraph').innerText = selectedParagraph;
    </script>
{% endif %}
```
即可.

如果想在Subtitle里插入HTML代码(例如使用&lt;br>换行), 只需将

```html
document.getElementById('randomParagraph').innerText = selectedParagraph;
```

中的`innerText`替换成`innerHTML`即可.

其实严格来说这么做也不是很对劲, 因为这跟根目录下`_config.yml`里的Subtitle已经没什么关系了, 不过除非你是强迫症, 否则应该没什么实际影响.

参考的两篇博客:
[hexo个性化（next主题动态显示subtitle）](https://www.jianshu.com/p/df2c844eeabf)
[Hexo 个性化 - Next 主题动态显示 Subtitle](https://lruihao.cn/posts/dongtaisub/)