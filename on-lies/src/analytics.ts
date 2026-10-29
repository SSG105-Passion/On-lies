// Public site token for on-lies-game.onrender.com; never use a management API token.
export function initWebAnalytics() {
  // An explicitly empty environment value disables tracking.
  const token = (import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN ?? '733bcadbb04948f09aa0d66be6e47f9f').trim();
  if (!import.meta.env.PROD || !/^[a-f0-9]{32}$/i.test(token)) return;
  if (document.querySelector('script[data-cf-beacon]')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.async = true;
  script.dataset.cfBeacon = JSON.stringify({ token, spa: true });
  document.head.appendChild(script);
}
