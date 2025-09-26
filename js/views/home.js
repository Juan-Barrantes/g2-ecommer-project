import { navigate } from '../router.js';

export default function renderHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-4">
            <span class="material-icons-outlined text-sm">local_mall</span> Compra directa de Braedt
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Embutidos Braedt, ahora directos a tu negocio</h1>
          <p class="mt-4 text-slate-600 text-lg">Compra jamones, salchichas, chorizos y más con precios mayoristas, escalas por volumen y entrega refrigerada.</p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#/catalogo" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center">Ver catálogo</a>
            <button id="ctaLearn" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold">Conocer beneficios</button>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-600">
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">sell</span>Precios mayoristas</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">ac_unit</span>Entrega refrigerada</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">verified</span>Calidad Braedt</div>
          </div>
        </div>
        <div class="relative">
          <img class="rounded-3xl shadow-soft" src="https://images.unsplash.com/photo-1558030006-450675546004?q=80&w=1400&auto=format&fit=crop" alt="Embutidos y fiambres"/>
          <div class="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-soft px-4 py-3 border border-slate-200 hidden sm:flex items-center gap-3">
            <span class="material-icons-outlined text-brand-600">local_shipping</span>
            <div>
              <div class="text-sm font-semibold">Entrega refrigerada</div>
              <div class="text-xs text-slate-500">Rutas Lima y Callao</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h2 class="text-xl font-bold mb-4">Empieza por categorías</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      ${['Jamones','Salchichas','Chorizos','Fiambres','Pavo','Packs'].map(c=>`
        <a href="#/catalogo?cat=${encodeURIComponent(c)}" class="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center hover:border-brand-300 hover:shadow-soft transition">
          <div class="material-icons-outlined text-brand-600">category</div>
          <div class="mt-2 text-sm font-medium">${c}</div>
        </a>`).join('')}
    </div>
  </section>`;

  document.getElementById('ctaLearn')?.addEventListener('click', ()=> navigate('/catalogo'));
}
