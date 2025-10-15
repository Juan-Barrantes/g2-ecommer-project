import { listOrders, cancelOrder } from '../store.js';
import { formatDate, formatPrice } from '../utils/format.js';

const paymentLabels = {
  tarjeta: 'Tarjeta',
  contraentrega: 'Pago contraentrega',
  transferencia: 'Transferencia bancaria',
  yape: 'Yape/Plin (QR)',
};

const statusColors = {
  'Orden confirmada': 'bg-blue-100 text-blue-600',
  'Pedido en preparación': 'bg-amber-100 text-amber-600',
  'En camino': 'bg-emerald-100 text-emerald-600',
  'Entrega realizada': 'bg-slate-200 text-slate-600',
  Recibida: 'bg-blue-100 text-blue-600',
  Cancelada: 'bg-rose-100 text-rose-600',
};

export default function renderOrders() {
  const app = document.getElementById('app');
  const orders = listOrders();
  app.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Mis órdenes</h1>
      ${orders.length ? '' : '<div class="text-slate-500">Aún no tienes compras.</div>'}
      <div class="space-y-4">
        ${orders.map((o, idx)=>`
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div class="space-y-1">
                  <div class="text-xs uppercase tracking-wide text-slate-400">Orden</div>
                  <div class="font-semibold text-slate-800">${o.id}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs uppercase tracking-wide text-slate-400">Fecha</div>
                  <div class="text-sm text-slate-600">${formatDate(o.createdAt)}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-xs uppercase tracking-wide text-slate-400">Artículos</div>
                  <div class="text-sm text-slate-600">${o.items.length}</div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[o.status] || 'bg-slate-100 text-slate-600'}">${o.status}</span>
                <div class="text-sm font-semibold text-slate-700">${formatPrice(o.totals.total)}</div>
                <button data-target="order-detail-${idx}" aria-controls="order-detail-${idx}" aria-expanded="false" class="order-toggle inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600">
                  <span class="order-toggle__icon material-icons-outlined text-base">expand_more</span>
                  <span class="order-toggle__text">Ver detalle</span>
                </button>
              </div>
            </div>
            <div id="order-detail-${idx}" class="order-detail hidden mt-4 space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4" aria-hidden="true">
              <div class="grid gap-4 text-sm sm:grid-cols-2">
                <div class="space-y-1">
                  <div class="text-xs uppercase tracking-wide text-slate-400">Cliente</div>
                  <div class="font-medium text-slate-700">${o.customer?.name || '—'}</div>
                  ${o.customer?.phone ? `<div class="text-xs text-slate-500">Tel: ${o.customer.phone}</div>` : ''}
                  ${o.customer?.address ? `<div class="text-xs text-slate-500">${o.customer.address}</div>` : ''}
                  ${o.payment ? `<div class="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Pago: ${paymentLabels[o.payment] || o.payment}</div>` : ''}
                  ${o.fulfillment ? `
                    <div class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      <div class="font-semibold text-slate-700">Modalidad: ${o.fulfillment.method === 'pickup' ? 'Recojo en tienda' : 'Delivery'}</div>
                      ${o.fulfillment.method === 'pickup' && o.fulfillment.pickupStore ? `
                        <div class="mt-1 text-slate-600">
                          <div class="font-semibold text-slate-700">${o.fulfillment.pickupStore.name || 'Tienda seleccionada'}</div>
                          ${o.fulfillment.pickupStore.address ? `<div class="text-[11px] text-slate-500">${o.fulfillment.pickupStore.address}</div>` : ''}
                          ${o.fulfillment.pickupStore.hours ? `<div class="text-[11px] text-slate-500">Horario: ${o.fulfillment.pickupStore.hours}</div>` : ''}
                          ${o.fulfillment.pickupStore.phone ? `<div class="text-[11px] text-slate-500">Tel: ${o.fulfillment.pickupStore.phone}</div>` : ''}
                        </div>
                      ` : ''}
                      ${o.fulfillment.method !== 'pickup' && o.fulfillment.deliveryDate ? `<div class="mt-1 text-slate-600">Fecha solicitada: ${o.fulfillment.deliveryDate}</div>` : ''}
                    </div>
                  ` : ''}
                </div>
                <div class="grid gap-1">
                  <div class="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>${formatPrice(o.totals.subtotal)}</span></div>
                  <div class="flex justify-between text-xs text-slate-500"><span>Envío</span><span>${o.totals.shipping === 0 ? 'Gratis' : formatPrice(o.totals.shipping)}</span></div>
                  <div class="flex justify-between text-sm font-semibold text-slate-700"><span>Total</span><span>${formatPrice(o.totals.total)}</span></div>
                </div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wide text-slate-400">Detalle de productos</div>
                <ul class="mt-3 space-y-2">
                  ${o.items.map(item=>`
                    <li class="rounded-lg bg-white p-3 shadow-sm">
                      <div class="flex justify-between text-sm font-medium text-slate-700">
                        <span>${item.name}</span>
                        <span>${formatPrice(item.price * item.qty)}</span>
                      </div>
                      <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>${item.qty} ${item.unit}</span>
                        <span>Precio unitario: ${formatPrice(item.price)}</span>
                      </div>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ${o.notes ? `<div class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"><span class="font-semibold text-slate-700">Notas:</span> ${o.notes}</div>` : ''}
              <div class="flex flex-wrap gap-2 pt-2">
                <a href="#/tracking?id=${encodeURIComponent(o.id)}" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
                  <span class="material-icons-outlined text-base">timeline</span>
                  Ver tracking
                </a>
                ${o.status !== 'Cancelada' ? `
                  <button
                    class="cancel-order-btn inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    data-id="${o.id}"
                    type="button"
                  >
                    <span class="material-icons-outlined text-base">cancel</span>
                    Anular orden
                  </button>
                ` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

  app.querySelectorAll('.order-toggle').forEach(btn => {
    const targetId = btn.dataset.target;
    const detail = document.getElementById(targetId);
    if (!detail) return;
    btn.addEventListener('click', () => {
      detail.classList.toggle('hidden');
      const opened = !detail.classList.contains('hidden');
      detail.setAttribute('aria-hidden', String(!opened));
      btn.setAttribute('aria-expanded', String(opened));
      const icon = btn.querySelector('.order-toggle__icon');
      const text = btn.querySelector('.order-toggle__text');
      if (icon) icon.textContent = opened ? 'expand_less' : 'expand_more';
      if (text) text.textContent = opened ? 'Ocultar detalle' : 'Ver detalle';
    });
  });

  app.querySelectorAll('.cancel-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { id } = btn.dataset;
      if (!id) return;
      if (!window.confirm('¿Deseas anular esta orden?')) return;
      const cancelled = cancelOrder(id);
      if (cancelled) renderOrders();
    });
  });
}
