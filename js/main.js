import { addRoute, startRouter, navigate, currentPath } from './router.js';
import { initStore, seedUser, cartCount, getUser, hasRole } from './store.js';

import renderHome from './views/home.js';
import renderCatalog from './views/catalog.js';
import renderProduct from './views/product.js';
import renderCart from './views/cart.js';
import renderCheckout from './views/checkout.js';
import renderOrders from './views/orders.js';
import renderAccount from './views/account.js';
import renderConfirmation from './views/confirmation.js';
import renderChat from './views/chat.js';
import renderTracking from './views/tracking.js';
import renderNotFound from './views/notfound.js';
import renderPanelHome from './views/panel/home.js';
import renderPanelMarketing from './views/panel/marketing.js';
import renderPanelAlmacen from './views/panel/almacen.js';
import renderPanelVentas from './views/panel/ventas.js';

function updateCartBadge() {
  const count = cartCount();
  const update = (id, hideWhenZero = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = String(count);
    if (hideWhenZero) el.style.display = count ? 'flex' : 'none';
  };
  update('cartBadge');
  update('cartBadgeMobile', true);
}

function setupNav() {
  const year = String(new Date().getFullYear());
  ['year', 'year-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = year;
  });
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  mobileBtn?.addEventListener('click', ()=> mobileNav?.classList.toggle('hidden'));
  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav?.classList.add('hidden'));
  });
  document.getElementById('globalSearch')?.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') navigate(`/catalogo?q=${encodeURIComponent(e.currentTarget.value)}`);
  });
  document.getElementById('globalSearchMobile')?.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') navigate(`/catalogo?q=${encodeURIComponent(e.currentTarget.value)}`);
  });
  document.addEventListener('cart:updated', updateCartBadge);
  updateCartBadge();
  function updateNavUser() {
    const u = getUser();
    const el = document.getElementById('navUserName');
    if (el) el.textContent = u ? u.name : 'Mi cuenta';
  }
  updateNavUser();
  window.addEventListener('hashchange', updateNavUser);
  document.addEventListener('user:changed', updateNavUser);

  function updateNavByRole() {
    const u = getUser();
    const isClient = !u || (u.role||'cliente') === 'cliente';
    document.querySelectorAll('.nav-shop').forEach(el=> el.classList.toggle('hidden', !isClient));
    document.querySelectorAll('.nav-panel').forEach(el=> el.classList.toggle('hidden', isClient));
  }
  updateNavByRole();
  document.addEventListener('user:changed', updateNavByRole);
  window.addEventListener('hashchange', updateNavByRole);

  function highlightNav() {
    const { segments } = currentPath();
    const base = `/${segments[0] || ''}` || '/';
    const map = {
      '/producto': '/catalogo',
      '/checkout': '/carrito',
      '/confirmacion': '/ordenes',
      '/tracking': '/ordenes',
      '/panel-marketing': '/panel',
      '/panel-almacen': '/panel',
      '/panel-ventas': '/panel',
    };
    const target = map[base] || base || '/';
    document.querySelectorAll('.nav-link').forEach(el => {
      const route = el.getAttribute('data-route');
      const isActive = !!route && (route === target || (route !== '/' && target.startsWith(route)));
      el.classList.toggle('is-active', isActive);
    });
    document.querySelectorAll('.mobile-tab__item').forEach(el => {
      const route = el.getAttribute('data-route');
      const isActive = !!route && (route === target || (route !== '/' && target.startsWith(route)));
      el.classList.toggle('is-active', isActive);
    });
  }
  highlightNav();
  window.addEventListener('hashchange', highlightNav);
}

function setupTheme() {
  const btn = document.getElementById('themeToggle');
  btn?.addEventListener('click', ()=>{
    document.documentElement.classList.toggle('dark');
  });
}

async function main() {
  await initStore();
  seedUser();
  setupNav();
  setupTheme();

  // Routes
  addRoute('/', renderHome);
  addRoute('/catalogo', renderCatalog);
  addRoute('/producto', renderProduct);
  addRoute('/carrito', renderCart);
  addRoute('/checkout', renderCheckout);
  addRoute('/ordenes', renderOrders);
  addRoute('/chat', renderChat);
  addRoute('/cuenta', renderAccount);
  addRoute('/confirmacion', renderConfirmation);
  addRoute('/tracking', renderTracking);
  // Panel (empresa)
  addRoute('/panel', () => renderPanelHome({ guard: () => hasRole(['marketing','almacen','ventas']) }));
  addRoute('/panel-marketing', () => renderPanelMarketing({ guard: () => hasRole('marketing') }));
  addRoute('/panel-almacen', () => renderPanelAlmacen({ guard: () => hasRole('almacen') }));
  addRoute('/panel-ventas', () => renderPanelVentas({ guard: () => hasRole('ventas') }));

  startRouter(renderNotFound);
}

main();
