// /**
//  * Hexo Auto Typography Script
//  * 功能：
//  * 1. 保护代码块、HTML标签、LaTeX公式、Markdown链接不被修改
//  * 2. 英文撇号优化：it's -> it’s
//  * 3. 中英文/数字间距优化（盘古之白）：距离2米 -> 距离 2 米；距离2m -> 距离 2m
//  * 4. 智能引号替换：
//  *    - 内含中文的直双引号 -> 「」
//  *    - 纯英文/数字的直双引号 -> “”
//  */

// hexo.extend.filter.register('before_post_render', function(data) {
//     let content = data.content;
//     const markers = []; // 用于存储被保护的内容
    
//     // --- 1. 保护机制 (Masking Phase) ---
//     // 将不需要处理的内容替换为占位符 ___MASK_n___
//     // 注意：正则顺序很重要，先匹配长块，再匹配短块

//     const mask = (str, regex) => {
//         return str.replace(regex, (match) => {
//             const key = `___MASK_${markers.length}___`;
//             markers.push(match);
//             return key;
//         });
//     };

//     // 1.1 保护 Markdown 代码块 (```...```)
//     content = mask(content, /```[\s\S]*?```/g);
    
//     // 1.2 保护 Markdown 行内代码 (`...`)
//     content = mask(content, /`[^`]+`/g);
    
//     // 1.3 保护 HTML 标签 (<script>, <style>, <div>, etc.)
//     content = mask(content, /<[^>]+>/g);
    
//     // 1.4 保护 LaTeX 公式 ($$ ... $$, \[ ... \], \( ... \))
//     content = mask(content, /\$\$[\s\S]*?\$\$/g); // Block
//     content = mask(content, /\\\[[\s\S]*?\\\]/g); // Block
//     content = mask(content, /\\\([\s\S]*?\\\)/g); // Inline
    
//     // 1.5 保护 Markdown 链接和图片中的 URL 部分 [text](url)
//     // 防止 URL 中的字符被加空格或引号替换
//     content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


//     // --- 2. 文本替换 (Processing Phase) ---

//     // 2.1 英文撇号优化 (it's -> it’s)
//     // 匹配规则：字母 + ' + 字母
//     content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");

//     // 2.2 中英文/数字间距优化 (盘古之白)
//     // 逻辑：中文字符与[a-zA-Z0-9]之间增加空格
//     // 中文范围：\u4e00-\u9fa5 (基本汉字)
    
//     // 情况 A: 中文 + 英文/数字 -> 中文 + 空格 + 英文/数字
//     // 例如：距离2 -> 距离 2
//     content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
    
//     // 情况 B: 英文/数字 + 中文 -> 英文/数字 + 空格 + 中文
//     // 例如：2米 -> 2 米
//     content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
    
//     // *注：英文数字之间（如 2m）不会被匹配，因此保持原样，符合“距离 2m”的要求*

//     // 2.3 智能双引号替换
//     // 查找成对的直引号
//     content = content.replace(/"((?:[^"])*?)"/g, (match, innerText) => {
//         // 如果内部包含中文字符，使用直角引号
//         if (/[\u4e00-\u9fa5]/.test(innerText)) {
//             return `「${innerText}」`;
//         } 
//         // 否则（纯英文/数字/符号），使用弯引号
//         else {
//             return `“${innerText}”`;
//         }
//     });


//     // --- 3. 还原机制 (Restore Phase) ---
//     // 将占位符替换回原始内容
//     // 必须倒序或精确匹配，这里由于 Key 是唯一的，直接遍历数组即可
    
//     markers.forEach((val, idx) => {
//         const key = `___MASK_${idx}___`;
//         // 使用 callback 形式的 replace，防止 val 中包含 $ 等特殊字符导致解析错误
//         content = content.replace(key, () => val);
//     });

//     data.content = content;
//     return data;
// });


