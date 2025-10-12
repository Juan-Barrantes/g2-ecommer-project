import { cartSummary, createOrder, getUser, shippingFor } from '../store.js';
import { formatPrice } from '../utils/format.js';
import { navigate } from '../router.js';

export default function renderCheckout() {
  const app = document.getElementById('app');
  const user = getUser();
  const { subtotal } = cartSummary();
  const shipping = shippingFor(subtotal);

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
              <input id="address" required placeholder="Calle 123, Distrito" class="w-full px-3 py-2 rounded-xl border border-slate-200"/>
            </div>
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
          <div class="flex justify-between text-sm"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
          <div class="flex justify-between text-sm"><span>Envío</span><span>${shipping===0?'Gratis':formatPrice(shipping)}</span></div>
          <div class="mt-2 pt-2 border-t flex justify-between font-semibold"><span>Total</span><span>${formatPrice(subtotal+shipping)}</span></div>
          <button class="mt-4 w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Confirmar compra</button>
        </section>
      </form>
      <div id="cardModal" class="hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
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

  const cardModal = document.getElementById('cardModal');
  const cardForm = document.getElementById('cardForm');
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');
  const cardAccept = document.getElementById('cardAccept');
  const cardError = document.getElementById('cardError');
  let cardDataAccepted = false;
  const payError = document.getElementById('payError');

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
    cardDataAccepted = false;
    requestAnimationFrame(() => cardNumber?.focus());
  }

  function hideCardModal() {
    cardModal?.classList.add('hidden');
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
    const pay = (new FormData(e.currentTarget)).get('pay');
    if (!pay) {
      payError?.classList.remove('hidden');
      return;
    }
    payError?.classList.add('hidden');
    if (pay === 'tarjeta' && !cardDataAccepted) {
      showCardModal();
      return;
    }
    const order = createOrder({
      customer: { name, phone, address },
      payment: pay,
      shipping,
    });
    navigate(`/confirmacion?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(phone)}`);
  });
}
