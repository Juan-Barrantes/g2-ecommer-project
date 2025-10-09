const STORAGE_KEYS = {
  user: 'mp_user',
  cart: 'mp_cart',
  orders: 'mp_orders',
  products: 'mp_products',
  users: 'mp_users',
  purchaseOrders: 'mp_pos',
  inbound: 'mp_inbound',
  contracts: 'mp_contracts',
  chat: 'mp_chat',
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const state = {
  products: [],
  users: [],
  user: load(STORAGE_KEYS.user, null),
  cart: load(STORAGE_KEYS.cart, []), // {id, qty}
  orders: load(STORAGE_KEYS.orders, []),
  purchaseOrders: [],
  inbound: [],
  contracts: [],
  chat: load(STORAGE_KEYS.chat, []),
};

function normalizeProducts(list) {
  return (list || []).map(p => ({
    ...p,
    isFavorite: Boolean(p.isFavorite),
  }));
}

export async function initStore() {
  // Seed from JSON files if not present in localStorage
  async function seed(key, path, fallback) {
    if (localStorage.getItem(key) == null) {
      try {
        const res = await fetch(path);
        const data = await res.json();
        save(key, data);
      } catch (e) {
        save(key, fallback);
      }
    }
  }

  await Promise.all([
    seed(STORAGE_KEYS.products, './data/products.json', []),
    seed(STORAGE_KEYS.users, './data/users.json', []),
    seed(STORAGE_KEYS.cart, './data/cart.json', []),
    seed(STORAGE_KEYS.orders, './data/orders.json', []),
    seed(STORAGE_KEYS.purchaseOrders, './data/purchase_orders.json', []),
    seed(STORAGE_KEYS.inbound, './data/inbound.json', []),
    seed(STORAGE_KEYS.contracts, './data/contracts.json', []),
    seed(STORAGE_KEYS.chat, './data/chat.json', []),
  ]);

  state.products = normalizeProducts(load(STORAGE_KEYS.products, []));
  state.users = load(STORAGE_KEYS.users, []);
  state.cart = load(STORAGE_KEYS.cart, []);
  state.orders = load(STORAGE_KEYS.orders, []);
  state.purchaseOrders = load(STORAGE_KEYS.purchaseOrders, []);
  state.inbound = load(STORAGE_KEYS.inbound, []);
  state.contracts = load(STORAGE_KEYS.contracts, []);
  state.chat = load(STORAGE_KEYS.chat, []);

  // Self-heal: if arrays are empty, rehydrate from JSON files
  async function rehydrateIfEmpty(arr, key, path) {
    if (!Array.isArray(arr) || arr.length === 0) {
      try {
        const res = await fetch(path);
        const data = await res.json();
        save(key, data);
        return data;
      } catch {}
    }
    return arr;
  }
  state.products = normalizeProducts(await rehydrateIfEmpty(state.products, STORAGE_KEYS.products, './data/products.json'));
  save(STORAGE_KEYS.products, state.products);
  state.users = await rehydrateIfEmpty(state.users, STORAGE_KEYS.users, './data/users.json');
  state.chat = await rehydrateIfEmpty(state.chat, STORAGE_KEYS.chat, './data/chat.json');
}

export const getUser = () => state.user;
export const setUser = (user) => { state.user = user; save(STORAGE_KEYS.user, user); };
export const signOut = () => { state.user = null; save(STORAGE_KEYS.user, null); };

export const listProducts = () => state.products;
export const findProduct = (id) => state.products.find(p => String(p.id) === String(id));
export const listUsers = () => state.users;
export const currentUser = () => state.user;
export const hasRole = (roles) => {
  const u = state.user; if (!u) return false;
  const set = Array.isArray(roles)? roles : [roles];
  return set.includes(u.role || 'cliente');
};

export const getCart = () => state.cart;
export const clearCart = () => { state.cart = []; save(STORAGE_KEYS.cart, state.cart); };

export function addToCart(productId, qty = 1) {
  const p = findProduct(productId);
  if (!p) return;
  const existing = state.cart.find(i => i.id === p.id);
  if (existing) existing.qty += qty; else state.cart.push({ id: p.id, qty });
  if (existing && existing.qty < 0) existing.qty = 0;
  save(STORAGE_KEYS.cart, state.cart);
}

export function updateQty(productId, qty) {
  const i = state.cart.find(i => i.id === productId);
  if (!i) return;
  i.qty = Math.max(0, qty|0);
  if (i.qty === 0) removeFromCart(productId);
  save(STORAGE_KEYS.cart, state.cart);
}

export function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  save(STORAGE_KEYS.cart, state.cart);
}