/**
 * Hexo Auto Typography Script (Fix V3)
 * 
 * 改进点：
 * 1. 修复引号替换 Bug：使用回调函数一次性判断引号类型，杜绝 “what「 这种混合错误。
 * 2. 括号间距优化：你说得对(其实不对) -> 你说得对 (其实不对)
 * 3. 严格判定：只有纯英文环境（内部、前后均无中文）才用弯引号，否则一律直角引号。
 */

// hexo.extend.filter.register('before_post_render', function(data) {
//     let content = data.content;
//     const markers = []; // 存储被保护的代码块/标签
    
//     // --- 1. 保护机制 (Masking Phase) ---
//     // 将代码块、HTML、公式、链接URL替换为占位符
//     const mask = (str, regex) => {
//         return str.replace(regex, (match) => {
//             const key = `___MASK_${markers.length}___`;
//             markers.push(match);
//             return key;
//         });
//     };

//     content = mask(content, /```[\s\S]*?```/g);
//     content = mask(content, /`[^`]+`/g);
//     content = mask(content, /<[^>]+>/g);
//     content = mask(content, /\$\$[\s\S]*?\$\$/g);
//     content = mask(content, /\\\[[\s\S]*?\\\]/g);
//     content = mask(content, /\\\([\s\S]*?\\\)/g);
//     // 保护 Markdown 链接结构 [text](url) 中的 (url) 部分不被加空格
//     content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


//     // --- 2. 文本替换 (Processing Phase) ---

//     // 2.1 英文撇号优化 (it's -> it’s)
//     content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");


//     // 2.2 括号间距处理 (New!)
//     // 逻辑：在 中文/英文/数字 与 ( 之间加空格
//     // 避免如 func(args) 被误伤（代码块已被mask，此处主要防普通文本）
//     // 避免如 [链接](url) 被误伤（链接已被mask）
    
//     // 左括号前：如果是 汉字、字母、数字，加空格
//     content = content.replace(/([\u4e00-\u9fa5a-zA-Z0-9])\(/g, '$1 (');
    
//     // 右括号后：如果是 汉字、字母、数字，加空格
//     // 注意：右括号后如果是标点（, . ! ?）不加空格
//     content = content.replace(/\)([\u4e00-\u9fa5a-zA-Z0-9])/g, ') $1');


//     // 2.3 中英文/数字间距优化 (盘古之白)
//     content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
//     content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');


//     // 2.4 智能双引号替换 (Atomic Callback Fix)
//     // 核心修复：查找成对的直引号，在回调中一次性判断使用哪种引号
    
//     content = content.replace(/"([^"]*?)"/g, (match, inner, offset, fullStr) => {
//         // 获取引号前后的字符（处理边界情况）
//         const prevChar = fullStr[offset - 1] || '';
//         const nextChar = fullStr[offset + match.length] || '';
        
//         // 判断条件：
//         // 1. 内部有中文
//         // 2. 紧挨着的前面是中文
//         // 3. 紧挨着的后面是中文
//         const hasChineseContext = /[\u4e00-\u9fa5]/.test(inner) || 
//                                   /[\u4e00-\u9fa5]/.test(prevChar) || 
//                                   /[\u4e00-\u9fa5]/.test(nextChar);
        
//         if (hasChineseContext) {
//             return `「${inner}」`;
//         } else {
//             return `“${inner}”`;
//         }
//     });


//     // --- 3. 还原机制 (Restore Phase) ---
//     markers.forEach((val, idx) => {
//         const key = `___MASK_${idx}___`;
//         content = content.replace(key, () => val);
//     });

//     data.content = content;
//     return data;
// });



// /**
//  * Hexo Auto Typography Script (Final Perfect Version)
//  * 
//  * 功能点：
//  * 1. 智能引号：支持英文冒号+空格的中英混排判定 (Tyler 提到: "Text" -> 「Text」)
//  * 2. 括号优化：左括号前加空格，右括号后加空格 (text(text) -> text (text))
//  * 3. 基础排版：中英文间距、撇号优化
//  * 4. 严格保护：代码块、LaTeX、链接 URL 不受影响
//  */

// hexo.extend.filter.register('before_post_render', function(data) {
//     let content = data.content;
//     const markers = []; 
    
