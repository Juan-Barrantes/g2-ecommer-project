import { currentPath } from '../router.js';

export default function renderConfirmation() {
  const app = document.getElementById('app');
  const { query } = currentPath();
  const phone = query.phone || '';
  const id = query.id || '';
  app.innerHTML = `
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
        <span class="material-icons-outlined text-3xl">check_circle</span>
      </div>
      <h1 class="text-2xl font-bold mt-4">¡Compra realizada!</h1>
      <p class="mt-2 text-slate-600">Tu orden <span class="font-semibold">${id}</span> fue registrada. Nos contactaremos al número <span class="font-semibold">${phone}</span> para coordinar la entrega.</p>
      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a href="#/tracking?id=${encodeURIComponent(id)}" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          <span class="material-icons-outlined text-base">near_me</span>
          Ver tracking en vivo
        </a>
        <a href="#/ordenes" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-600">
          <span class="material-icons-outlined text-base">receipt_long</span>
          Ver mis órdenes
        </a>
      </div>
    </div>
  `;
}
