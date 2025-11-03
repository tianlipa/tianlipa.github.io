// scripts/force-chinese-quotes.js
// hexo.extend.filter.register('markdown-it:renderer', function(md) {
//   md.core.ruler.after('inline', 'smart-cn-quotes', function(state) {
//     for (const block of state.tokens) {
//       if (block.type !== 'inline' || !block.children) continue;
//       for (const token of block.children) {
//         if (token.type !== 'text') continue;
//         if (/(\$\$[\s\S]*?\$\$)|(\$[\s\S]*?\$)/.test(token.content)) continue;
//         if (token.content.includes('<') && token.content.includes('>')) continue;

//         let text = token.content;
//         text = text.replace(/"([^"]+?)"/g, '“$1”');
//         text = text.replace(
//           /(^|[^A-Za-z])'([^']+?)'([^A-Za-z]|$)/g,
//           (_, before, content, after) => `${before}‘${content}’${after}`
//         );
//         token.content = text;
//       }
//     }
//   });
// });


// 'use strict';

// const cheerio = require('cheerio');

// hexo.extend.filter.register('after_render:html', function (html, data) {
//   // 载入 HTML DOM
//   const $ = cheerio.load(html, { decodeEntities: false });

//   // 只处理正文部分
//   const selectors = ['.post-body', '.post-content', '.post'];
//   $(selectors.join(',')).each((_, el) => {
//     processTextNodes($(el));
//   });

//   return $.html();

//   function processTextNodes($root) {
//     // 遍历所有子节点
//     $root.contents().each((_, node) => {
//       if (node.type === 'text') {
//         const original = node.data;
//         const trimmed = original.trim();
//         if (!trimmed) return;

//         // 跳过 LaTeX、公式片段
//         if (/^\$.*\$$/.test(trimmed)) return;

//         // 替换引号：
//         // 1. “双引号” -> “中文弯引号”
//         // 2. ‘单引号’ -> ‘中文弯引号’
//         // 3. 不动缩写里的 '（例如 it's）
//         let text = original
//             // 双引号
//             .replace(/"([^"]*?)"/g, '“$1”')
//             // 单引号（考虑中文边界）
//             .replace(/(^|[\s\p{P}\u4e00-\u9fa5])'([^']+?)'(?=[\s\p{P}\u4e00-\u9fa5]|$)/gu, '$1‘$2’');

//         node.data = text;
//       } else if (node.type === 'tag') {
//         const tag = node.name.toLowerCase();

//         // 跳过不应修改的标签
//         if (
//           ['code', 'pre', 'script', 'style', 'kbd', 'samp', 'math'].includes(tag) ||
//           $(node).parents('code, pre, script, style, kbd, samp, math, .katex, .highlight').length
//         ) {
//           return;
//         }

//         // 递归处理
//         processTextNodes($(node));
//       }
//     });
//   }
// });



// 'use strict';

// const cheerio = require('cheerio');

// // 注册过滤器：在渲染为 HTML 后、生成最终页面前执行
// hexo.extend.filter.register('after_render:html', function (html) {
//   // 用 cheerio 解析 HTML，方便地跳过代码块、数学块、HTML 标签
//   const $ = cheerio.load(html, { decodeEntities: false });

//   // 需要处理的文本节点选择器（排除代码、pre、mathjax、script、style）
//   const selector = 'body *:not(code):not(pre):not(script):not(style):not(.highlight):not(.MathJax):not(.mathjax)';

//   $(selector).each((_, elem) => {
//     // 只处理纯文本节点
//     $(elem)
//       .contents()
//       .filter(function () {
//         return this.type === 'text';
//       })
//       .each(function () {
//         let text = $(this).text();

//         // 跳过空文本
//         if (!text.trim()) return;

//         // 替换规则：
//         // 1. 仅当英文双引号出现在中文字符之间时才替换
//         //    匹配 “中文字符"中文字符” 的情形
//         //    [\u4e00-\u9fa5] 是中文字符范围，可根据需要扩展
//         text = text
//           // 替换中文之间的 "成 “
//           .replace(/([\u4e00-\u9fa5])"([\u4e00-\u9fa5])/g, '$1“$2')
//           // 替换前有中文，后不是中文（引号结尾）为 ”
//           .replace(/([\u4e00-\u9fa5])"(?=[^\u4e00-\u9fa5]|$)/g, '$1”')
//           // 替换前不是中文，后是中文（引号开头）为 “
//           .replace(/(^|[^\u4e00-\u9fa5])"([\u4e00-\u9fa5])/g, '$1“$2');


//         $(this).replaceWith(text);
//       });
//   });

//   return $.html();
// });
