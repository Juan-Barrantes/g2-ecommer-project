import { navigate } from '../router.js';

export default function renderHome() {
  const app = document.getElementById('app');
  const carouselItems = [
    {
      src: 'https://images.unsplash.com/photo-1604908812172-3a7265a981bc?q=80&w=1400&auto=format&fit=crop',
      alt: 'Selección de embutidos Braedt en bandejas',
      tag: 'Novedad',
      highlight: 'Línea food service 2025',
      caption: 'Variedad premium lista para tu vitrina refrigerada.',
    },
    {
      src: 'https://images.unsplash.com/photo-1600697395545-ef25b8f1b99c?q=80&w=1400&auto=format&fit=crop',
      alt: 'Jamones Braedt empaquetados para entrega',
      tag: 'Mayorista',
      highlight: 'Entrega refrigerada 24h',
      caption: 'Cobertura Lima y Callao con cadena de frío garantizada.',
    },
    {
      src: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop',
      alt: 'Persona preparando bocadillos con salchichas',
      tag: 'Recetas',
      highlight: 'Ideas listas para vender',
      caption: 'Activa tus combos con productos Braedt listos para tu carta.',
    },
  ];
  const categories = ['Jamones', 'Salchichas', 'Chorizos', 'Fiambres', 'Pavo', 'Packs'];

  app.innerHTML = `
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="hidden md:block">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-4">
            <span class="material-icons-outlined text-sm">local_mall</span> Compra directa de Braedt
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Embutidos Braedt, ahora directos a tu negocio</h1>
          <p class="mt-4 text-slate-600 text-lg">Compra jamones, salchichas, chorizos y más con precios mayoristas, escalas por volumen y entrega refrigerada.</p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#/catalogo" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center">Ver catálogo</a>
            <button id="ctaLearnDesktop" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold">Conocer beneficios</button>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-600">
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">sell</span>Precios mayoristas</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">ac_unit</span>Entrega refrigerada</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">verified</span>Calidad Braedt</div>
          </div>
        </div>
        <div class="relative">
          <div id="homeCarousel" class="relative overflow-hidden rounded-3xl shadow-soft">
            ${carouselItems
              .map(
                (item, index) => `
            <div class="carousel-slide ${index === 0 ? 'block' : 'hidden'} relative h-[280px] sm:h-[360px] md:h-[420px]" data-carousel-slide="${index}">
              <img class="absolute inset-0 h-full w-full object-cover" src="${item.src}" alt="${item.alt}" loading="lazy" />
              <div class="absolute inset-0 bg-slate-900/20"></div>
              <div class="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg">
                <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/90">
                  <span class="inline-flex items-center justify-center rounded-full border border-white/40 bg-black/30 px-2 py-0.5">${item.tag}</span>
                  <span>${item.highlight}</span>
                </div>
                <p class="mt-2 text-base md:text-lg font-semibold leading-snug">${item.caption}</p>
              </div>
            </div>`
              )
              .join('')}
            <button id="carouselPrev" type="button" class="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500">
              <span class="material-icons-outlined">chevron_left</span>
            </button>
            <button id="carouselNext" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500">
              <span class="material-icons-outlined">chevron_right</span>
            </button>
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              ${carouselItems
                .map(
                  (_item, index) => `
              <button type="button" class="carousel-indicator h-2.5 w-2.5 rounded-full bg-white/50 ${index === 0 ? 'ring-2 ring-offset-2 ring-white bg-white' : ''}" data-carousel-indicator="${index}" aria-label="Ir a la diapositiva ${index + 1}"></button>`
                )
                .join('')}
            </div>
          </div>
          <div class="hidden md:flex absolute -bottom-6 -left-6 md:-left-[14rem] bg-white rounded-2xl shadow-soft px-4 py-3 border border-slate-200 items-center gap-3">
            <span class="material-icons-outlined text-brand-600">local_shipping</span>
            <div>
              <div class="text-sm font-semibold">Entrega refrigerada</div>
              <div class="text-xs text-slate-500">Rutas Lima y Callao</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="md:hidden bg-white/80 border-t border-brand-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-4">
          <span class="material-icons-outlined text-sm">local_mall</span> Compra directa de Braedt
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Embutidos Braedt, ahora directos a tu negocio</h1>
        <p class="mt-3 text-slate-600 text-base">Compra jamones, salchichas, chorizos y más con precios mayoristas, escalas por volumen y entrega refrigerada.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <a href="#/catalogo" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center">Ver catálogo</a>
        <button id="ctaLearnMobile" class="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold">Conocer beneficios</button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
        <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3"><span class="material-icons-outlined text-brand-600">sell</span>Precios mayoristas</div>
        <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3"><span class="material-icons-outlined text-brand-600">ac_unit</span>Entrega refrigerada</div>
        <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3"><span class="material-icons-outlined text-brand-600">verified</span>Calidad Braedt</div>
      </div>
    </div>
  </section>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h2 class="text-xl font-bold mb-4">Empieza por categorías</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      ${categories
        .map(
          (c) => `
        <a href="#/catalogo?cat=${encodeURIComponent(c)}" class="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center hover:border-brand-300 hover:shadow-soft transition">
          <div class="material-icons-outlined text-brand-600">category</div>
          <div class="mt-2 text-sm font-medium">${c}</div>
        </a>`
        )
        .join('')}
    </div>
  </section>`;

  const slides = Array.from(document.querySelectorAll('[data-carousel-slide]'));
  const indicators = Array.from(document.querySelectorAll('[data-carousel-indicator]'));
  const prevButton = document.getElementById('carouselPrev');
  const nextButton = document.getElementById('carouselNext');
  const carouselWrapper = document.getElementById('homeCarousel');

  if (slides.length > 1 && prevButton && nextButton && carouselWrapper) {
    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateIndicators = (index) => {
      indicators.forEach((indicator, indicatorIndex) => {
        if (indicatorIndex === index) {
          indicator.classList.remove('bg-white/50');
          indicator.classList.add('ring-2', 'ring-offset-2', 'ring-white', 'bg-white');
        } else {
          indicator.classList.remove('ring-2', 'ring-offset-2', 'ring-white');
          indicator.classList.add('bg-white/50');
          indicator.classList.remove('bg-white');
        }
      });
    };

    const showSlide = (index) => {
      slides[currentSlide].classList.add('hidden');
      slides[index].classList.remove('hidden');
      updateIndicators(index);
      currentSlide = index;
    };

    const showNext = () => {
      const nextIndex = (currentSlide + 1) % totalSlides;
      showSlide(nextIndex);
    };

    const showPrev = () => {
      const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(prevIndex);
    };

    let autoPlayId = window.setInterval(showNext, 6000);

    const restartAutoPlay = () => {
      window.clearInterval(autoPlayId);
      autoPlayId = window.setInterval(showNext, 6000);
    };

    prevButton.addEventListener('click', () => {
      showPrev();
      restartAutoPlay();
    });

    nextButton.addEventListener('click', () => {
      showNext();
      restartAutoPlay();
    });

    indicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        const index = Number(indicator.dataset.carouselIndicator);
        showSlide(index);
        restartAutoPlay();
      });
    });

    carouselWrapper.addEventListener('mouseenter', () => window.clearInterval(autoPlayId));
    carouselWrapper.addEventListener('mouseleave', restartAutoPlay);
  }

  ['ctaLearnDesktop', 'ctaLearnMobile'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', () => navigate('/catalogo'));
  });
}
