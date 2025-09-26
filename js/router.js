const routes = new Map();

export function addRoute(path, renderFn) {
  routes.set(path, renderFn);
}

function parseHash() {
  const raw = location.hash || '#/';
  const [path, queryString] = raw.split('?');
  const segments = path.replace(/^#/, '').split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  return { raw, path, segments, query };
}

export function navigate(path) {
  if (location.hash !== `#${path}`) location.hash = path;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function startRouter(notFound) {
  async function handle() {
    const app = document.getElementById('app');
    const { segments, query } = parseHash();
    const base = `/${segments[0] || ''}` || '/';
    const renderer = routes.get(base) || notFound;
    app.innerHTML = '<div class="max-w-7xl mx-auto p-6"><div class="h-10 w-10 rounded-full skeleton"></div></div>';
    await Promise.resolve(renderer({ segments, query }));
  }
  window.addEventListener('hashchange', handle);
  window.addEventListener('load', handle);
}

export function currentPath() {
  return parseHash();
}

