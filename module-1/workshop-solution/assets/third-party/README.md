# Mocked LinkedIn Share Widget (Offline)

This widget simulates a LinkedIn share flow **without any network calls**.

## Files
- `third-party/linkedin-share.js`
- `third-party/linkedin-share.css`

## Quick Start (vanilla)
```html
<link rel="stylesheet" href="/third-party/linkedin-share.css" />
<script src="/third-party/linkedin-share.js"></script>

<div id="linkedin-share-root"></div>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    LinkedInShare.init({ container: '#linkedin-share-root', theme: 'light', locale: 'en-US' });
    document.getElementById('btn-share').addEventListener('click', () => {
      LinkedInShare.open({
        url: '/courses/advanced-web-design',
        title: 'Advanced Web Design',
        summary: 'I just completed Chapter 5! Great module about responsive grids.',
        source: 'SkillShare Academy',
        tags: ['learning','webdev','skills']
      });
    });
  });
</script>

<button id="btn-share">Share (Mock)</button>
```

## Events
- `linkedin:ready`, `linkedin:opened`, `linkedin:shared`, `linkedin:closed`

## Accessibility
- Proper `role="dialog"`, focus trapping, ESC to close, focus return to trigger.