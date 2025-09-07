(function(){
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const cartButton = document.getElementById('cartButton');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCart = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const recentOrdersEl = document.getElementById('recentOrders');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const recentOrdersSection = document.querySelector('.cart-section.orders');

  if(navToggle){
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('open');
    });
  }

  function openCart(){ cartDrawer.classList.add('open'); }
  function closeCartDrawer(){ cartDrawer.classList.remove('open'); }
  if(cartButton){ cartButton.addEventListener('click', openCart); }
  if(closeCart){ closeCart.addEventListener('click', closeCartDrawer); }
  if(cartOverlay){ cartOverlay.addEventListener('click', closeCartDrawer); }

  function formatCurrencyINR(value){ return `₹${Number(value).toFixed(0)}`; }

  function renderCart(){
    const cart = window.VividaStorage.getCart();
    cartCountEl.textContent = String(cart.length);
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
      total += Number(item.price) * (item.quantity ?? 1);
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.src}" alt="${item.name}" />
        <div class="meta">
          <strong>${item.name}</strong>
          <span class="price">${formatCurrencyINR(item.price)} × ${item.quantity ?? 1} • ${item.size ?? 'A4'}</span>
        </div>
        <button class="icon-button" aria-label="Remove" data-index="${index}">✕</button>
      `;
      li.querySelector('button').addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-index'));
        window.VividaStorage.removeFromCart(idx);
        renderCart();
      });
      cartItemsEl.appendChild(li);
    });
    cartTotalEl.textContent = formatCurrencyINR(total);
  }

  function renderOrders(){
    const currentUser = window.VividaAuth?.getCurrentUser?.() || null;
    if(!currentUser){
      if(recentOrdersSection){ recentOrdersSection.classList.add('hidden'); }
      return;
    }
    if(recentOrdersSection){ recentOrdersSection.classList.remove('hidden'); }

    const ordersAll = window.VividaStorage.getOrders();
    const orders = ordersAll.filter(o => (o.customer?.email || o.userEmail) === currentUser.email);
    recentOrdersEl.innerHTML = '';
    orders.slice(0,5).forEach((order) => {
      const li = document.createElement('li');
      li.className = 'order-item';
      li.innerHTML = `
        <span>#${order.orderId} • ${new Date(order.createdAt).toLocaleDateString()} • ${order.item?.name ?? 'Poster'} (${order.size ?? order.item?.size ?? 'A4'})</span>
        <span class="status">${order.status ?? 'Received'}</span>
      `;
      recentOrdersEl.appendChild(li);
    });
  }

  if(clearCartBtn){
    clearCartBtn.addEventListener('click', () => {
      window.VividaStorage.clearCart();
      renderCart();
    });
  }

  if(window.VividaStorage){
    renderCart();
    renderOrders();
  }

  window.VividaHeader = { renderCart };
})(); 