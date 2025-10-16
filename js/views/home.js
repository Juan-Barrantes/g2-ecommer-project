import { navigate } from '../router.js';

export default function renderHome() {
  const app = document.getElementById('app');
  const carouselItems = [
    {
      src: 'https://braedt.com.pe/storage/d04e9-salchica-blanca.jpg',
      alt: 'chorizos y salchichas en una tabla de madera',
      tag: 'Ofertas',
      highlight: 'Por el mes de octubre dscto. 15%',
      caption: 'Variedad premium para tu mesa',
    },
    {
      src: 'https://braedt.com.pe/storage/14c3d-jamon_pechuga_pavo.jpg',
      alt: 'Jamones Braedt empaquetados para entrega',
      tag: 'Nuevo',
      highlight: 'Entrega refrigerada 24h',
      caption: 'Jamón de pechuga de Pavo',
    },
    {
      src: 'https://braedt.com.pe/storage/4de69-queso_edam.jpg',
      alt: 'Persona preparando bocadillos con salchichas',
      tag: 'Quesos',
      highlight: 'Nuevos productos',
      caption: 'Ideal para acompñar otros productos braedt',
    },
  ];
  const categories = [{
      description: 'Jamones',
      image: 'https://braedt.com.pe/storage/31697-lomo-ahumado.jpg'
    }, 
    {
      description: 'Salchichas', 
      image: 'https://braedt.com.pe/storage/b545d-salchicha-vienesa.jpg'
    }, 
    { description: 'Chorizos',
      image: 'https://braedt.com.pe/storage/b6ae5-salchicha-de-huacho.jpg'
    }, 
    {
      description: 'Fiambres',
      image: 'https://braedt.com.pe/storage/5b9f0-cabanossi.jpg'
    }, 
    {
      description: 'Pavo',
      image:'https://braedt.com.pe/storage/dc387-jamon-del-pais-artesanal.jpg'
    }, 
    { 
      description: 'Packs',
      image:'https://braedt.com.pe/storage/5d5fa-pack_york_gouda.jpg'
    }];

  app.innerHTML = `
  <section class="relative overflow-hidden background-brand">
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white"></div>
    <div class="mx-auto">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="max-w-7xl hidden md:block px-4 sm:px-8 md:px-12 lg:px-24 xl:px-48 py-24 md:py-36">

          <div class="w-[65%] flex mb-5 items-center text-brand-1100 font-semibold mx-auto">
            <div class="flex-1 border-t-2 border-brand-1100"></div>
            <span class="px-6 text-xs">X</span>
            <div class="flex-1 border-t-2 border-brand-1100"></div>
          </div>

          <h1 class="josefin-sans-700  text-3xl md:text-5xl tracking-tighter uppercase text-brand-600 text-center">Embutidos Braedt, directo a tu mesa</h1>
          
          <div class="w-[65%] flex mt-5 items-center text-brand-1100 font-semibold mx-auto">
            <div class="flex-1 border-t-2 border-brand-1100"></div>
            <span class="px-6 text-xs">X</span>
            <div class="flex-1 border-t-2 border-brand-1100"></div>
          </div>
         
          <p class="mt-4 text-slate-600 text-lg">Compra jamones, salchichas, chorizos y más con precios mayoristas, escalas por volumen y entrega refrigerada.</p>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#/catalogo"class="text-sm px-6 py-3 border border-2 border-brand-600 text-brand-600 font-semibold uppercase text-center bg-transparent hover:bg-brand-700 hover:text-white transition-colors duration-300">Ver catálogo</a>
            <button id="ctaLearnDesktop" 
                    class="text-sm px-6 py-3 border border-2 border-brand-600  font-semibold uppercase text-center bg-brand-700 text-white hover:bg-transparent hover:text-brand-600 transition-colors duration-300">
                    Conocer beneficios
            </button>
          </div>
          
          <div class="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-600">
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">sell</span>Precios mayoristas</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">ac_unit</span>Entrega refrigerada</div>
            <div class="flex items-center gap-2"><span class="material-icons-outlined text-brand-600">verified</span>Calidad Braedt</div>
          </div>

       
         
        </div>
        <div class="relative">
          <div id="homeCarousel" class="relative overflow-hidden w-full h-full">
            ${carouselItems
              .map(
                (item, index) => `
            <div class="carousel-slide ${index === 0 ? 'block' : 'hidden'} relative h-[280px] sm:h-[360px] md:h-[90vh]" data-carousel-slide="${index}">
              <img class="absolute inset-0 h-full w-full object-cover" src="${item.src}" alt="${item.alt}" loading="lazy" />
              <div class="absolute inset-0 bg-slate-900/20"></div>
              <div class="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg">
                <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/90">
                  <span class="inline-flex items-center justify-center rounded-full border border-white/40 bg-black/30 px-2 py-0.5">${item.tag}</span>
                  <span>${item.highlight}</span>
                </div>
                <p class="mt-1 mb-2 text-base md:text-lg font-semibold leading-snug">${item.caption}</p>
              </div>
            </div>`
              )
              .join('')}
            <button id="carouselPrev" type="button" class="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full  text-white shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-100">
              <span class="material-icons-outlined">chevron_left</span>
            </button>
            <button id="carouselNext" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full  text-white shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-100">
              <span class="material-icons-outlined">chevron_right</span>
            </button>
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              ${carouselItems
                .map(
                  (_item, index) => `
              <button type="button" class="carousel-indicator  h-1.5 w-1.5 rounded-full bg-white/50 ${index === 0 ? 'ring-2 ring-offset-2 ring-white bg-white' : ''}" data-carousel-indicator="${index}" aria-label="Ir a la diapositiva ${index + 1}"></button>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  <section class="md:hidden bg-white/80 background-brand">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
      <div class="w-[65%] flex mb-1 items-center text-brand-1100 font-semibold mx-auto">
        <div class="flex-1 border-t-2 border-brand-1100"></div>
        <span class="px-6 text-xs">X</span>
        <div class="flex-1 border-t-2 border-brand-1100"></div>
      </div>

      <h1 class="josefin-sans-700  text-3xl md:text-5xl tracking-tighter uppercase text-brand-600 text-center">Embutidos Braedt, directo a tu mesa</h1>
      
      <div class="w-[65%] flex mt-1 items-center text-brand-1100 font-semibold mx-auto">
        <div class="flex-1 border-t-2 border-brand-1100"></div>
        <span class="px-6 text-xs">X</span>
        <div class="flex-1 border-t-2 border-brand-1100"></div>
      </div>
      
      <div>
        <p class="mt-3 text-slate-600 text-base">Compra jamones, salchichas, chorizos y más con precios mayoristas, escalas por volumen y entrega refrigerada.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <a href="#/catalogo"class="text-sm px-6 py-3 border border-2 border-brand-600 text-brand-600 font-semibold uppercase text-center bg-transparent hover:bg-brand-700 hover:text-white transition-colors duration-300">Ver catálogo</a>
            <button id="ctaLearnDesktop" 
                    class="text-sm px-6 py-3 border border-2 border-brand-600  font-semibold uppercase text-center bg-brand-700 text-white hover:bg-transparent hover:text-brand-600 transition-colors duration-300">
                    Conocer beneficios
            </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm text-slate-600">
        <div class="flex items-center gap-1 rounded-2xl bg-transparent px-4 py-3"><span class="material-icons-outlined text-brand-600">sell</span>Precios mayoristas</div>
        <div class="flex items-center gap-1 rounded-2xl bg-transparent px-4 py-3"><span class="material-icons-outlined text-brand-600">ac_unit</span>Entrega refrigerada</div>
        <div class="flex items-center gap-1 rounded-2xl bg-transparent px-4 py-3"><span class="material-icons-outlined text-brand-600">verified</span>Calidad Braedt</div>
      </div>

     
    </div>
  </section>
  <section class="background-brand-2 pt-12 pb-36">
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ">
    <div class="w-full px-2 pb-12 mb-4 mt-4 items-center text-center overflow-hidden pt-sans-regular">
      <img
        src="/assets/texts/text-nuestros-productos-white.png"
        class="mx-auto w-48 sm:w-56 md:w-64 lg:w-72" 
        >
      <p class="text-white mt-3" >Explora todas nuestras categorias</p>
    </div>  
  
    <div class="grid grid-cols-1 px-2 py-2 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white rounded-lg w-[70%]  mx-auto">
      ${categories
        .map(
          (c) => `
        <a 
          href="#/catalogo?cat=${encodeURIComponent(c.description)}"
          class="relative block border border-slate-200 h-64 w-full overflow-hidden rounded-lg hover:border-brand-300 hover:shadow-soft transition-all duration-500 ease-in-out group"
        >
          <!-- Imagen de fondo -->
          <img 
            src="${c.image}" 
            alt="${c.description}" 
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          >

          <!-- Capa oscura encima -->
          <div class="absolute inset-0 bg-black/20 transition-colors duration-700 ease-in-out group-hover:bg-black/40"></div>

          <!-- Contenido inferior -->
          <div class="absolute bottom-0 inset-x-0 bg-brand-600/80 px-2 text-white text-left py-3">
            <div class="font-semibold text-sm">| ${c.description}</div>
          </div>
        </a>

        `
        )
        .join('')}
    </div>
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