//     // --- 1. 保护机制 (Masking Phase) ---
//     const mask = (str, regex) => {
//         return str.replace(regex, (match) => {
//             const key = `___MASK_${markers.length}___`;
//             markers.push(match);
//             return key;
//         });
//     };

//     // 保护顺序：Block Code -> Inline Code -> HTML -> Math -> Link URLs
//     content = mask(content, /```[\s\S]*?```/g);
//     content = mask(content, /`[^`]+`/g);
//     content = mask(content, /<[^>]+>/g);
//     content = mask(content, /\$\$[\s\S]*?\$\$/g);
//     content = mask(content, /\\\[[\s\S]*?\\\]/g);
//     content = mask(content, /\\\([\s\S]*?\\\)/g);
//     content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


//     // --- 2. 文本替换 (Processing Phase) ---

//     // 2.1 英文撇号优化
//     content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");


//     // 2.2 括号间距处理
//     // 左括号前：如果是非空白字符（且非左括号本身），插入空格
//     content = content.replace(/([^\s(])\(/g, '$1 (');
    
//     // 右括号后：如果是汉字、字母、数字，插入空格
//     // 也就是：如果右括号后面紧跟的是标点符号（, . : ;），则不加空格
//     content = content.replace(/\)([\u4e00-\u9fa5a-zA-Z0-9])/g, ') $1');


//     // 2.3 中英文/数字间距优化 (盘古之白)
//     content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
//     content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');


//     // 2.4 透视眼智能引号 (Smart Quotes with Look-around)
//     content = content.replace(/"([^"]*?)"/g, (match, inner, offset, fullStr) => {
//         // A. 如果内部有中文，直接用「」
//         if (/[\u4e00-\u9fa5]/.test(inner)) return `「${inner}」`;

//         // B. 如果内部是纯英文，检查“外部环境”
//         // 向前看 10 个字符，向后看 10 个字符，忽略中间的标点和空格
        
//         const lookBackDist = 10;
//         const start = Math.max(0, offset - lookBackDist);
//         const beforeChunk = fullStr.slice(start, offset);
        
//         const end = Math.min(fullStr.length, offset + match.length + lookBackDist);
//         const afterChunk = fullStr.slice(offset + match.length, end);

//         // 正则判定：
//         // 前方：以 [中文] + [任意数量空格或标点] 结尾
//         const hasChinesePre = /[\u4e00-\u9fa5][\s!.,:;?]*$/.test(beforeChunk);
        
//         // 后方：以 [任意数量空格或标点] + [中文] 开头
//         const hasChinesePost = /^[\s!.,:;?]*[\u4e00-\u9fa5]/.test(afterChunk);

//         if (hasChinesePre || hasChinesePost) {
//             return `「${inner}」`;
//         } else {
//             return `“${inner}”`; // 只有纯纯的英文语境才用弯引号
//         }
//     });


//     // --- 3. 还原机制 (Restore Phase) ---
//     markers.forEach((val, idx) => {
//         const key = `___MASK_${idx}___`;
//         content = content.replace(key, () => val);
//     });

//     data.content = content;
//     return data;
// });


// /**
//  * Hexo Auto Typography Script (Fixed Version)
//  * 修复：彻底解决代码块、HTML内容、Hexo标签被误伤的问题
//  */

// hexo.extend.filter.register('before_post_render', function(data) {
//     let content = data.content;
//     const markers = []; 
    
//     // --- 1. 保护机制 (Masking Phase) ---
//     // 核心逻辑：将不需要处理的部分先替换成占位符，处理完后再换回来
//     const mask = (str, regex) => {
//         return str.replace(regex, (match) => {
//             const key = `___MASK_${markers.length}___`;
//             markers.push(match);
//             return key;
//         });
//     };

//     // 【重要】保护顺序调整：先保护大块结构，再保护行内结构
    
//     // 1.1 Hexo 专用标签 (如 {% codeblock %}, {% raw %} 等)
//     // 必须最先保护，因为它们可能包含复杂的代码或 HTML
//     content = mask(content, /\{%[\s\S]*?%\}/g);

