
const DATA_URL = 'assets/people.json';
const MX_PREFIX = '52'; // Mexico
let current = 0;
let timer = null;
const INTERVAL = 4500;

const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

function waLink(phone){
  // strip non-digits
  const digits = (phone||'').replace(/\D/g,'');
  return `https://wa.me/${MX_PREFIX}${digits}`;
}

function iconWhatsapp(){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
    <path fill="#fff" d="M19.11 17.74c-.3-.17-1.76-.96-2.03-1.07-.27-.1-.46-.17-.66.17-.2.33-.77 1.06-.95 1.28-.17.2-.35.23-.64.1-.3-.17-1.23-.45-2.35-1.45-.86-.77-1.45-1.7-1.6-1.98-.17-.3 0-.46.14-.64.14-.14.3-.35.44-.52.14-.2.2-.33.3-.55.1-.2.05-.4-.02-.55-.07-.17-.66-1.6-.9-2.2-.23-.54-.47-.47-.66-.47h-.55c-.2 0-.54.08-.82.4-.27.33-1.06 1.04-1.06 2.57 0 1.52 1.1 2.98 1.25 3.18.17.2 2.17 3.3 5.25 4.6.73.3 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.08 1.76-.72 2-1.43.24-.7.24-1.3.17-1.44-.07-.14-.26-.2-.56-.35z"/>
    <path fill="#25D366" d="M27.54 4.46C24.89 1.8 21.29.3 17.5.3 9.08.3 2.3 7.08 2.3 15.5c0 2.7.7 5.34 2.04 7.67L2 30l6.97-2.28a15.2 15.2 0 0 0 7.54 2c8.42 0 15.2-6.79 15.2-15.2 0-3.8-1.48-7.41-4.14-10.06zm-10.04 23c-2.64 0-5.23-.73-7.46-2.1l-.53-.32-4.13 1.36 1.36-4.03-.35-.59a12.9 12.9 0 0 1-1.96-6.87c0-7.14 5.81-12.95 12.96-12.95 3.46 0 6.7 1.34 9.14 3.78a12.86 12.86 0 0 1 3.8 9.16c0 7.14-5.82 12.96-12.96 12.96z"/>
  </svg>`;
}


function mediaMarkup(src, alt, isModal=false){
  const lower = (src||'').toLowerCase();
  if(lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')){
    const attrs = isModal
      ? 'controls playsinline'
      : 'autoplay muted loop playsinline';
    return `<video ${attrs} preload="metadata" src="${src}" aria-label="${alt}"></video>`;
  }
  if(lower.endsWith('.svg')){
    return `<object type="image/svg+xml" data="${src}" aria-label="${alt}"></object>`;
  }
  return `<img src="${src}" alt="${alt}">`;
}

function buildSlides(data){
  const carousel = $('.carousel');
  const dots = $('.dots');
  data.forEach((p,i)=>{
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `
      ${mediaMarkup(p.image, p.name)}
      <div class="caption">
        <div class="person">
          <span class="name">${p.name}</span>
          <span class="role">${p.role||''}</span>
        </div>
        <a class="whatsapp" href="${waLink(p.phone)}" target="_blank" rel="noopener">
          ${iconWhatsapp()}
          <span>WhatsApp</span>
        </a>
      </div>`;
    carousel.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Ir a ${p.name}`);
    dot.addEventListener('click', ()=>goTo(i, true));
    dots.appendChild(dot);
  });
}

function buildGrid(data){
  const grid = $('.grid');
  data.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${mediaMarkup(p.image, p.name)}
      <div class="info">
        <div>
          <div class="name" style="font-size:16px">${p.name}</div>
          <div class="role" style="font-size:12px">${p.role||''}</div>
        </div>
        <a class="whatsapp" style="padding:8px 12px" href="${waLink(p.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${p.name}">
          ${iconWhatsapp()}
        </a>
      </div>`;
    grid.appendChild(card);
  });
}

function goTo(index, manual=false){
  const slides = $$('.slide');
  const dots = $$('.dot');
  slides.forEach(el=>el.classList.remove('active'));
  dots.forEach(el=>el.classList.remove('active'));
  current = (index+slides.length)%slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
  if(manual){ restart(); }
}

function next(){ goTo(current+1); }
function prev(){ goTo(current-1); }

function restart(){
  if(timer){ clearInterval(timer); }
  timer = setInterval(next, INTERVAL);
}


// ---- Lightbox Modal ----
function openModal(p){
  const modal = document.querySelector('.modal');
  
  modal.innerHTML = `
    <div class="inner">
      <button class="closebtn" aria-label="Cerrar">✕</button>
      <div class="media">
        ${mediaMarkup(p.image, `${p.name} grande`, true)}
      </div>
      <div class="info">
        <div>
          <div class="title">${p.name}</div>
          <div class="subtitle">${p.role||''}</div>
        </div>
      </div>
      <div class="footer-cta">
        <a class="whatsapp" href="${waLink(p.phone)}" target="_blank" rel="noopener">
          ${iconWhatsapp()} <span>WhatsApp</span>
        </a>
      </div>
    </div>`;

  modal.classList.add('open');
  modal.querySelector('.closebtn').addEventListener('click', ()=>closeModal());
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', escClose);
}
function escClose(e){ if(e.key === 'Escape'){ closeModal(); } }
function closeModal(){
  document.querySelector('.modal').classList.remove('open');
  document.removeEventListener('keydown', escClose);
}

async function init(){
  const res = await fetch(DATA_URL);
  const data = await res.json();
  buildSlides(data);
  buildGrid(data);
  goTo(0);
  restart();
  // Click to open modal from slides
  $$('.slide').forEach((el, idx)=>{
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', ()=> openModal(data[idx]));
  });
  // Click to open modal from cards
  $$('.card').forEach((el, idx)=>{
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', (e)=>{
      // avoid opening when clicking the WA button inside the card
      if(e.target.closest('.whatsapp')) return;
      openModal(data[idx]);
    });
  });


  $('.btn.prev').addEventListener('click', ()=>prev());
  $('.btn.next').addEventListener('click', ()=>next());

  // Pause on hover for accessibility

  // Ensure modal node exists
  if(!document.querySelector('.modal')){
    const m = document.createElement('div'); m.className='modal'; document.body.appendChild(m);
  }

  $('.carousel').addEventListener('mouseenter', ()=>{ if(timer){ clearInterval(timer); } });
  $('.carousel').addEventListener('mouseleave', ()=>{ restart(); });
}
init();
