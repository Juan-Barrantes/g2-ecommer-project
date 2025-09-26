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
              <input type="radio" name="pay" value="tarjeta" checked />
              <span class="material-icons-outlined text-brand-600">credit_card</span>
              <span class="font-medium">Tarjeta de crédito / débito</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
              <input type="radio" name="pay" value="contraentrega" />
              <span class="material-icons-outlined text-brand-600">payments</span>
              <span class="font-medium">Pago contra entrega</span>
            </label>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="flex justify-between text-sm"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
          <div class="flex justify-between text-sm"><span>Envío</span><span>${shipping===0?'Gratis':formatPrice(shipping)}</span></div>
          <div class="mt-2 pt-2 border-t flex justify-between font-semibold"><span>Total</span><span>${formatPrice(subtotal+shipping)}</span></div>
          <button class="mt-4 w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Confirmar compra</button>
        </section>
      </form>
    </div>
  `;

  document.getElementById('payForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const pay = (new FormData(e.currentTarget)).get('pay');
    const order = createOrder({
      customer: { name, phone, address },
      payment: pay,
      shipping,
    });
    navigate(`/confirmacion?id=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(phone)}`);
  });
}

