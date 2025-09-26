import { listOrders } from '../../store.js';
import { formatPrice } from '../../utils/format.js';

export default function renderPanelMarketing({ guard } = {}) {
  const app = document.getElementById('app');
  if (guard && !guard()) { app.innerHTML = restricted(); return; }

  const orders = listOrders();
  const metrics = computeMetrics(orders);
  const top = metrics.top.slice(0, 5);

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Marketing — Reportes</h1>
      <div class="grid md:grid-cols-4 gap-4 mb-6">
        ${card('Ventas totales', formatPrice(metrics.revenue))}
        ${card('Órdenes', metrics.orders)}
        ${card('Ticket promedio', formatPrice(metrics.aov))}
        ${card('Clientes únicos', metrics.customers)}
      </div>
      <div class="rounded-2xl border bg-white">
        <div class="px-4 py-3 border-b flex items-center justify-between">
          <div class="font-semibold">Reportes</div>
          <select id="reportType" class="px-3 py-2 rounded-xl border border-slate-200">
            <option value="top">Top productos por unidades</option>
            <option value="cat">Ingresos por categoría</option>
            <option value="time">Órdenes por día</option>
          </select>
        </div>
        <div id="reportRoot" class="p-4 overflow-x-auto"></div>
      </div>
    </div>
  `;

  const root = document.getElementById('reportRoot');
  const select = document.getElementById('reportType');
  function render(type) {
    if (type === 'top') {
      const rows = metrics.top.map(r=>`<tr class=\"border-t\"><td class=\"px-4 py-2\">${r.name}</td><td class=\"px-4 py-2\">${r.qty}</td><td class=\"px-4 py-2\">${formatPrice(r.revenue)}</td></tr>`).join('');
      root.innerHTML = `<table class=\"min-w-full text-sm\"><thead class=\"text-left bg-slate-50\"><tr><th class=\"px-4 py-2\">Producto</th><th class=\"px-4 py-2\">Unidades</th><th class=\"px-4 py-2\">Ingresos</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else if (type === 'cat') {
      const cats = Object.entries(metrics.revenueByCategory).sort((a,b)=>b[1]-a[1]);
      const rows = cats.map(([cat,val])=>`<tr class=\"border-t\"><td class=\"px-4 py-2\">${cat}</td><td class=\"px-4 py-2\">${formatPrice(val)}</td><td class=\"px-4 py-2\"><div class=\"h-2 bg-slate-100 rounded\"><div class=\"h-2 bg-brand-500 rounded\" style=\"width:${Math.min(100,(val/ (cats[0]?.[1]||1))*100)}%\"></div></div></td></tr>`).join('');
      root.innerHTML = `<table class=\"min-w-full text-sm\"><thead class=\"text-left bg-slate-50\"><tr><th class=\"px-4 py-2\">Categoría</th><th class=\"px-4 py-2\">Ingresos</th><th class=\"px-4 py-2\">\u00A0</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else if (type === 'time') {
      const days = Object.entries(metrics.ordersByDay).sort((a,b)=>a[0].localeCompare(b[0]));
      const rows = days.map(([day,count])=>`<tr class=\"border-t\"><td class=\"px-4 py-2\">${day}</td><td class=\"px-4 py-2\">${count}</td></tr>`).join('');
      root.innerHTML = `<table class=\"min-w-full text-sm\"><thead class=\"text-left bg-slate-50\"><tr><th class=\"px-4 py-2\">Fecha</th><th class=\"px-4 py-2\">Órdenes</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
  }
  render('top');
  select.addEventListener('change', e=> render(e.target.value));
}

function card(title, value) {
  return `<div class="rounded-2xl border bg-white p-4"><div class="text-sm text-slate-500">${title}</div><div class="text-xl font-bold">${value}</div></div>`
}

function computeMetrics(orders) {
  let revenue = 0; const productMap = new Map(); const customers = new Set();
  const revenueByCategory = {};
  const ordersByDay = {};
  for (const o of orders) {
    revenue += o.totals?.total || 0;
    customers.add(o.customer?.name || '');
    const day = (o.createdAt||'').slice(0,10);
    ordersByDay[day] = (ordersByDay[day]||0) + 1;
    for (const it of (o.items||[])) {
      const cur = productMap.get(it.id) || { id: it.id, name: it.name, qty: 0, revenue: 0, category: it.category };
      cur.qty += it.qty; cur.revenue += (it.price||0) * it.qty; productMap.set(it.id, cur);
      const cat = it.category || 'Otros';
      revenueByCategory[cat] = (revenueByCategory[cat]||0) + (it.price||0)*it.qty;
    }
  }
  const arr = [...productMap.values()].sort((a,b)=>b.qty-a.qty);
  const ordersCount = orders.length;
  const aov = ordersCount ? (revenue / ordersCount) : 0;
  return { revenue, orders: ordersCount, aov, customers: customers.size, top: arr, revenueByCategory, ordersByDay };
}

function restricted() {
  return `<div class="max-w-xl mx-auto px-4 py-16 text-center"><div class="text-7xl">🔒</div><h2 class="text-xl font-bold mt-2">Acceso restringido a Marketing</h2></div>`
}
