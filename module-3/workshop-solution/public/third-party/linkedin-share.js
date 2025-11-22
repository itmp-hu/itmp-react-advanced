// Mock LinkedIn Share Widget
// Ez egy egyszerű implementáció demonstrációs célokra

window.LinkedInShare = {
  init: function (config) {
    const element = document.getElementById(config.elementId);
    if (!element) {
      console.error("LinkedIn Share: Element not found:", config.elementId);
      return;
    }

    // Létrehozunk egy share gombot
    const button = document.createElement("button");
    button.className = "linkedin-share-button";
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
      </svg>
      Megosztás LinkedInen
    `;

    button.style.cssText = `
      background-color: #0077b5;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.2s;
    `;

    button.onmouseover = function () {
      this.style.backgroundColor = "#006097";
    };

    button.onmouseout = function () {
      this.style.backgroundColor = "#0077b5";
    };

    button.onclick = function () {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        config.url
      )}`;
      const text = config.text || "";
      const fullUrl = `${shareUrl}&title=${encodeURIComponent(text)}`;

      // Új ablakban megnyitjuk a LinkedIn share oldalt
      window.open(
        fullUrl,
        "linkedin-share",
        "width=600,height=600,menubar=no,toolbar=no"
      );
    };

    // Hozzáadjuk a gomb az elemhez
    element.appendChild(button);
  },
};

console.log("LinkedIn Share Widget loaded");

