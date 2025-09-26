export default function renderNotFound() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="text-7xl">😕</div>
      <h1 class="text-2xl font-bold mt-2">Página no encontrada</h1>
      <a href="#/" class="inline-block mt-4 px-4 py-2 rounded-xl border border-slate-200">Volver al inicio</a>
    </div>
  `;
}

