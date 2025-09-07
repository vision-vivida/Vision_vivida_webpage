(function(){
  const slidesEl = document.getElementById('heroSlides');
  if(!slidesEl || !window.POSTERS || window.POSTERS.length === 0) return;

  function pickRandom(arr, n){
    const copy = arr.slice();
    const chosen = [];
    while(chosen.length < Math.min(n, copy.length)){
      const idx = Math.floor(Math.random()*copy.length);
      chosen.push(copy.splice(idx,1)[0]);
    }
    return chosen;
  }

  const picks = pickRandom(window.POSTERS, 3);
  picks.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <img src="${p.src}" alt="${p.name}" />
      <div class="caption">${p.name}</div>
    `;
    slidesEl.appendChild(slide);
  });

  const slides = Array.from(slidesEl.children);
  let current = 0; let timerId;

  function show(index){
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
  }

  function next(){ show(current+1); }
  function prev(){ show(current-1); }

  const btnNext = document.getElementById('heroNext');
  const btnPrev = document.getElementById('heroPrev');
  btnNext && btnNext.addEventListener('click', () => { next(); resetTimer(); });
  btnPrev && btnPrev.addEventListener('click', () => { prev(); resetTimer(); });

  function resetTimer(){
    if(timerId) clearInterval(timerId);
    timerId = setInterval(next, 4000);
  }
  resetTimer();
})(); 