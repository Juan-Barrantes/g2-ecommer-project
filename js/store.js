const STORAGE_KEYS = {
  user: 'mp_user',
  cart: 'mp_cart',
  orders: 'mp_orders',
  productFavorites: 'mp_product_favorites',
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
  orders: [],
  purchaseOrders: [],
  inbound: [],
  contracts: [],
  chat: load(STORAGE_KEYS.chat, []),
  productFavorites: new Set(load(STORAGE_KEYS.productFavorites, []).map(String)),
};

function syncProductFavorites() {
  save(STORAGE_KEYS.productFavorites, Array.from(state.productFavorites));
}

function normalizeProducts(list) {
  const favorites = state.productFavorites;
  return (list || []).map(p => {
    const key = String(p.id);
    const isFavorite = favorites.has(key) || Boolean(p.isFavorite);
    if (isFavorite && !favorites.has(key)) favorites.add(key);
    return {
      ...p,
      isFavorite,
    };
  });
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function randomOffset(range) {
  return (Math.random() - 0.5) * range;
}

function buildTracking(order) {
  const now = new Date();
  const origin = {
    name: 'Centro de distribución',
    address: 'Av. Industrial 120, Lima',
    lat: -12.0453,
    lon: -77.0311,
  };
  const destination = {
    name: order?.customer?.name || 'Cliente',
    address: order?.customer?.address || 'Dirección de entrega',
    lat: Number((origin.lat + randomOffset(0.08)).toFixed(6)),
    lon: Number((origin.lon + randomOffset(0.08)).toFixed(6)),
  };
  const midpoints = [
    { lat: Number((origin.lat + (destination.lat - origin.lat) * 0.35 + randomOffset(0.01)).toFixed(6)), lon: Number((origin.lon + (destination.lon - origin.lon) * 0.35 + randomOffset(0.01)).toFixed(6)) },
    { lat: Number((origin.lat + (destination.lat - origin.lat) * 0.7 + randomOffset(0.008)).toFixed(6)), lon: Number((origin.lon + (destination.lon - origin.lon) * 0.7 + randomOffset(0.008)).toFixed(6)) },
  ];
  const points = [origin, ...midpoints, destination].map(p => ({ lat: p.lat, lon: p.lon }));
  const steps = [
    { id: 'confirmed', label: 'Orden confirmada', at: now.toISOString(), status: 'done' },
    { id: 'preparing', label: 'Pedido en preparación', at: addMinutes(now, 30).toISOString(), status: 'current' },
    { id: 'onroute', label: 'En camino', at: addMinutes(now, 90).toISOString(), status: 'upcoming' },
    { id: 'delivered', label: 'Entrega realizada', at: addMinutes(now, 160).toISOString(), status: 'upcoming' },
  ];
  return {
    updatedAt: now.toISOString(),
    eta: addMinutes(now, 160).toISOString(),
    progress: 0.45,
    driver: {
      name: 'Luis Fernández',
      phone: '987 654 321',
      vehicle: 'Moto - ABX-234',
    },
    route: {
      origin,
      destination,
      distance: '12.4 km',
      duration: '45 min aprox.',
      points,
      zoom: 13,
    },
    steps,
  };
}

function normalizeOrder(order) {
  if (!order) return order;
  const normalized = {
    items: [],
    totals: { subtotal: 0, shipping: 0, total: 0 },
    ...order,
  };
  normalized.totals = {
    subtotal: Number(normalized.totals?.subtotal ?? 0),
    shipping: Number(normalized.totals?.shipping ?? 0),
    total: Number(normalized.totals?.total ?? 0),
  };
  if (!normalized.tracking) {
    normalized.tracking = buildTracking(normalized);
  }
  if (normalized.status !== 'Cancelada') {
    const currentStep = normalized.tracking.steps?.find(step => step.status === 'current') || normalized.tracking.steps?.find(step => step.status === 'done');
    if (currentStep) normalized.status = currentStep.label;
  } else if (normalized.tracking) {
    normalized.tracking.steps = (normalized.tracking.steps || []).map(step => ({
      ...step,
      status: 'upcoming',
    }));
    normalized.tracking.progress = 0;
  }
  return normalized;
}

function normalizeOrders(list) {
  return (list || []).map(o => normalizeOrder(o));
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
    seed(STORAGE_KEYS.users, './data/users.json', []),
    seed(STORAGE_KEYS.cart, './data/cart.json', []),
    seed(STORAGE_KEYS.orders, './data/orders.json', []),
    seed(STORAGE_KEYS.purchaseOrders, './data/purchase_orders.json', []),
    seed(STORAGE_KEYS.inbound, './data/inbound.json', []),
    seed(STORAGE_KEYS.contracts, './data/contracts.json', []),
    seed(STORAGE_KEYS.chat, './data/chat.json', []),
  ]);

  async function loadProductsFromSource() {
    try {
      const res = await fetch('./data/products.json');
      const data = await res.json();
      state.products = normalizeProducts(data);
    } catch (e) {
      state.products = normalizeProducts([]);
    }
    syncProductFavorites();
  }

  await loadProductsFromSource();

  state.users = load(STORAGE_KEYS.users, []);
  state.cart = load(STORAGE_KEYS.cart, []);
  state.orders = normalizeOrders(load(STORAGE_KEYS.orders, []));
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
  state.orders = normalizeOrders(await rehydrateIfEmpty(state.orders, STORAGE_KEYS.orders, './data/orders.json'));
  save(STORAGE_KEYS.orders, state.orders);
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
  const key = String(product.id);
  if (state.productFavorites.has(key)) {
    state.productFavorites.delete(key);
    product.isFavorite = false;
  } else {
    state.productFavorites.add(key);
    product.isFavorite = true;
  }
  syncProductFavorites();
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
  order.tracking = buildTracking(order);
  const currentStep = order.tracking.steps?.find(step => step.status === 'current') || order.tracking.steps?.[0];
  if (currentStep) order.status = currentStep.label;
  state.orders.unshift(order);
  save(STORAGE_KEYS.orders, state.orders);
  clearCart();
  return order;
}

export const listOrders = () => state.orders;
export const findOrder = (id) => state.orders.find(o => String(o.id) === String(id));

export function cancelOrder(orderId) {
  const order = state.orders.find(o => String(o.id) === String(orderId));
  if (!order || order.status === 'Cancelada') return false;
  order.status = 'Cancelada';
  const cancelledAt = new Date().toISOString();
  if (order.tracking) {
    order.tracking.steps = (order.tracking.steps || []).map(step => ({
      ...step,
      status: 'upcoming',
    }));
    order.tracking.progress = 0;
    order.tracking.cancelledAt = cancelledAt;
    order.tracking.updatedAt = cancelledAt;
    order.tracking.eta = null;
  } else {
    order.tracking = {
      cancelledAt,
      updatedAt: cancelledAt,
      steps: [],
      route: null,
      progress: 0,
    };
  }
  save(STORAGE_KEYS.orders, state.orders);
  document.dispatchEvent(new CustomEvent('orders:updated', { detail: { id: orderId, status: 'Cancelada' } }));
  return true;
}
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
