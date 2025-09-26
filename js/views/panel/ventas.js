import { listContracts, listOrders } from '../../store.js';
import { formatDate, formatPrice } from '../../utils/format.js';

export default function renderPanelVentas({ guard } = {}) {
  const app = document.getElementById('app');
  if (guard && !guard()) { app.innerHTML = restricted(); return; }

  const contracts = listContracts();
  const orders = listOrders();

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Ventas — Contratos y Órdenes</h1>

      <section class="rounded-2xl border bg-white mb-6">
        <div class="px-4 py-3 border-b font-semibold">Contratos de compra-venta</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left bg-slate-50"><tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Cliente</th>
              <th class="px-4 py-2">Vigencia</th>
              <th class="px-4 py-2">Descuento</th>
              <th class="px-4 py-2">Estado</th>
            </tr></thead>
            <tbody>
              ${contracts.map(c=>`<tr class="border-t">
                <td class="px-4 py-2">${c.id}</td>
                <td class="px-4 py-2">${c.customer}</td>
                <td class="px-4 py-2">${c.startDate} → ${c.endDate}</td>
                <td class="px-4 py-2">${(c.discount*100).toFixed(0)}%</td>
                <td class="px-4 py-2">${c.status}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border bg-white">
        <div class="px-4 py-3 border-b font-semibold">Órdenes de clientes</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left bg-slate-50"><tr>
              <th class="px-4 py-2">Orden</th>
              <th class="px-4 py-2">Fecha</th>
              <th class="px-4 py-2">Cliente</th>
              <th class="px-4 py-2">Items</th>
              <th class="px-4 py-2">Total</th>
              <th class="px-4 py-2">Estado</th>
            </tr></thead>
            <tbody>
              ${orders.map(o=>`<tr class="border-t">
                <td class="px-4 py-2">${o.id}</td>
                <td class="px-4 py-2">${formatDate(o.createdAt)}</td>
                <td class="px-4 py-2">${o.customer?.name || ''}</td>
                <td class="px-4 py-2">${o.items?.length || 0}</td>
                <td class="px-4 py-2">${formatPrice(o.totals?.total || 0)}</td>
                <td class="px-4 py-2">${o.status}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function restricted() {
  return `<div class="max-w-xl mx-auto px-4 py-16 text-center"><div class="text-7xl">🔒</div><h2 class="text-xl font-bold mt-2">Acceso restringido a Ventas</h2></div>`
}

