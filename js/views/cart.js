import { cartSummary, updateQty, removeFromCart, shippingFor } from '../store.js';
import { formatPrice } from '../utils/format.js';
import { navigate } from '../router.js';

export default function renderCart() {
  const app = document.getElementById('app');
  const { detailed, subtotal, items } = cartSummary();
  const shipping = detailed.length ? shippingFor(subtotal) : 0;
  const total = subtotal + shipping;

  app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 class="text-2xl font-bold text-slate-900">Mi carrito</h1>
          ${detailed.length ? `<span class="text-sm text-slate-500">${items} ${items === 1 ? 'producto' : 'productos'} en tu carrito</span>` : ''}
        </div>
        <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <aside class="order-first md:order-last md:pl-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:sticky md:top-24">
              <div class="flex items-center justify-between">
                <div class="text-lg font-bold">Resumen</div>
                <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Total</div>
              </div>
              <div class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                <div class="flex justify-between"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
              </div>
              <div class="mt-4 flex items-center justify-between border-t pt-4">
                <span class="text-sm font-semibold text-slate-600">Total a pagar</span>
                <span class="text-xl font-semibold text-slate-900">${formatPrice(total)}</span>
              </div>
              <div class="mt-4 space-y-2">
                <label for="deliveryDate" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha de delivery</label>
                <input id="deliveryDate" type="date" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                <p id="deliveryDateMessage" class="hidden text-xs font-medium text-brand-600">Fecha de delivery agendada</p>
              </div>
              <button id="checkoutBtn" class="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1" ${detailed.length? '' : 'disabled opacity-40'}>Proceder al pago</button>
              ${!detailed.length ? '<p class="mt-3 text-xs text-slate-500">Agrega productos desde el catálogo para continuar con tu compra.</p>' : '<p class="mt-3 text-xs text-slate-500">Revisaremos tu pedido antes de coordinar la entrega refrigerada.</p>'}
            </div>
          </aside>
          <section class="order-last md:order-first space-y-4">
            ${detailed.length ? '' : '<div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">Tu carrito está vacío. Explora el catálogo para agregar productos.</div>'}
            ${detailed.map(d=>`
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div class="flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <img src="${d.product.image}" class="h-28 w-full object-cover sm:h-24 sm:w-24" alt="${d.product.name}"/>
                  </div>
                  <div class="flex-1 space-y-3">
                    <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="text-base font-semibold text-slate-900">${d.product.name}</div>
                        <div class="text-xs font-medium uppercase tracking-wide text-brand-600">${d.product.brand}</div>
                        <div class="text-xs text-slate-500">Presentación: ${d.product.unit}</div>
                      </div>
                      <div class="text-right sm:text-left">
                        <div class="text-xs text-slate-500">Precio unitario</div>
                        <div class="text-base font-semibold text-slate-900">${formatPrice(d.unitPrice)}</div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div class="flex items-center gap-2">
                        <label class="text-xs font-medium text-slate-500" for="item-${d.id}">Cantidad</label>
                        <input id="item-${d.id}" data-id="${d.id}" type="number" min="1" value="${d.qty}" class="qty w-full max-w-[96px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"/>
                      </div>
                      <div class="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 sm:justify-end">
                        <span>Subtotal</span>
                        <span>${formatPrice(d.line)}</span>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <button data-id="${d.id}" class="rm inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-500 transition hover:border-brand-200 hover:text-brand-600">
                        <span class="material-icons-outlined text-base">delete</span>
                        Quitar
                      </button>
                      <span>Stock estimado inmediato</span>
                    </div>
                  </div>
                </div>
              </article>`).join('')}
          </section>
        </div>
      </div>
    </div>
  `;

  app.querySelectorAll('.qty').forEach(inp=>{
    inp.addEventListener('change', (e)=>{
      const id = Number(e.currentTarget.dataset.id);
      const val = Number(e.currentTarget.value||1);
      updateQty(id, val);
      document.dispatchEvent(new CustomEvent('cart:updated'));
      renderCart();
    });
  });
  app.querySelectorAll('.rm').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(e.currentTarget.dataset.id);
      removeFromCart(id);
      document.dispatchEvent(new CustomEvent('cart:updated'));
      renderCart();
    });
  });
  document.getElementById('checkoutBtn')?.addEventListener('click', ()=> navigate('/checkout'));
  const deliveryInput = document.getElementById('deliveryDate');
  const deliveryMessage = document.getElementById('deliveryDateMessage');
  if (deliveryInput && deliveryMessage) {
    deliveryInput.addEventListener('change', () => {
      if (deliveryInput.value) {
        deliveryMessage.classList.remove('hidden');
      } else {
        deliveryMessage.classList.add('hidden');
      }
    });
  }
}
