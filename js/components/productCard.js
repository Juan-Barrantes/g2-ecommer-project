import { formatPrice } from '../utils/format.js';
import { addToCart, priceFor } from '../store.js';
import { showToast } from './toast.js';

export function productCard(p) {
  const minPrice = priceFor(p, p.moq || 1);
  return `
  <div class="group rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-soft transition overflow-hidden">
    <a href="#/producto/${p.id}" class="block">
      <div class="aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center">
        <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div class="text-sm text-slate-500">${p.category}</div>
          <div class="mt-1 font-semibold line-clamp-2">${p.name}</div>
          <div class="mt-1 text-lg font-bold">${formatPrice(minPrice)}</div>
        </div>
      </div>
      <div class="p-4">
        <div class="text-xs text-slate-500 mb-1">${p.brand} • ${p.unit}</div>
        <div class="mt-2 flex items-end gap-2">
          <div class="text-xs text-slate-500">MOQ ${p.moq || 1} • Stock ${p.stock}</div>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(p.tags||[]).slice(0,2).map(t=>`<span class=\"text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600\">${t}</span>`).join('')}
        </div>
      </div>
    </a>
    <div class="px-4 pb-4">
      <button data-id="${p.id}" class="w-full add-btn mt-1 px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">Agregar</button>
    </div>
  </div>`;
}

export function bindProductCardEvents(root) {
  root.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id, 1);
      showToast('Producto agregado al carrito');
      document.dispatchEvent(new CustomEvent('cart:updated'));
    });
  });
}
