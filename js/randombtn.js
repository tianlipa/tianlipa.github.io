document.addEventListener("DOMContentLoaded", function () {
  const urls = [
    "https://www.bilibili.com/video/BV1GJ411x7h7/",
    "https://www.bilibili.com/video/BV11YR3YHEHn/",
    "https://www.bilibili.com/video/BV1gzBNYKEmH/",
    "https://www.bilibili.com/video/BV1yMkEYBEXb/",
    "https://www.bilibili.com/video/BV1Nz4y1R7km/",
    "https://www.bilibili.com/video/BV1KP4y1U72L/",
    "https://www.bilibili.com/video/BV1td4y117Bt/",
    "https://www.bilibili.com/video/BV1xJ411q71r/",
    "https://www.bilibili.com/video/BV1T5KTeuEeV/",
    "https://www.bilibili.com/video/BV1ouYEesE9A/",
    "https://lhlnb.top/hajimi/",
    "https://www.bilibili.com/video/BV1NTkrYBE97/",
    "https://www.bilibili.com/video/BV1nt4y147iK/",
    "https://www.bilibili.com/video/BV1Lv411r7wa/",
    "https://github.com/Red-Killer/shit/",
    "https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/",
    "https://www.bilibili.com/video/BV14Q4y1u7HY/",
    "https://www.bilibili.com/video/BV1Wm421g7gp/",
    "https://www.bilibili.com/video/BV1Vh411r7wt/",
    "https://www.bilibili.com/video/BV12Q4y13721/",
    "https://www.bilibili.com/video/BV1qt411j7fV/",
    "https://www.zhihu.com/people/an-ling-91/posts/",
    "https://xkcd.in/"
  ];
  const btn = document.querySelector(".random-btn a"); 
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    //   window.location.href = randomUrl;
      window.open(randomUrl, "_blank");
    });
  }
});