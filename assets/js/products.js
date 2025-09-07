(function(){
  const gridEl = document.getElementById('productsGrid');

  // Lightbox wiring
  const lb = {
    root: document.getElementById('imageLightbox'),
    overlay: document.getElementById('lightboxOverlay'),
    img: document.getElementById('lightboxImage'),
    caption: document.getElementById('lightboxCaption'),
    closeBtn: document.getElementById('lightboxClose'),
    open(src, caption){
      if(!this.root) return;
      if(this.img) this.img.src = src;
      if(this.caption) this.caption.textContent = caption || '';
      this.root.classList.add('open');
    },
    close(){
      if(!this.root) return;
      this.root.classList.remove('open');
      if(this.img) this.img.removeAttribute('src');
    }
  };
  if(lb.overlay){ lb.overlay.addEventListener('click', () => lb.close()); }
  if(lb.closeBtn){ lb.closeBtn.addEventListener('click', () => lb.close()); }
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lb.root && lb.root.classList.contains('open')) lb.close();
  });

  if(!gridEl || !window.POSTERS) return;

  const INR_PRICES = { A4: 79, A3: 89 };
  const formatINR = (v) => `₹${Number(v).toFixed(0)}`;
  function ensureAuth(redirectTo){
    if(!window.VividaAuth || !window.VividaAuth.isLoggedIn()){
      location.href = `auth.html?redirect=${encodeURIComponent(redirectTo)}`;
      return false;
    }
    return true;
  }

  function render(){
    gridEl.innerHTML = '';
    window.POSTERS.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <img class='product-media' src='${p.src}' alt='${p.name}' />
        <div class='product-body'>
          <div class='product-title'>${p.name}</div>
          <div class='product-price'>${formatINR(INR_PRICES.A4)}</div>
          <div class='product-actions'>
            <select class='sizeSelect'>
              <option value='A4' selected>A4</option>
              <option value='A3'>A3</option>
            </select>
            <button class='btn ghost addCart'>Add to Cart</button>
            <button class='btn primary orderNow'>Order Now</button>
          </div>
        </div>
      `;
      const media = card.querySelector('.product-media');
      if(media){ media.addEventListener('click', () => lb.open(p.src, p.name)); }

      const sizeSelect = card.querySelector('.sizeSelect');
      const priceEl = card.querySelector('.product-price');
      function syncPrice(){ priceEl.textContent = formatINR(INR_PRICES[sizeSelect.value]); }
      sizeSelect.addEventListener('change', syncPrice);

      card.querySelector('.addCart').addEventListener('click', () => {
        if(!ensureAuth(location.pathname + location.search + '#products')) return;
        const size = sizeSelect.value;
        const price = INR_PRICES[size];
        window.VividaStorage.addToCart({ id: p.id, name: p.name, src: p.src, price, size, quantity: 1 });
        if(window.VividaHeader){ window.VividaHeader.renderCart(); }
      });
      card.querySelector('.orderNow').addEventListener('click', () => {
        const size = sizeSelect.value;
        const price = INR_PRICES[size];
        // Always set pending order before checking auth
        window.VividaStorage.setPendingOrder({ id: p.id, name: p.name, src: p.src, price, size, quantity: 1 });
        if(!ensureAuth('order.html')) return;
        location.href = 'order.html';
      });

      gridEl.appendChild(card);
    });
  }

  // If user is logged in and there is a pending order, redirect to order.html
  if (window.VividaAuth && window.VividaAuth.isLoggedIn && window.VividaAuth.isLoggedIn() && window.VividaStorage && window.VividaStorage.getPendingOrder && window.VividaStorage.getPendingOrder()) {
    location.href = 'order.html';
  }

  render();
})(); 