import { formatPrice } from '../utils/format.js';
import { addToCart, priceFor, toggleFavorite } from '../store.js';
import { showToast } from './toast.js';

export function productCard(p) {
  const minPrice = priceFor(p, p.moq || 1);
  const imageSrc = p.image && p.image.trim() ? p.image : null;
  const favBaseClass = 'favorite-btn w-11 h-11 flex items-center justify-center rounded-xl border transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-200';
  const favStateClass = p.isFavorite
    ? 'border-red-200 bg-red-50 text-red-500'
    : 'border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200';
  const heartFill = p.isFavorite ? '#ef4444' : 'none';
  const heartStroke = p.isFavorite ? '#ef4444' : '#94a3b8';
  const heartIcon = `
        <svg class="heart-icon w-5 h-5" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
        </svg>`;
  return `
  <div class="group rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-soft transition overflow-hidden">
    <a href="#/producto/${p.id}" class="block">
      <div class="aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center">
        ${
          imageSrc
            ? `<img src="${imageSrc}" alt="${p.name}" class="h-full w-full object-cover" loading="lazy" />`
            : `<div class="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center text-slate-400">
                <span class="material-icons-outlined text-4xl">inventory_2</span>
                <span class="text-xs font-medium uppercase tracking-wide">Sin imagen</span>
              </div>`
        }
      </div>
      <div class="p-4">
        <div class="text-[11px] font-semibold uppercase tracking-wide text-brand-600">${p.category}</div>
        <div class="mt-1 font-semibold line-clamp-2">${p.name}</div>
        <div class="mt-1 text-lg font-bold">${formatPrice(minPrice)}</div>
        <div class="text-xs text-slate-500 mt-1">${p.brand} • ${p.unit}</div>
        <div class="mt-2 flex items-end gap-2">
          <div class="text-xs text-slate-500">MOQ ${p.moq || 1} • Stock ${p.stock}</div>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(p.tags||[]).slice(0,2).map(t=>`<span class=\"text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600\">${t}</span>`).join('')}
        </div>
      </div>
    </a>
    <div class="px-4 pb-4">
      <div class="mt-1 flex items-center gap-2">
        <button data-id="${p.id}" class="flex-1 add-btn px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700" type="button">Agregar</button>
        <button data-id="${p.id}" data-favorite="${p.isFavorite ? 'true' : 'false'}" aria-pressed="${p.isFavorite ? 'true' : 'false'}" class="${favBaseClass} ${favStateClass}" type="button">
          ${heartIcon}
        </button>
      </div>
    </div>
  </div>`;
}

export function bindProductCardEvents(root) {
  root.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id, 1);
      showToast('Producto agregado al carrito');
      document.dispatchEvent(new CustomEvent('cart:updated'));
    });
  });
  const favBaseClass = 'favorite-btn w-11 h-11 flex items-center justify-center rounded-xl border transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-200';
  function updateFavoriteButton(btn, isFavorite) {
    const stateClass = isFavorite
      ? 'border-red-200 bg-red-50 text-red-500'
      : 'border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200';
    btn.className = `${favBaseClass} ${stateClass}`;
    btn.dataset.favorite = isFavorite ? 'true' : 'false';
    btn.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
    const icon = btn.querySelector('.heart-icon');
    if (icon) {
      icon.setAttribute('fill', isFavorite ? '#ef4444' : 'none');
      icon.setAttribute('stroke', isFavorite ? '#ef4444' : '#94a3b8');
    }
  }
  root.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(e.currentTarget.dataset.id);
      const isFavorite = toggleFavorite(id);
      updateFavoriteButton(e.currentTarget, isFavorite);
    });
  });
}
