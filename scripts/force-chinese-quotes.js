// scripts/force-chinese-quotes.js
hexo.extend.filter.register('markdown-it:renderer', function(md) {
  md.core.ruler.after('inline', 'smart-cn-quotes', function(state) {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue;
      for (const token of block.children) {
        if (token.type !== 'text') continue;
        if (/(\$\$[\s\S]*?\$\$)|(\$[\s\S]*?\$)/.test(token.content)) continue;
        if (token.content.includes('<') && token.content.includes('>')) continue;

        let text = token.content;
        text = text.replace(/"([^"]+?)"/g, '“$1”');
        text = text.replace(
          /(^|[^A-Za-z])'([^']+?)'([^A-Za-z]|$)/g,
          (_, before, content, after) => `${before}‘${content}’${after}`
        );
        token.content = text;
      }
    }
  });
});