export function toggleFavorite(productId) {
  const product = state.products.find(p => String(p.id) === String(productId));
  if (!product) return false;
  product.isFavorite = !product.isFavorite;
  save(STORAGE_KEYS.products, state.products);
  document.dispatchEvent(new CustomEvent('product:favorited', {
    detail: { id: productId, isFavorite: product.isFavorite },
  }));
  return product.isFavorite;
}

export function priceFor(product, qty) {
  // Applies best tier price by minimum quantity
  const tiers = product.tiers?.slice().sort((a,b)=>b.minQty-a.minQty) || [];
  const tier = tiers.find(t => qty >= t.minQty);
  return (tier?.price ?? product.price);
}

export function cartSummary() {
  let items = 0, subtotal = 0;
  const detailed = state.cart.map(i => {
    const p = findProduct(i.id);
    const unitPrice = priceFor(p, i.qty);
    const line = unitPrice * i.qty;
    items += i.qty; subtotal += line;
    return { ...i, product: p, unitPrice, line };
  });
  return { items, subtotal, detailed };
}

export function createOrder(payload) {
  const { detailed, subtotal } = cartSummary();
  const id = 'ORD-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const order = {
    id,
    createdAt: new Date().toISOString(),
    status: 'Recibida',
    items: detailed.map(d => ({ id: d.id, name: d.product.name, qty: d.qty, unit: d.product.unit, price: d.unitPrice })),
    totals: { subtotal, shipping: payload.shipping ?? 0, total: subtotal + (payload.shipping ?? 0) },
    customer: payload.customer,
    notes: payload.notes || '',
    payment: payload.payment,
  };
  state.orders.unshift(order);
  save(STORAGE_KEYS.orders, state.orders);
  clearCart();
  return order;
}

export const listOrders = () => state.orders;
export const listPurchaseOrders = () => state.purchaseOrders;
export const listInbound = () => state.inbound;
export const listContracts = () => state.contracts;
export const listChatMessages = () => state.chat;

export function appendChatMessage({ from, text, meta = {} }) {
  const message = {
    id: 'msg-' + Math.random().toString(36).slice(2, 9),
    from,
    text,
    createdAt: new Date().toISOString(),
    ...meta,
  };
  state.chat.push(message);
  save(STORAGE_KEYS.chat, state.chat);
  document.dispatchEvent(new CustomEvent('chat:updated', { detail: message }));
  return message;
}

export function seedUser() { /* ya no iniciamos sesión automáticamente */ }

export function cartCount() { return state.cart.reduce((s,i)=>s+i.qty,0); }

export function shippingFor(subtotal) {
  // Free shipping over S/600, else S/19.90
  return subtotal >= 600 ? 0 : 19.9;
}

export function signIn(email, password) {
  const u = state.users.find(u => u.email?.toLowerCase() === String(email).toLowerCase() && u.password === password);
  if (!u) return null;
  setUser(u);
  return u;
}

export function createAccount({ name, email, password, phone = '', address = '' }) {
  const exists = state.users.some(u => u.email?.toLowerCase() === String(email).toLowerCase());
  if (exists) throw new Error('El correo ya está registrado');
  const id = 'U' + (Math.random().toString(36).slice(2,7).toUpperCase());
  const user = { id, name, email, password, phone, address, role: 'cliente' };
  state.users.push(user);
  save(STORAGE_KEYS.users, state.users);
  setUser(user);
  return user;
}