//     // 1.2 HTML 块级保护 (保护 <script>, <style>, <pre>, <code> 及其内部所有内容)
//     // 原来的 <[^>]+> 只能保护标签本身，这里我们需要保护标签+内容
//     content = mask(content, /<script[\s\S]*?<\/script>/gi);
//     content = mask(content, /<style[\s\S]*?<\/style>/gi);
//     content = mask(content, /<pre[\s\S]*?<\/pre>/gi);
//     content = mask(content, /<code[\s\S]*?<\/code>/gi);

//     // 1.3 Markdown 代码块 (支持 ``` 和 ~~~)
//     content = mask(content, /```[\s\S]*?```/g);
//     content = mask(content, /~~~[\s\S]*?~~~/g);

//     // 1.4 Markdown 行内代码
//     content = mask(content, /`[^`]+`/g);

//     // 1.5 数学公式 (LaTeX)
//     content = mask(content, /\$\$[\s\S]*?\$\$/g);
//     content = mask(content, /\\\[[\s\S]*?\\\]/g);
//     content = mask(content, /\\\([\s\S]*?\\\)/g);

//     // 1.6 普通 HTML 标签 (保护属性中的引号，如 <a title="Text">)
//     // 此时 <pre><code> 等已被上面 1.2 保护，这里只剩普通的 div, span, img 等
//     content = mask(content, /<[^>]+>/g);

//     // 1.7 Markdown 链接/图片语法 (防止破坏 URL)
//     content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


//     // --- 2. 文本替换 (Processing Phase) ---
//     // (这部分逻辑保持不变)

//     // 2.1 英文撇号优化
//     content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");

//     // 2.2 括号间距处理
//     content = content.replace(/([^\s(])\(/g, '$1 (');
//     content = content.replace(/\)([\u4e00-\u9fa5a-zA-Z0-9])/g, ') $1');

//     // 2.3 中英文/数字间距优化 (盘古之白)
//     content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
//     content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');

//     // 2.4 透视眼智能引号
//     content = content.replace(/"([^"]*?)"/g, (match, inner, offset, fullStr) => {
//         if (/[\u4e00-\u9fa5]/.test(inner)) return `「${inner}」`;

//         const lookBackDist = 10;
//         const start = Math.max(0, offset - lookBackDist);
//         const beforeChunk = fullStr.slice(start, offset);
        
//         const end = Math.min(fullStr.length, offset + match.length + lookBackDist);
//         const afterChunk = fullStr.slice(offset + match.length, end);

//         const hasChinesePre = /[\u4e00-\u9fa5][\s!.,:;?]*$/.test(beforeChunk);
//         const hasChinesePost = /^[\s!.,:;?]*[\u4e00-\u9fa5]/.test(afterChunk);

//         if (hasChinesePre || hasChinesePost) {
//             return `「${inner}」`;
//         } else {
//             return `“${inner}”`; 
//         }
//     });


//     // --- 3. 还原机制 (Restore Phase) ---
//     markers.forEach((val, idx) => {
//         const key = `___MASK_${idx}___`;
//         // 使用函数返回 val，防止 val 中包含特殊字符（如 $&）导致 replace 错误
//         content = content.replace(key, () => val);
//     });

//     data.content = content;
//     return data;
// });


/**
 * Hexo Auto Typography Script (Version 1.2)
 * 修复：解决 Markdown 语法标记（如删除线、粗体）紧贴括号时被误加空格导致渲染失效的问题
 */

// hexo.extend.filter.register('before_post_render', function(data) {
//     let content = data.content;
//     const markers = []; 
    
//     // --- 1. 保护机制 (Masking Phase) ---
//     const mask = (str, regex) => {
//         return str.replace(regex, (match) => {
//             const key = `___MASK_${markers.length}___`;
//             markers.push(match);
//             return key;
//         });
//     };

//     // 1.1 Hexo 专用标签
//     content = mask(content, /\{%[\s\S]*?%\}/g);

