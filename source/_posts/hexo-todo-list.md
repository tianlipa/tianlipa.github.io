---
title: Hexo博客如何渲染Markdown待办清单TO-DO List
date: 2025-08-19 10:19:29
tags: [博客美化, 疑难解答]
categories: 博客
---

起因是想把自己的待看清单传上来, 然后发现hexo默认不支持渲染这样的待办清单.

- [ ] 和人类社交
- [ ] 学习
- [x] 吃饭
- [x] 打游戏

必应搜了一下没搜到, 遂去翻了一下github issues, 找到了解决方法.

使用渲染器为[hexo-renderer-markdown-it](https://github.com/hexojs/hexo-renderer-markdown-it), 安装方法如下.

```bash
npm install hexo-renderer-markdown-it --save
```

<!--more-->

在`_config.yml`中添加如下内容:

```yml
markdown:
  preset: 'default'
  render:
    html: true
    xhtmlOut: false
    langPrefix: 'language-'
    breaks: true
    linkify: true
    typographer: true
    quotes: '“”‘’'
  enable_rules:
  disable_rules:
  plugins:
  anchors:
    level: 2
    collisionSuffix: ''
    permalink: false
    permalinkClass: 'header-anchor'
    permalinkSide: 'left'
    permalinkSymbol: '¶'
    case: 0
    separator: '-'
  images:
    lazyload: false
    prepend_root: false
    post_asset: false
  inline: false  # https://markdown-it.github.io/markdown-it/#MarkdownIt.renderInline
```

hexo-renderer-markdown-it就安装好了, 接下来需要安装[markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists)插件.

```bash
npm install markdown-it-task-lists
```

在`_config.yml`里找到你刚刚添加的内容, 把

```yaml
markdown:
  plugins:
```

改成

```yaml
markdown:
  plugins:
    - markdown-it-task-lists
```

然后运行`hexo clean && hexo g`即可. 注意, 不`hexo clean`的话页面可能不会更新.

但是这样生成的待办清单行首会有一个markdown无序列表的黑点, 让我很不爽, 大概像这样:

- - [ ] 像我这样

遂在`_config.next.yml`(根据主题不同操作方法可能不同, 我用的是NexT主题)找到如下内容:

```yaml
custom_file_path:
  #head: source/_data/head.njk
  #header: source/_data/header.njk
  #sidebar: source/_data/sidebar.njk
  #postMeta: source/_data/post-meta.njk
  #postBodyStart: source/_data/post-body-start.njk
  #postBodyEnd: source/_data/post-body-end.njk
  #footer: source/_data/footer.njk
  #bodyEnd: source/_data/body-end.njk
  #variable: source/_data/variables.styl
  #mixin: source/_data/mixins.styl
  #style: source/_data/styles.styl
```

将`style: source/_data/styles.styl`这行取消注释, 然后在`/source`目录下新建`/_data/styles.styl`文件, 内容为:

```stylus
.task-list-item {
  list-style-type: none;
}

.task-list-item input[type="checkbox"] {
  margin-left: -1em;
  margin-right: 0.5em;
}
```

第一段取消前面的黑点, 第二段用于调节位置, 可以根据自己的需要修改.