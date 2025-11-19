/*
 * Mocked LinkedIn Share Widget (Offline)
 * Version: 1.0.0
 * Files: third-party/linkedin-share.js, third-party/linkedin-share.css
 * Public API:
 *   LinkedInShare.init({ container, theme = 'light', locale = 'en-US' })
 *   LinkedInShare.open({ url, title, summary, source, tags })
 * Events (window):
 *   'linkedin:ready', 'linkedin:opened', 'linkedin:shared', 'linkedin:closed'
 */
(function (global) {
  const NS = 'lisw'; // namespace prefix for CSS hooks

  /** @type {HTMLElement|null} */
  let containerEl = null;
  let initialized = false;
  let theme = 'light';
  let locale = 'en-US';
  let modalOpen = false;
  let lastFocus = null; // element that triggered open

  function dispatch(name, detail) {
    const evt = new CustomEvent(name, { detail });
    global.dispatchEvent(evt);
  }

  function ensureContainer(container) {
    if (container instanceof HTMLElement) return container;
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (el) return el;
    }
    // Create a default root if not provided/found
    let root = document.getElementById(`${NS}-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${NS}-root`;
      document.body.appendChild(root);
    }
    return root;
  }

  function trapFocus(modal) {
    const focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKeyDown(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    }

    modal.addEventListener('keydown', onKeyDown);
    return () => modal.removeEventListener('keydown', onKeyDown);
  }

  function sanitize(text, max = 250) {
    const div = document.createElement('div');
    div.innerHTML = String(text || '');
    const value = div.textContent || div.innerText || '';
    return value.trim().replace(/\s+/g, ' ').slice(0, max);
  }

  function createModal(payload) {
    const root = document.createElement('div');
    root.className = `${NS}-backdrop ${NS}-theme-${theme}`;
    root.setAttribute('data-theme', theme);

    const dialog = document.createElement('div');
    dialog.className = `${NS}-dialog`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', `${NS}-title`);
    dialog.setAttribute('aria-describedby', `${NS}-desc`);

    const header = document.createElement('div');
    header.className = `${NS}-header`;

    const title = document.createElement('h2');
    title.className = `${NS}-title`;
    title.id = `${NS}-title`;
    title.textContent = 'Share to LinkedIn (Mock)';

    const closeBtn = document.createElement('button');
    closeBtn.className = `${NS}-close`;
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close share dialog');
    closeBtn.innerHTML = '&times;';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = `${NS}-body`;

    const meta = document.createElement('div');
    meta.className = `${NS}-meta`;

    const url = document.createElement('p');
    url.innerHTML = `<strong>URL:</strong> <span>${payload.url}</span>`;

    const pTitle = document.createElement('p');
    pTitle.innerHTML = `<strong>Title:</strong> <span>${payload.title}</span>`;

    const summary = document.createElement('p');
    summary.id = `${NS}-desc`;
    summary.innerHTML = `<strong>Summary:</strong> <span>${sanitize(payload.summary)}</span>`;

    const source = document.createElement('p');
    source.innerHTML = `<strong>Source:</strong> <span>${payload.source || 'App'}</span>`;

    const tags = document.createElement('p');
    const tagStr = (payload.tags || []).slice(0, 5).join(', ');
    tags.innerHTML = `<strong>Tags:</strong> <span>${tagStr}</span>`;

    meta.append(url, pTitle, summary, source, tags);

    const footer = document.createElement('div');
    footer.className = `${NS}-footer`;

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = `${NS}-btn ${NS}-btn-primary`;
    shareBtn.textContent = 'Share';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = `${NS}-btn`;
    cancelBtn.textContent = 'Cancel';

    footer.append(shareBtn, cancelBtn);

    dialog.append(header, body, meta, footer);
    root.appendChild(dialog);

    function onBackdropClick(e) {
      if (e.target === root) closeModal();
    }

    root.addEventListener('click', onBackdropClick);

    const cleanupFocusTrap = trapFocus(dialog);

    function removeAll() {
      cleanupFocusTrap();
      root.removeEventListener('click', onBackdropClick);
      root.remove();
    }

    function wire() {
      shareBtn.addEventListener('click', function () {
        dispatch('linkedin:shared', { url: payload.url, title: payload.title, locale });
        closeModal();
      });
      cancelBtn.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', closeModal);
    }

    return { root, dialog, wire, removeAll };
  }

  function openModal(payload) {
    if (!initialized || modalOpen) return;
    modalOpen = true;

    const { root, dialog, wire, removeAll } = createModal(payload);
    containerEl.appendChild(root);

    // focus handling
    setTimeout(() => {
      const firstButton = dialog.querySelector('button');
      if (firstButton) firstButton.focus();
    }, 0);

    wire();
    dispatch('linkedin:opened', payload);

    // Expose closer for Escape/backdrop etc
    LinkedInShare.__active = { removeAll };
  }

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    if (LinkedInShare.__active) {
      LinkedInShare.__active.removeAll();
      LinkedInShare.__active = null;
    }
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
    dispatch('linkedin:closed');
  }

  const LinkedInShare = {
    /**
     * Initialize the widget once.
     * @param {{container?: HTMLElement|string, theme?: 'light'|'dark', locale?: string}} options
     */
    init(options = {}) {
      if (initialized) return;
      containerEl = ensureContainer(options.container);
      theme = options.theme === 'dark' ? 'dark' : 'light';
      locale = options.locale || 'en-US';
      containerEl.classList.add(`${NS}-container`);
      initialized = true;
      dispatch('linkedin:ready', { theme, locale });
    },

    /**
     * Open the share modal. Payload fields: { url, title, summary, source, tags }
     * @param {Object} payload
     */
    open(payload) {
      if (!initialized) {
        console.warn('[LinkedInShare] init() must be called before open()');
        return;
      }
      lastFocus = document.activeElement;
      const data = {
        url: String(payload.url || '#'),
        title: String(payload.title || 'Untitled'),
        summary: sanitize(payload.summary || ''),
        source: String(payload.source || ''),
        tags: Array.isArray(payload.tags) ? payload.tags.slice(0, 5) : []
      };
      openModal(data);
    },

    /** Update theme at runtime (optional helper) */
    setTheme(next) {
      theme = next === 'dark' ? 'dark' : 'light';
      const backdrops = containerEl.querySelectorAll(`.${NS}-backdrop`);
      backdrops.forEach(b => {
        b.classList.remove(`${NS}-theme-light`, `${NS}-theme-dark`);
        b.classList.add(`${NS}-theme-${theme}`);
        b.setAttribute('data-theme', theme);
      });
    },

    /** Private handle for cleanup */
    __active: null
  };

  // expose globally
  global.LinkedInShare = LinkedInShare;
})(window);