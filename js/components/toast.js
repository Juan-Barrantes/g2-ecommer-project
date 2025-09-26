export function showToast(message, type = 'success') {
  const id = `t_${Date.now()}`;
  const el = document.createElement('div');
  el.id = id;
  const color = type === 'error' ? 'bg-red-600' : type === 'warn' ? 'bg-amber-500' : 'bg-emerald-600';
  el.className = `fade-in shadow-soft rounded-xl text-white px-4 py-3 ${color}`;
  el.textContent = message;
  const container = document.getElementById('toastContainer');
  container.appendChild(el);
  setTimeout(()=>{ el.classList.add('opacity-0'); el.style.transition='opacity .2s'; setTimeout(()=>el.remove(), 200); }, 2200);
}

