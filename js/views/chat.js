import { listChatMessages, appendChatMessage, getUser } from '../store.js';
import { navigate } from '../router.js';

const dayFormatter = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[ch]);
}

function statusLabel(status) {
  if (!status) return '';
  const map = { delivered: 'Entregado', pending: 'Enviado', read: 'Leído' };
  return map[status] || status;
}

export default function renderChat() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-10 h-full flex">
      <div class="chat-card relative flex flex-col h-[calc(100vh-220px)] md:h-[680px] max-h-[820px] w-full rounded-[32px] border border-slate-200 bg-white shadow-soft overflow-hidden">
        <header class="relative z-10 flex items-center justify-between gap-3 px-4 py-4 md:px-6 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">BD</div>
            <div>
              <p class="text-sm font-semibold text-slate-800">Laura • Soporte en vivo</p>
              <p class="text-xs text-emerald-600 flex items-center gap-1">
                <span class="material-icons-outlined text-xs">circle</span>
                En línea ahora
              </p>
            </div>
          </div>
          <button id="chatCTA" class="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 transition">
            <span class="material-icons-outlined text-base">storefront</span>
            Ver catálogo
          </button>
        </header>
        <div id="chatStream" class="relative flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 space-y-4 bg-slate-50 scrollbar-thin"></div>
        <footer class="border-t border-slate-200 bg-white px-3 py-4 md:px-6">
          <form id="chatComposer" class="space-y-3">
            <div class="flex items-end gap-2 rounded-3xl border border-transparent bg-slate-100/80 px-3 py-2 transition focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-sm">
              <textarea id="chatInput" rows="1" placeholder="Escribe tu mensaje..." class="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none max-h-36"></textarea>
              <button type="submit" id="chatSend" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm hover:bg-brand-700 transition">
                <span class="material-icons-outlined">send</span>
              </button>
            </div>
            <div class="flex gap-2 overflow-x-auto text-xs text-slate-600">
              <button type="button" data-template="¿Podrías enviarme la lista de precios actualizada?" class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium hover:border-brand-400 hover:text-brand-600 transition">Lista de precios</button>
              <button type="button" data-template="Necesito confirmar el estado de mi pedido actual." class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium hover:border-brand-400 hover:text-brand-600 transition">Estado del pedido</button>
              <button type="button" data-template="Quisiera coordinar una visita con un asesor comercial." class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium hover:border-brand-400 hover:text-brand-600 transition">Agendar visita</button>
            </div>
          </form>
        </footer>
      </div>
    </section>
  `;

  const stream = document.getElementById('chatStream');
  const composer = document.getElementById('chatComposer');
  const input = document.getElementById('chatInput');
  const quickButtons = composer.querySelectorAll('[data-template]');
  const cta = document.getElementById('chatCTA');

  let replyTimeout = null;
  let isAgentTyping = false;

  const userName = () => (getUser()?.name || '').split(' ')[0] || 'cliente';

  function scrollToBottom(smooth = true) {
    requestAnimationFrame(() => {
      stream.scrollTo({ top: stream.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
  }

  function renderMessages({ scroll = true } = {}) {
    const messages = listChatMessages().slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let lastDay = '';
    const parts = [];

    messages.forEach(msg => {
      const date = msg.createdAt ? new Date(msg.createdAt) : new Date();
      const dayKey = date.toDateString();
      if (dayKey !== lastDay) {
        lastDay = dayKey;
        parts.push(`
          <div class="flex justify-center">
            <div class="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 border border-slate-200/70">
              ${escapeHTML(dayFormatter.format(date))}
            </div>
          </div>
        `);
      }
      const isCustomer = msg.from === 'customer';
      const bubble = `
        <div class="${isCustomer ? 'bg-brand-600 text-white rounded-3xl rounded-tr-md shadow-lg' : 'bg-white text-slate-700 rounded-3xl rounded-tl-md border border-slate-200 shadow-sm'} px-4 py-3 text-sm leading-relaxed">
          ${escapeHTML(msg.text)}
          <div class="mt-1 text-[11px] uppercase tracking-wide ${isCustomer ? 'text-white/75 text-right' : 'text-slate-400'}">
            ${escapeHTML(timeFormatter.format(date))}${msg.status ? ` • ${escapeHTML(statusLabel(msg.status))}` : ''}
          </div>
        </div>
      `;
      if (isCustomer) {
        parts.push(`<div class="flex justify-end">${bubble}</div>`);
      } else {
        parts.push(`
          <div class="flex items-end gap-2">
            <div class="hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-[11px] font-semibold text-brand-700">L</div>
            <div class="max-w-[85%]">${bubble}</div>
          </div>
        `);
      }
    });

    if (isAgentTyping) {
      parts.push(`
        <div class="flex items-end gap-2">
          <div class="hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-[11px] font-semibold text-brand-700">L</div>
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      `);
    }

    stream.innerHTML = parts.join('');
    if (scroll) scrollToBottom();
  }

  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 160) + 'px';
  }

  function pickReply(text) {
    const lower = text.toLowerCase();
    const name = userName();
    if (lower.includes('precio')) return `Te envío la lista de precios actualizada en unos minutos, ${name}.`;
    if (lower.includes('pedido') || lower.includes('orden')) return `Reviso tu pedido y te confirmo el estado enseguida, ${name}.`;
    if (lower.includes('visita') || lower.includes('llamada')) return `Coordinemos una visita. ¿Te acomoda mañana en la mañana, ${name}?`;
    if (lower.includes('envio') || lower.includes('envío')) return 'En Lima y Callao entregamos refrigerado al día siguiente desde el almacén. 😊';
    const options = [
      `Gracias ${name}. Si necesitas una cotización formal puedo enviarla ahora mismo.`,
      'Recuerda que desde S/600 el envío es gratuito y refrigerado. 👍',
      'Si prefieres, podemos continuar la atención por WhatsApp o programar una videollamada.',
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  function scheduleAgentReply(context) {
    clearTimeout(replyTimeout);
    isAgentTyping = true;
    renderMessages();
    const text = pickReply(context);
    replyTimeout = setTimeout(() => {
      isAgentTyping = false;
      appendChatMessage({ from: 'agent', text, meta: { status: 'delivered' } });
    }, 900 + Math.random() * 600);
  }

  function sendMessage(raw) {
    const text = raw.trim();
    if (!text) return;
    appendChatMessage({ from: 'customer', text, meta: { status: 'sent' } });
    input.value = '';
    autoResize();
    scheduleAgentReply(text);
  }

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  input.addEventListener('input', autoResize);
  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.template || '';
      autoResize();
      input.focus();
    });
  });

  cta?.addEventListener('click', () => navigate('/catalogo'));

  const onChatUpdated = () => renderMessages();
  document.addEventListener('chat:updated', onChatUpdated);

  const cleanup = () => {
    document.removeEventListener('chat:updated', onChatUpdated);
    window.removeEventListener('hashchange', cleanup);
    clearTimeout(replyTimeout);
  };
  window.addEventListener('hashchange', cleanup, { once: true });

  renderMessages({ scroll: false });
  autoResize();
  scrollToBottom(false);
}
