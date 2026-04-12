---
title: NexT主题Hexo博客如何显示动态Subtitle(随机显示Subtitle)
date: 2025-01-14 16:53:48
tags: 博客美化
categories: 博客
---
起因是觉得Matery主题不太符合审美, 想换成NexT主题, 但又想像Matery那样添加每次刷新都显示的动态签名, 找了一下发现在NexT中签名是写在Subtitle里的, 但网上相关的博客只有两篇, 且都过时失效了, 剩下的基本都是互相抄袭的胡说八道, 遂自己研究了一下.

纯属照着AI依葫芦画瓢写出的东西, 很可能含有愚蠢的实现方式或错误, 贻笑大方, 但反正最后达到我想要的效果了.

<!--more-->

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

---

更新: 今天把NexT主题升级到了8.24.0版本, 由于新版NexT把所有swig文件都换成了njk格式, 原来的方法失效了.

不过新版的步骤也没什么区别, 只是修改`brand.swig`变成了修改`brand.njk`而已.

再更新:

更优雅一点的办法是把`brand.njk`里的这一段:

```html
{%- if subtitle %}
    <p class="site-subtitle" itemprop="description">{{ subtitle }}</p>
{%- endif %}
```

替换成这样:

```html
{%- if subtitle %}
      <div id="randomParagraph" class="site-subtitle" itemprop="description"></div>
      <script src="/js/subtitle.js"></script>
    {%- endif %}
```

然后在博客的`/source/js/`目录下新建文件`subtitle.js`, 内容如下:

```javascript
document.addEventListener("DOMContentLoaded", function () {
    var paragraphs = [
        "你想要的Subtitle",
        "我是奶龙",
        "你想要的另外的Subtitle",
        "再添加一个段落以供随机选择。"
    ];
    var randomIndex = Math.floor(Math.random() * paragraphs.length);
    var selectedParagraph = paragraphs[randomIndex];
    document.getElementById('randomParagraph').innerHTML = selectedParagraph;
});
```

这样不会每个页面都复制一遍所有subtitle, 效果会稍好一些.

另外前段时间发现修改`node_modules`里的东西实际上是很不规范的行为, 但是先不管了.

---

更新: 找到了最合适的方法.

不需要修改`brand.njk`, 在`/source/js/`目录下新建文件`subtitle.js`, 内容如下:

```javascript
document.addEventListener("DOMContentLoaded", function () {
    var paragraphs = [
        "哈基米白手套",
        "胖宝宝胖宝宝",
        "好胖好可爱"
        ];
    var randomIndex = Math.floor(Math.random() * paragraphs.length);
    var selectedParagraph = paragraphs[randomIndex];
    var subtitleElement = document.querySelector('.site-subtitle');
    if (subtitleElement) {
        subtitleElement.innerHTML = selectedParagraph;
    }
});
```

打开`_config.next.yml`, 找到

```yaml
custom_file_path:
  #head: source/_data/head.njk
  #header: source/_data/header.njk
  #sidebar: source/_data/sidebar.njk
  #postMeta: source/_data/post-meta.njk
  #postBodyStart: source/_data/post-body-start.njk
  #postBodyEnd: source/_data/post-body-end.njk
  #footer: source/_data/footer.njk
  bodyEnd: source/_data/body-end.njk
  #variable: source/_data/variables.styl
  #mixin: source/_data/mixins.styl
  #style: source/_data/styles.styl
```

把 `bodyEnd: source/_data/body-end.njk` 取消注释.

在 `/source/_data/` 新建 `body-end.njk`, 内容如下:

```
<script src="/js/subtitle.js"></script>
```

然后就完事了, 更新也不会出问题.