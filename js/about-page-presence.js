(function () {
  "use strict";

  const apiUrl = "https://blog-presence-api.tianlipa.workers.dev/api/presence";
  const refreshMs = 5 * 60 * 1000;
  const rootId = "blog-presence";
  const styleId = "blog-presence-style";

  const statusText = {
    active: "在线",
    idle: "走神中",
    private: "摸鱼中",
    offline: "离线"
  };

  const activityText = {
    browsing: "浏览网页",
    coding: "写代码",
    creating: "创作中",
    gaming: "打游戏",
    private: "专注中",
    terminal: "使用终端",
    working: "使用电脑"
  };

  const headlineText = {
    browsing: "正在浏览网页",
    coding: "正在写代码",
    creating: "正在创作",
    gaming: "正在打游戏",
    private: "暂停同步中",
    terminal: "正在使用终端",
    working: "正在使用电脑"
  };

  function formatRelativeTime(value) {
    if (!value) return "暂无记录";

    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return "暂无记录";

    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return "刚刚";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} 分钟前`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;

    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  }

  function createEl(tagName, className, text) {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function injectStyles() {
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .blog-presence {
        margin: 1.35rem 0;
      }

      .presence-card {
        box-sizing: border-box;
        width: 100%;
        max-width: 34rem;
        border: 1px solid var(--content-border-color, rgba(148, 163, 184, 0.32));
        border-radius: 8px;
        padding: 1rem 1.1rem;
        background: var(--content-bg-color, var(--body-bg-color, #fff));
        color: var(--text-color, #222);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
      }

      .presence-card--loading,
      .presence-card--error {
        color: var(--text-color-secondary, #6b7280);
      }

      .presence-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        min-width: 0;
        margin-bottom: 0.72rem;
      }

      .presence-state {
        display: inline-flex;
        align-items: center;
        gap: 0.48rem;
        min-width: 0;
        font-size: 0.94rem;
        font-weight: 600;
      }

      .presence-dot {
        width: 0.58rem;
        height: 0.58rem;
        flex: 0 0 auto;
        border-radius: 999px;
        background: #9ca3af;
        box-shadow: 0 0 0 0.24rem rgba(156, 163, 175, 0.12);
      }

      .presence-card--active .presence-dot {
        background: #16a34a;
        box-shadow: 0 0 0 0.24rem rgba(22, 163, 74, 0.12);
      }

      .presence-card--idle .presence-dot {
        background: #d97706;
        box-shadow: 0 0 0 0.24rem rgba(217, 119, 6, 0.12);
      }

      .presence-card--private .presence-dot {
        background: #6366f1;
        box-shadow: 0 0 0 0.24rem rgba(99, 102, 241, 0.12);
      }

      .presence-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .presence-updated {
        flex: 0 0 auto;
        color: var(--text-color-secondary, #6b7280);
        font-size: 0.82rem;
      }

      .presence-message {
        margin: 0;
        font-size: 1.08rem;
        line-height: 1.55;
        font-weight: 500;
      }

      .presence-meta {
        margin: 0.48rem 0 0;
        color: var(--text-color-secondary, #6b7280);
        font-size: 0.86rem;
        line-height: 1.5;
      }

      @media (max-width: 520px) {
        .presence-card {
          max-width: none;
          padding: 0.95rem 1rem;
        }

        .presence-head {
          align-items: flex-start;
          flex-direction: column;
          gap: 0.32rem;
        }

        .presence-updated {
          padding-left: 1.06rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderLoading(root) {
    root.replaceChildren(
      createEl("div", "presence-card presence-card--loading", "正在读取电脑状态")
    );
  }

  function renderError(root) {
    root.replaceChildren(
      createEl("div", "presence-card presence-card--error", "状态暂不可用")
    );
  }

  function renderPresence(root, data) {
    const status = data && typeof data.status === "string" ? data.status : "offline";
    const isOffline = status === "offline" || data.offline === true;

    const card = createEl("section", `presence-card presence-card--${status}`);
    card.setAttribute("aria-live", "polite");

    const header = createEl("div", "presence-head");
    const state = createEl("div", "presence-state");
    const dot = createEl("span", "presence-dot");
    const label = createEl("span", "presence-label", statusText[status] || "未知");
    const updated = createEl(
      "span",
      "presence-updated",
      `最近更新 ${formatRelativeTime(data && data.heartbeatAt)}`
    );

    state.append(dot, label);
    header.append(state, updated);

    const app = !isOffline && data.app ? data.app : "未知应用";
    const device = data.device ? data.device : "默认设备";
    const message = isOffline
      ? "电脑当前没有上报状态"
      : normalizeHeadline(data.message, data.activity, data.app);

    const body = createEl("p", "presence-message", message);
    const meta = createEl("p", "presence-meta");
    meta.textContent = isOffline ? device : `${app} · ${device}`;

    card.append(header, body, meta);
    root.replaceChildren(card);
  }

  function normalizeHeadline(message, activity, app) {
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }

    if (typeof app === "string" && app.trim()) {
      return `正在运行 ${app.trim()} 程序`;
    }

    return headlineText[activity] || activityText[activity] || "正在使用电脑";
  }

  async function refreshPresence(root) {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      renderPresence(root, await response.json());
    } catch (error) {
      renderError(root);
    }
  }

  function start() {
    const root = document.getElementById(rootId);
    if (!root) return;

    injectStyles();
    renderLoading(root);
    refreshPresence(root);
    window.setInterval(function () {
      refreshPresence(root);
    }, refreshMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
