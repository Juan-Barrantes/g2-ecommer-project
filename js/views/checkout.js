import { cartSummary, createOrder, getUser, shippingFor, getFulfillmentOptions, setFulfillmentOptions, listPickupStores } from '../store.js';
import { formatPrice } from '../utils/format.js';
import { navigate } from '../router.js';

export default function renderCheckout() {
  const app = document.getElementById('app');
  const user = getUser();
  const { subtotal } = cartSummary();
  const fulfillment = getFulfillmentOptions();
  const stores = listPickupStores();
  const hasPickup = fulfillment.method === 'pickup';
  let currentMethod = hasPickup ? 'pickup' : 'delivery';
  let currentShipping = subtotal && !hasPickup ? shippingFor(subtotal) : 0;
  const initialTotal = subtotal + currentShipping;
  const shippingLabel = currentShipping === 0 ? 'Gratis' : formatPrice(currentShipping);
  const renderPickupInfo = (store) => {
    if (!store) {
      return '<p class="text-sm text-slate-600">Selecciona la tienda donde recogerás tu pedido.</p>';
    }
    return `
      <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
        <div class="font-semibold">${store.name}</div>
        <div class="text-xs text-slate-500">${store.address}</div>
        ${store.hours ? `<div class="text-xs text-slate-500">Horario: ${store.hours}</div>` : ''}
        ${store.phone ? `<div class="text-xs text-slate-500">Tel: ${store.phone}</div>` : ''}
      </div>
    `;
  };
  const renderStoreOption = (store, selectedId) => `
      <label class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 transition">
        <input type="radio" name="storeOption" value="${store.id}" ${selectedId === store.id ? 'checked' : ''} class="mt-1" />
        <div class="text-sm text-slate-700">
          <div class="font-semibold text-slate-800">${store.name}</div>
          <div class="text-xs text-slate-500">${store.address}${store.district ? ` • ${store.district}` : ''}</div>
          ${store.hours ? `<div class="text-xs text-slate-500">Horario: ${store.hours}</div>` : ''}
          ${store.phone ? `<div class="text-xs text-slate-500">Tel: ${store.phone}</div>` : ''}
        </div>
      </label>
    `;
  const pickupStore = fulfillment.pickupStore || null;
  const pickupInfo = renderPickupInfo(pickupStore);
  const storeOptions = stores.length ? stores.map(store => renderStoreOption(store, pickupStore?.id)).join('') : '<p class="text-sm text-slate-500">Por ahora no tenemos tiendas disponibles para recojo.</p>';

  app.innerHTML = `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-6">Pago</h1>
      <form id="payForm" class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="text-sm font-semibold mb-4">Datos de contacto</div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-slate-500">Nombre del negocio</label>
              <input id="name" required value="${user?.name || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-200"/>
            </div>
            <div>
              <label class="text-xs text-slate-500">Teléfono</label>
              <input id="phone" required value="${user?.phone || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-200"/>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs text-slate-500">Dirección de entrega</label>
              <input id="address" required value="${user?.address || ''}" placeholder="Calle 123, Distrito" class="w-full px-3 py-2 rounded-xl border border-slate-200"/>
            </div>
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div class="text-sm font-semibold">Entrega</div>
          <label class="flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-300 transition">
            <input type="radio" name="fulfillment" value="delivery" class="mt-1" ${currentMethod === 'delivery' ? 'checked' : ''}/>
            <div>
              <div class="font-medium text-slate-800">Delivery refrigerado</div>
              <p class="text-xs text-slate-500">Coordinaremos la entrega en tu dirección. El envío se cobra sólo para delivery.</p>
            </div>
          </label>
          <div id="deliveryDetails" class="${currentMethod === 'delivery' ? '' : 'hidden'} rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-3">
            <label for="deliveryDateCheckout" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha ideal</label>
            <input id="deliveryDateCheckout" type="date" value="${fulfillment.deliveryDate || ''}" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"/>
            <p class="mt-2 text-xs text-slate-500">Puedes actualizar la fecha desde el carrito o aquí. Nuestro equipo confirmará la disponibilidad.</p>
          </div>
          <label class="flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-300 transition">
            <input type="radio" name="fulfillment" value="pickup" class="mt-1" ${currentMethod === 'pickup' ? 'checked' : ''}/>
            <div>
              <div class="font-medium text-slate-800">Recojo en tienda</div>
              <p class="text-xs text-slate-500">Retira tu pedido sin costo adicional desde la tienda Braedt que prefieras.</p>
            </div>
          </label>
          <div id="pickupSummary" class="${currentMethod === 'pickup' ? '' : 'hidden'} space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
            <div id="pickupInfo">${pickupInfo}</div>
            <button type="button" id="openStoreModal" class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <span class="material-icons-outlined text-base">storefront</span>
              <span class="pickup-button-label">${pickupStore ? 'Cambiar de tienda' : 'Elegir tienda'}</span>
            </button>
            <p id="pickupError" class="hidden text-xs font-semibold text-red-500">Selecciona una tienda para concluir el pedido.</p>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="text-sm font-semibold mb-4">Método de pago</div>
          <div class="grid gap-3">
            <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
              <input type="radio" name="pay" value="tarjeta" />
              <span class="material-icons-outlined text-brand-600">credit_card</span>
              <span class="font-medium">Tarjeta de crédito / débito</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
              <input type="radio" name="pay" value="yape" />
              <span class="material-icons-outlined text-brand-600">qr_code</span>
              <span class="font-medium">Yape/Plin (QR)</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
              <input type="radio" name="pay" value="contraentrega" />
              <span class="material-icons-outlined text-brand-600">payments</span>
              <span class="font-medium">Pago contra entrega</span>
            </label>
          </div>
          <p id="payError" class="hidden mt-2 text-xs font-semibold text-red-500">Selecciona un método de pago para continuar.</p>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="flex justify-between text-sm"><span>Modalidad</span><span id="checkoutMethodLabel">${currentMethod === 'pickup' ? 'Recojo en tienda' : 'Delivery'}</span></div>
          <div class="flex justify-between text-sm"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
          <div class="flex justify-between text-sm"><span>Envío</span><span id="checkoutShipping">${shippingLabel}</span></div>
          <div class="mt-2 pt-2 border-t flex justify-between font-semibold"><span>Total</span><span id="checkoutTotal">${formatPrice(initialTotal)}</span></div>
          <button class="mt-4 w-full px-4 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Confirmar compra</button>
        </section>
      </form>
      <div id="storeModal" class="hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div class="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
          <button id="closeStoreModal" type="button" class="absolute right-3 top-3 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
            <span class="material-icons-outlined text-base">close</span>
          </button>
          <div class="pr-8">
            <h2 class="text-lg font-semibold text-slate-800">Selecciona la tienda</h2>
            <p class="mt-1 text-xs text-slate-500">Elige una de las tiendas Braedt para recoger tu pedido.</p>
          </div>
          <div class="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-2">
            ${storeOptions}
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" id="cancelStoreModal" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300">Cancelar</button>
            <button type="button" id="confirmStore" class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Guardar tienda</button>
          </div>
          <p id="storeModalError" class="hidden mt-3 text-xs font-semibold text-red-500">Selecciona una opción para continuar.</p>
        </div>
      </div>
      <div id="cardModal" class="hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <button id="closeCardModal" type="button" class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300">
            <span class="material-icons-outlined text-base">close</span>
          </button>
          <div class="text-lg font-semibold mb-1">Datos de la tarjeta</div>
          <p class="text-sm text-slate-500 mb-4">Ingresa los datos de tu tarjeta para continuar con el pago.</p>
          <form id="cardForm" class="space-y-3">
            <div>
              <label for="cardNumber" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Número de tarjeta</label>
              <input id="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" maxlength="23" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="cardExpiry" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Vencimiento</label>
                <input id="cardExpiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" maxlength="5" />
              </div>
              <div>
                <label for="cardCvv" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">CVV</label>
                <input id="cardCvv" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" maxlength="4" />
              </div>
            </div>
            <p id="cardError" class="hidden text-xs font-semibold text-red-500">Completa todos los campos con datos válidos.</p>
            <button id="cardAccept" type="button" class="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40" disabled>Aceptar</button>
          </form>
        </div>
      </div>
      <div id="qrModal" class="hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <button id="closeQrModal" type="button" class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300">
            <span class="material-icons-outlined text-base">close</span>
          </button>
          <div class="text-lg font-semibold mb-1">Escanea el QR</div>
          <div class="text-sm text-slate-500 mb-4">Completa el pago desde tu app Yape o Plin y confirma en la plataforma.</div>
          <div class="flex justify-center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=Pago%20Mayorista" alt="Código QR Yape/Plin" class="w-52 h-52 rounded-xl border border-slate-200 object-cover"/>
          </div>
          <div class="mt-4 text-center text-xs text-slate-400">Tu pedido se confirmará una vez validemos la transferencia.</div>
        </div>
      </div>
    </div>
  `; 

  const fulfillmentRadios = Array.from(document.querySelectorAll('input[name="fulfillment"]'));
  const deliveryDetails = document.getElementById('deliveryDetails');
  const deliveryDateInput = document.getElementById('deliveryDateCheckout');
  const pickupSummary = document.getElementById('pickupSummary');
  const pickupInfoEl = document.getElementById('pickupInfo');
  const pickupError = document.getElementById('pickupError');
  const methodLabelEl = document.getElementById('checkoutMethodLabel');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutTotal');
  const openStoreModalBtn = document.getElementById('openStoreModal');
  const pickupLabelSpan = openStoreModalBtn?.querySelector('.pickup-button-label');
  const storeModal = document.getElementById('storeModal');
  const closeStoreModalBtn = document.getElementById('closeStoreModal');
  const cancelStoreModalBtn = document.getElementById('cancelStoreModal');
  const confirmStoreBtn = document.getElementById('confirmStore');
  const storeModalError = document.getElementById('storeModalError');

  let selectedPickupStore = pickupStore;

  const formatShippingValue = (value) => (value === 0 ? 'Gratis' : formatPrice(value));

  function updateTotals() {
    currentShipping = currentMethod === 'pickup' ? 0 : shippingFor(subtotal);
    if (shippingEl) shippingEl.textContent = formatShippingValue(currentShipping);
    if (methodLabelEl) methodLabelEl.textContent = currentMethod === 'pickup' ? 'Recojo en tienda' : 'Delivery';
    if (totalEl) totalEl.textContent = formatPrice(subtotal + currentShipping);
  }

  function refreshPickupInfo() {
    if (pickupInfoEl) {
      pickupInfoEl.innerHTML = renderPickupInfo(selectedPickupStore);
    }
    if (pickupLabelSpan) {
      pickupLabelSpan.textContent = selectedPickupStore ? 'Cambiar de tienda' : 'Elegir tienda';
    }
    if (storeModal) {
      storeModal.querySelectorAll('input[name="storeOption"]').forEach(radio => {
        radio.checked = radio.value === (selectedPickupStore?.id || '');
      });
    }
  }

  function ensurePickupErrorVisibility() {
    if (currentMethod === 'pickup' && !selectedPickupStore) {
      pickupError?.classList.remove('hidden');
    } else {
      pickupError?.classList.add('hidden');
    }
  }

  function openStoreModalPanel() {
    if (!storeModal) return;
    storeModal.classList.remove('hidden');
    storeModalError?.classList.add('hidden');
  }

  function closeStoreModalPanel() {
    storeModal?.classList.add('hidden');
    storeModalError?.classList.add('hidden');
  }

  function switchToDelivery() {
    currentMethod = 'delivery';
    deliveryDetails?.classList.remove('hidden');
    pickupSummary?.classList.add('hidden');
    setFulfillmentOptions({ method: 'delivery', deliveryDate: deliveryDateInput?.value || '', pickupStore: selectedPickupStore });
    ensurePickupErrorVisibility();
    updateTotals();
  }

  function switchToPickup({ openModal = true } = {}) {
    currentMethod = 'pickup';
    deliveryDetails?.classList.add('hidden');
    pickupSummary?.classList.remove('hidden');
    setFulfillmentOptions({ method: 'pickup', pickupStore: selectedPickupStore });
    refreshPickupInfo();
    ensurePickupErrorVisibility();
    updateTotals();
    if (openModal) openStoreModalPanel();
  }

  refreshPickupInfo();
  ensurePickupErrorVisibility();
  updateTotals();

  fulfillmentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (!e.target.checked) return;
      if (e.target.value === 'pickup') {
        switchToPickup();
      } else {
        switchToDelivery();
      }
    });
  });

  if (deliveryDateInput) {
    deliveryDateInput.addEventListener('change', () => {
      setFulfillmentOptions({ deliveryDate: deliveryDateInput.value, method: 'delivery' });
    });
  }

  openStoreModalBtn?.addEventListener('click', () => {
    openStoreModalPanel();
  });

  closeStoreModalBtn?.addEventListener('click', () => {
    closeStoreModalPanel();
    ensurePickupErrorVisibility();
  });

  cancelStoreModalBtn?.addEventListener('click', () => {
    closeStoreModalPanel();
    ensurePickupErrorVisibility();
  });

  confirmStoreBtn?.addEventListener('click', () => {
    if (!storeModal) return;
    const selected = storeModal.querySelector('input[name="storeOption"]:checked');
    if (!selected) {
      storeModalError?.classList.remove('hidden');
      return;
    }
    const store = stores.find(s => s.id === selected.value);
    if (!store) {
      storeModalError?.classList.remove('hidden');
      return;
    }
    selectedPickupStore = store;
    setFulfillmentOptions({ method: 'pickup', pickupStore: store });
    refreshPickupInfo();
    ensurePickupErrorVisibility();
    updateTotals();
    closeStoreModalPanel();
  });

  const cardModal = document.getElementById('cardModal');
  const cardForm = document.getElementById('cardForm');
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');
  const cardAccept = document.getElementById('cardAccept');
  const cardError = document.getElementById('cardError');
  const closeCardModalBtn = document.getElementById('closeCardModal');
  const cardPayRadio = document.querySelector('input[name="pay"][value="tarjeta"]');
  let cardDataAccepted = false;
  const payError = document.getElementById('payError');

  function resetCardForm() {
    if (cardNumber) cardNumber.value = '';
    if (cardExpiry) cardExpiry.value = '';
    if (cardCvv) cardCvv.value = '';
    if (cardAccept) cardAccept.disabled = true;
    cardError?.classList.add('hidden');
  }

  function normalizeCardNumber(value) {
    return value.replace(/\D+/g, '').slice(0, 19);
  }

  function formatCardNumber(value) {
    const digits = normalizeCardNumber(value);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function validateCardValues() {
    const number = normalizeCardNumber(cardNumber.value);
    const expiry = cardExpiry.value.trim();
    const cvv = cardCvv.value.trim();
    const numberValid = /^\d{13,19}$/.test(number);
    const expiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
    const cvvValid = /^\d{3,4}$/.test(cvv);
    const isValid = numberValid && expiryValid && cvvValid;
    cardAccept.disabled = !isValid;
    cardError.classList.toggle('hidden', isValid);
    return { isValid, number, expiry, cvv };
  }

  function showCardModal() {
    if (!cardModal) return;
    cardModal.classList.remove('hidden');
    resetCardForm();
    cardDataAccepted = false;
    requestAnimationFrame(() => cardNumber?.focus());
  }

  function hideCardModal({ resetSelection = false } = {}) {
    if (!cardModal) return;
    cardModal.classList.add('hidden');
    if (resetSelection) {
      cardDataAccepted = false;
      resetCardForm();
      if (cardPayRadio) {
        cardPayRadio.checked = false;
      }
    }
  }

  cardNumber?.addEventListener('input', (e) => {
    e.target.value = formatCardNumber(e.target.value);
    validateCardValues();
  });
  cardExpiry?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    e.target.value = value;
    validateCardValues();
  });
  cardCvv?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    validateCardValues();
  });
  cardForm?.addEventListener('submit', (e) => e.preventDefault());
  cardAccept?.addEventListener('click', () => {
    const { isValid } = validateCardValues();
    if (!isValid) {
      cardError?.classList.remove('hidden');
      return;
    }
    cardDataAccepted = true;
    hideCardModal();
  });

  closeCardModalBtn?.addEventListener('click', () => {
    hideCardModal({ resetSelection: true });
  });

  cardModal?.addEventListener('click', (e) => {
    if (e.target === cardModal) {
      hideCardModal({ resetSelection: true });
    }
  });

  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  function showQrModal() { qrModal.classList.remove('hidden'); }
  function hideQrModal() { qrModal.classList.add('hidden'); }

  if (closeQrModal) {
    closeQrModal.addEventListener('click', hideQrModal);
  }
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) hideQrModal();
    });
  }

  document.querySelectorAll('input[name="pay"]').forEach(input => {
    input.addEventListener('change', (e) => {
      cardDataAccepted = false;
      payError?.classList.add('hidden');
      if (e.target.value === 'yape') {
        showQrModal();
      } else if (e.target.value === 'tarjeta') {
        showCardModal();
      }
    });
  });

  document.getElementById('payForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const formData = new FormData(e.currentTarget);
    const pay = formData.get('pay');
    if (!pay) {
      payError?.classList.remove('hidden');
      return;
    }
    payError?.classList.add('hidden');
    if (pay === 'tarjeta' && !cardDataAccepted) {
      showCardModal();
      return;
    }
    const fulfillmentOptions = getFulfillmentOptions();
    const isPickup = fulfillmentOptions.method === 'pickup';
    if (isPickup && !fulfillmentOptions.pickupStore) {
      ensurePickupErrorVisibility();
      openStoreModalPanel();
      return;
    }
    const shippingCost = currentMethod === 'pickup' ? 0 : shippingFor(subtotal);
    const order = createOrder({
      customer: { name, phone, address },
      payment: pay,
      shipping: shippingCost,
      fulfillment: {
        method: fulfillmentOptions.method,
        deliveryDate: fulfillmentOptions.deliveryDate || '',
        pickupStore: fulfillmentOptions.pickupStore || null,
      },
    });
    navigate(`/confirmacion?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(phone)}`);
  });
}