//     // 1.2 HTML 块级保护
//     content = mask(content, /<script[\s\S]*?<\/script>/gi);
//     content = mask(content, /<style[\s\S]*?<\/style>/gi);
//     content = mask(content, /<pre[\s\S]*?<\/pre>/gi);
//     content = mask(content, /<code[\s\S]*?<\/code>/gi);

//     // 1.3 Markdown 代码块
//     content = mask(content, /```[\s\S]*?```/g);
//     content = mask(content, /~~~[\s\S]*?~~~/g);

//     // 1.4 Markdown 行内代码
//     content = mask(content, /`[^`]+`/g);

//     // 1.5 数学公式
//     content = mask(content, /\$\$[\s\S]*?\$\$/g);
//     content = mask(content, /\\\[[\s\S]*?\\\]/g);
//     content = mask(content, /\\\([\s\S]*?\\\)/g);

//     // 1.6 普通 HTML 标签
//     content = mask(content, /<[^>]+>/g);

//     // 1.7 Markdown 链接/图片语法
//     content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


//     // --- 2. 文本替换 (Processing Phase) ---

//     // 2.1 英文撇号优化
//     content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");

//     // 2.2 括号间距处理 (已修复)
//     // 逻辑：如果在左括号前不是空格、且不是(、也不是Markdown标记符(~*_\[#)，则加空格
//     // 这样 `~~(text)~~` 或 `**(text)**` 就不会被拆开了
//     content = content.replace(/([^\s(~*_\[#])\(/g, '$1 (');
    
//     // 右括号逻辑保持不变，通常右括号后接中文或英文都需要空格，但如果是 Markdown 结束符通常会在 mask 阶段或后续渲染处理，
//     // 为了保险起见，如果右括号紧挨着 ~ * _ 等也不加空格可能更稳妥，但目前的问题主要是左括号。
//     // 这里保持原样即可，因为 `)~~` 中 `~` 不在 \u4e00-\u9fa5a-zA-Z0-9 范围内，所以不会被加空格。
//     content = content.replace(/\)([\u4e00-\u9fa5a-zA-Z0-9])/g, ') $1');

//     // 2.3 中英文/数字间距优化
//     content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
//     content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');

//     // 2.4 透视眼智能引号
//     content = content.replace(/"([^"]*?)"/g, (match, inner, offset, fullStr) => {
//         if (/[\u4e00-\u9fa5]/.test(inner)) return `「${inner}」`;

//         const lookBackDist = 10;
//         const start = Math.max(0, offset - lookBackDist);
//         const beforeChunk = fullStr.slice(start, offset);
        
//         const end = Math.min(fullStr.length, offset + match.length + lookBackDist);
//         const afterChunk = fullStr.slice(offset + match.length, end);

//         const hasChinesePre = /[\u4e00-\u9fa5][\s!.,:;?]*$/.test(beforeChunk);
//         const hasChinesePost = /^[\s!.,:;?]*[\u4e00-\u9fa5]/.test(afterChunk);

//         if (hasChinesePre || hasChinesePost) {
//             return `「${inner}」`;
//         } else {
//             return `“${inner}”`; 
//         }
//     });


//     // --- 3. 还原机制 (Restore Phase) ---
//     markers.forEach((val, idx) => {
//         const key = `___MASK_${idx}___`;
//         content = content.replace(key, () => val);
//     });

//     data.content = content;
//     return data;
// });




/**
 * Hexo Auto Typography Script (Version 1.3 - Stability Fix)
 * 
 * 修复记录 (V1.3):
 * 1. 彻底解决 Markdown/LaTeX 语法破坏问题：
 *    - 修复了 `$(1/2)$` 被拆分为 `$ (1/2) $` 的 Bug。
 *    - 修复了 `**banana**` 等 Markdown 标记被误加空格的问题。
 * 2. 逻辑变更：括号间距逻辑由“黑名单排除”改为“白名单匹配”。
 *    - 旧逻辑：只要前面不是 * ~ _ 就加空格（容易误伤 $ 等符号）。
 *    - 新逻辑：只有前面是【汉字、字母、数字】时，才加空格。
 */

