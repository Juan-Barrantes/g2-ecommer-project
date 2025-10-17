import { findProduct, addToCart, priceFor } from '../store.js';
import { formatPrice } from '../utils/format.js';
import { showToast } from '../components/toast.js';

export default function renderProduct({ segments }) {
  const id = Number(segments[1]);
  const p = findProduct(id);
  const app = document.getElementById('app');
  if (!p) {
    app.innerHTML = `<div class="max-w-7xl mx-auto p-6">Producto no encontrado</div>`;
    return;
  }
  const minPrice = priceFor(p, p.moq||1);
  app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-2 gap-8">
      <div>
        <div class="rounded-2xl border border-slate-200 w-full aspect-[4/3] bg-slate-50 flex items-center justify-center text-center p-6">
          <div>
            <div class="text-sm text-slate-500">${p.category}</div>
            <h2 class="text-xl font-bold mt-2">${p.name}</h2>
            <div class="mt-2 text-2xl font-extrabold">${formatPrice(minPrice)}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="text-sm text-slate-500">${p.brand} • ${p.unit}</div>
        <h1 class="text-2xl font-bold mt-1">${p.name}</h1>
        <div class="mt-4">
          <div class="text-3xl font-extrabold">${formatPrice(minPrice)}</div>
          <div class="text-xs text-slate-500">desde • Mínimo ${p.moq || 1} uds</div>
        </div>
        <p class="mt-4 text-slate-600">${p.description || ''}</p>

        <div class="mt-6">
          <div class="text-sm font-semibold mb-2">Escala por volumen</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${[...(p.tiers||[]), {minQty: p.moq||1, price: p.price}].sort((a,b)=>a.minQty-b.minQty).map(t=>`
              <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <div class="font-semibold">${formatPrice(t.price)}</div>
                <div class="text-xs text-slate-500">${t.minQty}+ uds</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <input id="qty" type="number" min="${p.moq||1}" step="1" value="${p.moq||1}" class="w-28 px-3 py-2 rounded-xl border border-slate-200" />
          <button id="addBtn" class="px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Agregar al carrito</button>
       
          <a href="#/catalogo" data-route="/catalogo"class="px-5 py-3 rounded-xl border-1 bg-brand-500 text-white font-semibold hover:bg-brand-700">Volver</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('addBtn').addEventListener('click', () => {
    const qty = Math.max(Number(document.getElementById('qty').value||1), p.moq||1);
    addToCart(p.id, qty);
    showToast('Producto agregado al carrito');
    document.dispatchEvent(new CustomEvent('cart:updated'));
  });
}
