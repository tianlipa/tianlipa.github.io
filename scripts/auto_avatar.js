const fs = require('fs');
const path = require('path');

hexo.extend.injector.register('body_end', function() {
  
  const avatarDir = path.join(hexo.source_dir, 'img/avatar');
  let avatars = [];

  try {
    if (fs.existsSync(avatarDir)) {
      const files = fs.readdirSync(avatarDir);
      avatars = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                     .map(file => '/img/avatar/' + file);
    }
  } catch (e) {
    console.error('读取头像目录失败:', e);
  }

  return `
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      const avatars = ${JSON.stringify(avatars)};
      
      if (avatars.length > 0) {
        const randomIndex = Math.floor(Math.random() * avatars.length);
        const avatarElement = document.querySelector('.site-author-image');
        if (avatarElement) {
          avatarElement.src = avatars[randomIndex];
        }
      }
    });
  </script>
  `;
});