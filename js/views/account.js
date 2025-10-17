import { getUser, signOut, signIn, createAccount } from '../store.js';
import { showToast } from '../components/toast.js';

export default function renderAccount() {
  const app = document.getElementById('app');
  const user = getUser();
  if (user) {
    app.innerHTML = `
      <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-2xl font-bold mb-4">Mi cuenta</h1>
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="font-semibold">${user.name}</div>
          <div class="text-sm text-slate-600">${user.email || ''}</div>
          <div class="text-sm text-slate-600">${user.phone || ''}</div>
          <button id="logout" class="mt-4 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Cerrar sesión</button>
        </div>
      </div>
    `;
    document.getElementById('logout').addEventListener('click', ()=>{ signOut(); location.hash = '#/'; });
    return;
  }

  app.innerHTML = `
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold mb-4">Cuenta</h1>
      <div class="grid grid-cols-2 gap-2 mb-3">
        <button id="tabLogin" class="tab px-4 py-2 rounded-xl border border-brand-500 text-brand-700 bg-brand-50">Iniciar sesión</button>
        <button id="tabRegister" class="tab px-4 py-2 rounded-xl border border-slate-200">Crear cuenta</button>
      </div>
      <div id="loginView" class="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <label class="text-xs text-slate-500">Correo</label>
          <input id="loginEmail" type="email" class="w-full px-3 py-2 rounded-xl border border-slate-200" placeholder="tucorreo@negocio.pe" />
        </div>
        <div>
          <label class="text-xs text-slate-500">Contraseña</label>
          <input id="loginPass" type="password" class="w-full px-3 py-2 rounded-xl border border-slate-200" placeholder="••••••••" />
        </div>
        <button id="loginBtn" class="w-full px-4 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Entrar</button>
        <p id="loginError" class="hidden text-sm text-red-600">Credenciales inválidas</p>
      </div>

      <div id="registerView" class="hidden rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div class="grid gap-3">
          <div>
            <label class="text-xs text-slate-500">Nombre del negocio</label>
            <input id="regName" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-xs text-slate-500">Correo</label>
            <input id="regEmail" type="email" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-xs text-slate-500">Contraseña</label>
            <input id="regPass" type="password" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-xs text-slate-500">Teléfono</label>
            <input id="regPhone" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-xs text-slate-500">Dirección</label>
            <input id="regAddress" class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
        </div>
        <button id="registerBtn" class="w-full px-4 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Crear cuenta</button>
        <p id="registerError" class="hidden text-sm text-red-600"></p>
      </div>
    </div>
  `;

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  function showLogin() {
    tabLogin.className = 'tab px-4 py-2 rounded-xl border border-brand-500 text-brand-700 bg-brand-50';
    tabRegister.className = 'tab px-4 py-2 rounded-xl border border-slate-200';
    loginView.classList.remove('hidden');
    registerView.classList.add('hidden');
  }
  function showRegister() {
    tabRegister.className = 'tab px-4 py-2 rounded-xl border border-brand-500 text-brand-700 bg-brand-50';
    tabLogin.className = 'tab px-4 py-2 rounded-xl border border-slate-200';
    registerView.classList.remove('hidden');
    loginView.classList.add('hidden');
  }
  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);

  document.getElementById('loginBtn').addEventListener('click', ()=>{
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const u = signIn(email, pass);
    const err = document.getElementById('loginError');
    if (!u) { err.classList.remove('hidden'); return; }
    document.dispatchEvent(new CustomEvent('user:changed'));
    location.hash = '#/';
  });

  document.getElementById('registerBtn').addEventListener('click', ()=>{
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value;
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const err = document.getElementById('registerError');
    err.classList.add('hidden'); err.textContent = '';

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        err.textContent = 'Correo electrónico no válido';
        err.classList.remove('hidden');
        return;
      }

    try {
      if (!name || !email || !password) throw new Error('Completa nombre, correo y contraseña');
      createAccount({ name, email, password, phone, address });
      showToast('Tu cuenta se creo con exito');
      document.dispatchEvent(new CustomEvent('user:changed'));
      location.hash = '#/';
    } catch (e) {
      err.textContent = e.message || 'No se pudo crear la cuenta';
      err.classList.remove('hidden');
    }
  });
}
