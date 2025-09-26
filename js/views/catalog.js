import { listProducts, addToCart, priceFor } from '../store.js';
import { formatPrice } from '../utils/format.js';
import { productCard, bindProductCardEvents } from '../components/productCard.js';

export default function renderCatalog({ query }) {
  const app = document.getElementById('app');
  const products = listProducts();
  const categories = [...new Set(products.map(p => p.category))];

  const initialSearch = query.q || '';
  const initialCat = query.cat || 'Todos';
  const initialSort = query.sort || 'relevancia';

  app.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold">Catálogo mayorista</h1>
          <div class="text-sm text-slate-500">${products.length} productos disponibles</div>
        </div>
        <div class="flex items-center gap-3">
          <select id="sortSelect" class="px-3 py-2 rounded-xl border border-slate-200 bg-white">
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Filters -->
        <aside class="md:col-span-1 space-y-4">
          <div class="p-4 rounded-2xl border bg-white border-slate-200">
            <div class="text-sm font-semibold mb-3">Búsqueda</div>
            <div class="relative">
              <span class="material-icons-outlined absolute left-3 top-2.5 text-slate-400">search</span>
              <input id="searchInput" type="search" placeholder="Buscar..." value="${initialSearch}"
                class="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white" />
            </div>
          </div>
          <div class="p-4 rounded-2xl border bg-white border-slate-200">
            <div class="text-sm font-semibold mb-3">Categoría</div>
            <div class="grid grid-cols-2 gap-2" id="catGroup">
              <button data-cat="Todos" class="cat-btn px-3 py-2 rounded-xl border ${initialCat==='Todos'?'border-brand-500 text-brand-700 bg-brand-50':'border-slate-200 bg-white'}">Todos</button>
              ${categories.map(c=>`
                <button data-cat="${c}" class="cat-btn px-3 py-2 rounded-xl border ${initialCat===c?'border-brand-500 text-brand-700 bg-brand-50':'border-slate-200 bg-white'}">${c}</button>
              `).join('')}
            </div>
          </div>
          <div class="p-4 rounded-2xl border bg-white border-slate-200">
            <div class="text-sm font-semibold mb-3">Rango de precio</div>
            <input id="priceMin" type="number" placeholder="Min" class="w-full mb-2 px-3 py-2 rounded-xl border border-slate-200"/>
            <input id="priceMax" type="number" placeholder="Max" class="w-full px-3 py-2 rounded-xl border border-slate-200"/>
            <button id="applyPrice" class="mt-2 w-full px-3 py-2 rounded-xl bg-slate-900 text-white">Aplicar</button>
          </div>
        </aside>

        <!-- Listing -->
        <section class="md:col-span-3">
          <div id="results" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"></div>
        </section>
      </div>
    </div>
  `;

  const searchEl = document.getElementById('searchInput');
  const sortEl = document.getElementById('sortSelect');
  sortEl.value = initialSort;
  let activeCat = initialCat;
  let priceFilter = { min: null, max: null };

  function applyFilters() {
    const term = (searchEl.value || '').toLowerCase();
    const sort = sortEl.value;
    let filtered = products.filter(p => {
      const matchTerm = [p.name, p.brand, p.category].join(' ').toLowerCase().includes(term);
      const matchCat = activeCat === 'Todos' || p.category === activeCat;
      const unitPrice = priceFor(p, p.moq||1);
      const matchPrice = (priceFilter.min==null || unitPrice >= priceFilter.min) && (priceFilter.max==null || unitPrice <= priceFilter.max);
      return matchTerm && matchCat && matchPrice;
    });
    if (sort === 'precio_asc') filtered.sort((a,b)=>priceFor(a, a.moq||1)-priceFor(b, b.moq||1));
    if (sort === 'precio_desc') filtered.sort((a,b)=>priceFor(b, b.moq||1)-priceFor(a, a.moq||1));
    renderResults(filtered);
  }

  function renderResults(items) {
    const root = document.getElementById('results');
    if (!items.length) {
      root.innerHTML = `<div class="col-span-full text-center text-slate-500">No se encontraron productos</div>`;
      return;
    }
    root.innerHTML = items.map(productCard).join('');
    bindProductCardEvents(root);
  }

  document.getElementById('catGroup').querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCat = e.currentTarget.dataset.cat;
      document.getElementById('catGroup').querySelectorAll('.cat-btn').forEach(b=>b.className='cat-btn px-3 py-2 rounded-xl border border-slate-200 bg-white');
      e.currentTarget.className = 'cat-btn px-3 py-2 rounded-xl border border-brand-500 text-brand-700 bg-brand-50';
      applyFilters();
    });
  });
  searchEl.addEventListener('input', applyFilters);
  sortEl.addEventListener('change', applyFilters);
  document.getElementById('applyPrice').addEventListener('click', () => {
    const min = Number(document.getElementById('priceMin').value || NaN);
    const max = Number(document.getElementById('priceMax').value || NaN);
    priceFilter = { min: isNaN(min)?null:min, max: isNaN(max)?null:max };
    applyFilters();
  });

  applyFilters();
}
