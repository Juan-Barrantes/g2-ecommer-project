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
    if (app) {
      app.innerHTML = '<div class="max-w-7xl mx-auto p-6"><div class="h-10 w-10 rounded-full skeleton"></div></div>';
    }
    try {
      await Promise.resolve(renderer({ segments, query }));
    } catch (error) {
      console.error('Router render error:', error);
      if (app) {
        app.innerHTML = `
          <div class="max-w-4xl mx-auto px-6 py-16 text-center">
            <div class="mx-auto w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <span class="material-icons-outlined text-3xl">error_outline</span>
            </div>
            <h1 class="text-2xl font-bold mt-4 text-slate-800">No pudimos cargar la vista</h1>
            <p class="mt-2 text-slate-500">Intenta recargar la página o volver al inicio.</p>
            <a href="#/" class="inline-flex items-center gap-2 mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              <span class="material-icons-outlined text-base">home</span>
              Ir al inicio
            </a>
          </div>
        `;
      }
    }
  }
  window.addEventListener('hashchange', handle);
  window.addEventListener('load', handle);
  handle();
}

export function currentPath() {
  return parseHash();
}
