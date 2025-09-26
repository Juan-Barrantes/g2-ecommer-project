import { navigate } from '../../router.js';
import { currentUser } from '../../store.js';

export default function renderPanelHome({ guard } = {}) {
  const app = document.getElementById('app');
  if (guard && !guard()) {
    app.innerHTML = restricted();
    return;
  }
  const u = currentUser();
  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Panel — ${u?.role?.toUpperCase() || ''}</h1>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        <a href="#/panel-marketing" class="rounded-2xl border p-4 bg-white hover:shadow-soft">
          <div class="font-semibold">Marketing</div>
          <div class="text-sm text-slate-600">Reportes de ventas y performance</div>
        </a>
        <a href="#/panel-almacen" class="rounded-2xl border p-4 bg-white hover:shadow-soft">
          <div class="font-semibold">Almacén</div>
          <div class="text-sm text-slate-600">Stocks, órdenes de compra y arribos</div>
        </a>
        <a href="#/panel-ventas" class="rounded-2xl border p-4 bg-white hover:shadow-soft">
          <div class="font-semibold">Ventas</div>
          <div class="text-sm text-slate-600">Contratos y órdenes de clientes</div>
        </a>
      </div>
    </div>
  `;
}

function restricted() {
  return `
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="text-7xl">🔒</div>
      <h2 class="text-xl font-bold mt-2">Acceso restringido</h2>
      <p class="text-slate-600 mt-2">Debes iniciar sesión con un rol de empresa (marketing, almacén o ventas).</p>
      <a class="inline-block mt-4 px-4 py-2 rounded-xl border" href="#/cuenta">Ir a iniciar sesión</a>
    </div>
  `;
}

