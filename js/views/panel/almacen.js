import { listProducts, listPurchaseOrders, listInbound } from '../../store.js';

export default function renderPanelAlmacen({ guard } = {}) {
  const app = document.getElementById('app');
  if (guard && !guard()) { app.innerHTML = restricted(); return; }
  const products = listProducts();
  const pos = listPurchaseOrders();
  const inbound = listInbound();

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Almacén — Stocks y Órdenes</h1>
      <section class="rounded-2xl border bg-white mb-6">
        <div class="px-4 py-3 border-b font-semibold">Stocks de productos</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left bg-slate-50"><tr>
              <th class="px-4 py-2">Producto</th>
              <th class="px-4 py-2">Categoría</th>
              <th class="px-4 py-2">Stock</th>
              <th class="px-4 py-2">MOQ</th>
            </tr></thead>
            <tbody>
              ${products.map(p=>`<tr class="border-t ${p.stock<=p.moq? 'bg-amber-50' : ''}">
                <td class="px-4 py-2">${p.name}</td>
                <td class="px-4 py-2">${p.category}</td>
                <td class="px-4 py-2">${p.stock}</td>
                <td class="px-4 py-2">${p.moq||1}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border bg-white mb-6">
        <div class="px-4 py-3 border-b font-semibold">Órdenes de compra (a proveedores)</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left bg-slate-50"><tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Proveedor</th>
              <th class="px-4 py-2">ETA</th>
              <th class="px-4 py-2">Estado</th>
              <th class="px-4 py-2">Items</th>
            </tr></thead>
            <tbody>
              ${pos.map(po=>`<tr class="border-t">
                <td class="px-4 py-2">${po.id}</td>
                <td class="px-4 py-2">${po.supplier}</td>
                <td class="px-4 py-2">${new Date(po.eta).toLocaleString('es-PE')}</td>
                <td class="px-4 py-2">${po.status}</td>
                <td class="px-4 py-2">${po.items.map(i=>i.name+" x"+i.qty).join(', ')}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-2xl border bg-white">
        <div class="px-4 py-3 border-b font-semibold">Tracking de arribos</div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left bg-slate-50"><tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">PO</th>
              <th class="px-4 py-2">Carrier</th>
              <th class="px-4 py-2">ETA</th>
              <th class="px-4 py-2">Estado</th>
            </tr></thead>
            <tbody>
              ${inbound.map(inb=>`<tr class="border-t">
                <td class="px-4 py-2">${inb.id}</td>
                <td class="px-4 py-2">${inb.poId}</td>
                <td class="px-4 py-2">${inb.carrier}</td>
                <td class="px-4 py-2">${new Date(inb.eta).toLocaleString('es-PE')}</td>
                <td class="px-4 py-2">${inb.status}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function restricted() {
  return `<div class="max-w-xl mx-auto px-4 py-16 text-center"><div class="text-7xl">🔒</div><h2 class="text-xl font-bold mt-2">Acceso restringido a Almacén</h2></div>`
}