hexo.extend.filter.register('before_post_render', function(data) {
    let content = data.content;
    const markers = []; 
    
    // --- 1. 保护机制 (Masking Phase) ---
    const mask = (str, regex) => {
        return str.replace(regex, (match) => {
            const key = `___MASK_${markers.length}___`;
            markers.push(match);
            return key;
        });
    };

    // 1.1 Hexo 专用标签
    content = mask(content, /\{%[\s\S]*?%\}/g);

    // 1.2 HTML 块级保护
    content = mask(content, /<script[\s\S]*?<\/script>/gi);
    content = mask(content, /<style[\s\S]*?<\/style>/gi);
    content = mask(content, /<pre[\s\S]*?<\/pre>/gi);
    content = mask(content, /<code[\s\S]*?<\/code>/gi);

    // 1.3 Markdown 代码块
    content = mask(content, /```[\s\S]*?```/g);
    content = mask(content, /~~~[\s\S]*?~~~/g);

    // 1.4 Markdown 行内代码
    content = mask(content, /`[^`]+`/g);

    // 1.5 数学公式 (Block & Inline)
    content = mask(content, /\$\$[\s\S]*?\$\$/g);
    content = mask(content, /\\\[[\s\S]*?\\\]/g);
    content = mask(content, /\\\([\s\S]*?\\\)/g);
    // 【建议】如果你的文章大量使用 $...$ 行内公式，建议开启下方这行（需小心误伤 $价格$）
    // content = mask(content, /\$(?!\s)[^$\n]+?(?<!\s)\$/g); 

    // 1.6 普通 HTML 标签
    content = mask(content, /<[^>]+>/g);

    // 1.7 Markdown 链接/图片 URL
    content = mask(content, /!{0,1}\[[^\]]*\]\([^)]+\)/g);


    // --- 2. 文本替换 (Processing Phase) ---

    // 2.1 英文撇号优化
    content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, "$1’$2");

    // 2.2 括号间距处理 (Fixed V1.3 - Whitelist Mode)
    // 逻辑变更：只在【汉字/字母/数字】与【括号】之间加空格。
    // 这样 $、*、_、~、#、@ 等所有符号都不会触发加空格，彻底保护 Markdown/LaTeX 语法。
    
    // 左括号：前一个字符必须是 汉字、字母、数字
    // 修复：$(1/2) -> 保持 $(1/2) (因为 $ 不在白名单)
    // 修复：**(text) -> 保持 **(text) (因为 * 不在白名单)
    // 正常：text(text) -> text (text)
    content = content.replace(/([\u4e00-\u9fa5a-zA-Z0-9])\(/g, '$1 (');
    
    // 右括号：后一个字符必须是 汉字、字母、数字
    // 修复：(1/2)$ -> 保持 (1/2)$ (因为 $ 不在白名单)
    content = content.replace(/\)([\u4e00-\u9fa5a-zA-Z0-9])/g, ') $1');


    // 2.3 中英文/数字间距优化 (盘古之白)
    content = content.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
    content = content.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');


    // 2.4 透视眼智能引号
    content = content.replace(/"([^"]*?)"/g, (match, inner, offset, fullStr) => {
        if (/[\u4e00-\u9fa5]/.test(inner)) return `「${inner}」`;

        const lookBackDist = 10;
        const start = Math.max(0, offset - lookBackDist);
        const beforeChunk = fullStr.slice(start, offset);
        
        const end = Math.min(fullStr.length, offset + match.length + lookBackDist);
        const afterChunk = fullStr.slice(offset + match.length, end);

        const hasChinesePre = /[\u4e00-\u9fa5][\s!.,:;?]*$/.test(beforeChunk);
        const hasChinesePost = /^[\s!.,:;?]*[\u4e00-\u9fa5]/.test(afterChunk);

        if (hasChinesePre || hasChinesePost) {
            return `「${inner}」`;
        } else {
            return `“${inner}”`; 
        }
    });


    // --- 3. 还原机制 (Restore Phase) ---
    markers.forEach((val, idx) => {
        const key = `___MASK_${idx}___`;
        content = content.replace(key, () => val);
    });

    data.content = content;
    return data;
});