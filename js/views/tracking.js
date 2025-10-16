import { findOrder } from '../store.js';
import { formatDate, formatPrice } from '../utils/format.js';
import { navigate } from '../router.js';

function buildMapUrl(route) {
  if (!route?.origin || !route?.destination || !route?.points?.length) {
    return '';
  }
  const size = '640x360';
  const zoom = route.zoom ?? 13;
  const start = `${route.origin.lat},${route.origin.lon},ol-marker`;
  const end = `${route.destination.lat},${route.destination.lon},ol-marker-red`;
  const pathPoints = route.points.map(p => `${p.lat},${p.lon}`).join('|');
  const pathParam = encodeURIComponent(`weight:4|color:0xff5c5c|${pathPoints}`);
  return `https://staticmap.openstreetmap.de/staticmap.php?size=${size}&zoom=${zoom}&markers=${start}&markers=${end}&path=${pathParam}`;
}

function trackProgress(steps = [], isCancelled = false) {
  if (isCancelled || !steps.length) return 0;
  const done = steps.filter(step => step.status === 'done').length;
  const currentIndex = steps.findIndex(step => step.status === 'current');
  const partial = currentIndex >= 0 ? 0.5 : 0;
  return Math.min(1, (done + partial) / steps.length);
}

export default function renderTracking({ query }) {
  const app = document.getElementById('app');
  const id = query.id;
  if (!id) {
    app.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div class="mx-auto w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <span class="material-icons-outlined text-3xl">location_off</span>
        </div>
        <h1 class="text-2xl font-bold mt-4">No encontramos el pedido</h1>
        <p class="mt-2 text-slate-600">Selecciona una orden para ver su tracking.</p>
        <button class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700" id="trackingBackBtn">
          <span class="material-icons-outlined text-base">arrow_back</span>
          Ir a mis órdenes
        </button>
      </div>
    `;
    document.getElementById('trackingBackBtn')?.addEventListener('click', () => navigate('/ordenes'));
    return;
  }

  const order = findOrder(id);
  if (!order) {
    app.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div class="mx-auto w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <span class="material-icons-outlined text-3xl">error_outline</span>
        </div>
        <h1 class="text-2xl font-bold mt-4">Pedido no disponible</h1>
        <p class="mt-2 text-slate-600">El identificador <span class="font-semibold">${id}</span> no corresponde a una orden guardada.</p>
        <button class="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700" id="trackingBackBtn">
          <span class="material-icons-outlined text-base">arrow_back</span>
          Ver mis órdenes
        </button>
      </div>
    `;
    document.getElementById('trackingBackBtn')?.addEventListener('click', () => navigate('/ordenes'));
    return;
  }

  const tracking = order.tracking || {};
  const isCancelled = order.status === 'Cancelada';
  const progress = Math.round(trackProgress(tracking.steps, isCancelled) * 100);
  const mapUrl =  './assets/maps.webp';

  app.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-xs uppercase tracking-wide text-slate-400">Tracking de la orden</div>
          <h1 class="text-2xl font-bold text-slate-800 mt-1">${order.id}</h1>
          <p class="text-sm text-slate-500">Actualizado ${tracking.updatedAt ? formatDate(tracking.updatedAt) : ''}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a href="#/ordenes" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-600">
            <span class="material-icons-outlined text-base">arrow_back</span>
            Volver a mis órdenes
          </a>
          <div class="inline-flex items-center gap-2 rounded-full ${isCancelled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'} px-4 py-2 text-sm font-semibold">
            <span class="material-icons-outlined text-base">${isCancelled ? 'cancel' : 'schedule'}</span>
            ${isCancelled ? 'Orden anulada' : `ETA ${tracking.eta ? formatDate(tracking.eta) : '—'}`}
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold ${isCancelled ? 'text-rose-600' : 'text-slate-700'}">${order.status || 'En proceso'}</div>
              <p class="text-xs text-slate-500">${isCancelled ? 'Esta orden fue anulada. No se realizarán más movimientos.' : 'Seguimos el recorrido del repartidor hasta tu negocio.'}</p>
            </div>
            <div class="text-right">
              <div class="text-xs uppercase tracking-wide text-slate-400">Progreso</div>
              <div class="text-xl font-semibold ${isCancelled ? 'text-rose-500' : 'text-brand-600'}">${progress}%</div>
            </div>
          </div>
          <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full ${isCancelled ? 'bg-rose-400' : 'bg-brand-500'} transition-all" style="width:${progress}%"></div>
          </div>
          <div class="grid gap-4">
            ${(tracking.steps || []).map(step => `
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${
                  isCancelled
                    ? 'border-rose-200 bg-rose-50 text-rose-400'
                    : step.status === 'done'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : step.status === 'current'
                        ? 'border-brand-200 bg-brand-50 text-brand-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                }">
                  <span class="material-icons-outlined text-base">
                    ${isCancelled ? 'cancel' : step.status === 'done' ? 'check' : step.status === 'current' ? 'local_shipping' : 'radio_button_unchecked'}
                  </span>
                </span>
                <div>
                  <div class="text-sm font-semibold ${isCancelled ? 'text-rose-600' : 'text-slate-700'}">${step.label}</div>
                  <div class="text-xs text-slate-500">${step.at ? formatDate(step.at) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
          ${isCancelled && tracking.cancelledAt ? `
            <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              <div class="font-semibold">Orden anulada</div>
              <div class="text-xs text-rose-500">Registrado: ${formatDate(tracking.cancelledAt)}</div>
            </div>
          ` : ''}
        </section>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="text-sm font-semibold text-slate-700">Datos de entrega</div>
            <div class="mt-3 space-y-2 text-sm text-slate-600">
              <div>
                <div class="text-xs uppercase tracking-wide text-slate-400">Cliente</div>
                <div class="font-semibold text-slate-700">${order.customer?.name || '—'}</div>
                ${order.customer?.phone ? `<div class="text-xs text-slate-500">Tel: ${order.customer.phone}</div>` : ''}
                ${order.customer?.address ? `<div class="text-xs text-slate-500">${order.customer.address}</div>` : ''}
              </div>
              <div>
                <div class="text-xs uppercase tracking-wide text-slate-400">Repartidor</div>
                <div class="font-semibold text-slate-700">${tracking.driver?.name || 'Asignando...'}</div>
                ${tracking.driver?.phone ? `<div class="text-xs text-slate-500">Cel: ${tracking.driver.phone}</div>` : ''}
                ${tracking.driver?.vehicle ? `<div class="text-xs text-slate-500">${tracking.driver.vehicle}</div>` : ''}
              </div>
              <div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                <div class="font-semibold text-slate-600">Resumen de pago</div>
                <div class="mt-1 flex justify-between">
                  <span>Productos</span>
                  <span>${formatPrice(order.totals?.subtotal ?? 0)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Envío</span>
                  <span>${order.totals?.shipping === 0 ? 'Gratis' : formatPrice(order.totals?.shipping ?? 0)}</span>
                </div>
                <div class="mt-1 flex justify-between font-semibold text-slate-700">
                  <span>Total</span>
                  <span>${formatPrice(order.totals?.total ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-semibold text-slate-700">Ruta de entrega</div>
                <p class="text-xs text-slate-500">${tracking.route?.distance || '—'} • ${tracking.route?.duration || '—'}</p>
              </div>
              <span class="material-icons-outlined text-brand-500">map</span>
            </div>
            <div class="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
            
              <div class="w-full aspect-video">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d31215.922940359153!2d-76.9619458829512!3d-12.044183473207813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x9105c3f8453ef397%3A0x7de99a26fdaf8bc!2sIndustrial%20120%2C%20Lima%2015491!3m2!1d-12.0261747!2d-76.9161498!4m5!1s0x9105c65f9a150d29%3A0xd02a185ac5fe93fd!2sAv%20Los%20Frutales%20419%2C%20Ate!3m2!1d-12.062209099999999!2d-76.9653075!5e0!3m2!1ses!2spe!4v1760578322247!5m2!1ses!2spe"
                        class="w-full h-full rounded-lg"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>


          </div>
            <div class="mt-3 text-xs text-slate-500">
              <div><span class="font-semibold text-slate-600">Salida:</span> ${tracking.route?.origin?.address || 'Centro logístico'}</div>
              <div><span class="font-semibold text-slate-600">Destino:</span> ${tracking.route?.destination?.address || order.customer?.address || 'Tu negocio'}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `;
}
