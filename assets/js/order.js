(function(){
  const host = document.getElementById('selectedProduct');
  const form = document.getElementById('orderForm');
  if(!host || !form) return;

  // Enforce auth
  if(!window.VividaAuth || !window.VividaAuth.isLoggedIn()){
    location.href = 'auth.html?redirect=order.html';
    return;
  }
  const currentUser = window.VividaAuth.getCurrentUser();

  const INR_PRICES = { A4: 79, A3: 89 };
  const formatINR = (v) => `₹${Number(v).toFixed(0)}`;

  const pending = window.VividaStorage.getPendingOrder();
  const cart = window.VividaStorage.getCart();
  const orderItem = pending ?? (cart.length ? { ...cart[0] } : null);

  // Try to recover pending order if user just logged in and came from redirect
  let recovered = false;
  if (!orderItem && document.referrer && document.referrer.includes('auth.html')) {
    // Try to recover from cart if available
    if (cart.length) {
      recovered = true;
    }
    // Optionally, you could store the last attempted product in localStorage for more robust recovery
  }

  const sizeSelect = document.getElementById('size');
  if(orderItem && orderItem.size && sizeSelect){
    sizeSelect.value = orderItem.size;
  }

  const upiWrap = document.getElementById('upiQRWrap');
  const upiQR = document.getElementById('upiQR');
  const upiNote = document.getElementById('upiNote');

  function getTotal(){
    const size = sizeSelect ? sizeSelect.value : (orderItem?.size || 'A4');
    const quantity = Number((document.getElementById('quantity')?.value) || 1);
    const price = INR_PRICES[size] || INR_PRICES.A4;
    return { size, quantity, unitPrice: price, total: price * quantity };
  }

  function refreshSummary(){
    if(!orderItem){
      host.innerHTML = `<p>No product selected. Please go back and choose a poster.</p>`;
      return;
    }
    const { size, unitPrice } = getTotal();
    host.innerHTML = `
      <img src="${orderItem.src}" alt="${orderItem.name}" />
      <div>
        <strong>${orderItem.name}</strong>
        <div>${formatINR(unitPrice)} • ${size}</div>
      </div>
    `;
    maybeRenderUPI();
  }

  function buildUpiUrl({ vpa, name, amount, note }){
    const params = new URLSearchParams({ pa: vpa, pn: name, am: String(amount), cu: 'INR' });
    if(note) params.set('tn', note);
    return `upi://pay?${params.toString()}`;
  }

  async function renderQR(amount){
    if(!window.VIVIDA_CONFIG || !window.VIVIDA_CONFIG.UPI) return;
    const { vpa, payeeName } = window.VIVIDA_CONFIG.UPI;
    const url = buildUpiUrl({ vpa, name: payeeName, amount, note: 'Vivida poster order' });
    upiQR.innerHTML = '';
    if(window.QRCode){
      await window.QRCode.toCanvas(url, { errorCorrectionLevel: 'M' }).then((canvas) => {
        upiQR.appendChild(canvas);
      }).catch(() => {
        const a = document.createElement('a');
        a.href = url; a.textContent = 'Open UPI app'; a.className = 'btn primary';
        upiQR.appendChild(a);
      });
    }else{
      const a = document.createElement('a');
      a.href = url; a.textContent = 'Open UPI app'; a.className = 'btn primary';
      upiQR.appendChild(a);
    }
    upiNote.textContent = `Scan and pay ${formatINR(amount)} to ${payeeName} (${vpa}).`;
  }

  function maybeRenderUPI(){
    const payUPI = (document.querySelector('input[name="payment"][value="UPI"]')?.checked) || false;
    if(payUPI){
      const { total } = getTotal();
      upiWrap?.classList.remove('hidden');
      renderQR(total);
    } else {
      upiWrap?.classList.add('hidden');
      upiQR.innerHTML = '';
      upiNote.textContent = '';
    }
  }

  sizeSelect?.addEventListener('change', refreshSummary);
  document.getElementById('quantity')?.addEventListener('input', refreshSummary);
  document.querySelectorAll('input[name="payment"]').forEach((el) => el.addEventListener('change', maybeRenderUPI));

  refreshSummary();

  if(!orderItem && !recovered){
    host.innerHTML = '';
    document.getElementById('noProductError').style.display = 'block';
    document.getElementById('noProductError').innerHTML = `No product selected. <a href='index.html#products' class='btn primary'>Go to Products</a>`;
    form.style.display = 'none';
    return;
  } else {
    document.getElementById('noProductError').style.display = 'none';
    form.style.display = '';
  }

  // Pre-fill form with user info if available
  if(currentUser){
    if(form.fullName) form.fullName.value = currentUser.fullName || '';
    if(form.email) form.email.value = currentUser.email || '';
  }

  function addDays(dateMs, days){
    const d = new Date(dateMs);
    d.setDate(d.getDate() + days);
    return d.getTime();
  }

  async function exportToGoogleSheets(order){
    const url = window.VIVIDA_CONFIG?.SHEETS_WEBHOOK_URL;
    if(!url || url === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') return { ok: false, skipped: true };
    try{
      const res = await fetch(url, {
        method: 'POST',
        // Use text/plain to avoid CORS preflight. Apps Script still parses JSON from e.postData.contents.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(order)
      });
      return { ok: res.ok };
    }catch(err){
      console.error('Sheets export failed', err);
      return { ok: false, error: err };
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!orderItem){ return; }

    const data = new FormData(form);
    const size = data.get('size');
    const unitPrice = INR_PRICES[size] || INR_PRICES.A4;
    const quantity = Number(data.get('quantity') || 1);

    const createdAt = Date.now();
    const expectedDeliveryAt = addDays(createdAt, 10);

    const payload = {
      orderId: Math.random().toString(36).slice(2,8).toUpperCase(),
      createdAt,
      expectedDeliveryAt,
      status: 'Received',
      customer: {
        fullName: data.get('fullName'),
        email: data.get('email') || currentUser.email,
        phone: data.get('phone'),
        address: data.get('address')
      },
      userEmail: currentUser.email,
      size,
      payment: data.get('payment'),
      quantity,
      item: { ...orderItem, size, price: unitPrice },
      totalINR: unitPrice * quantity
    };

    window.VividaStorage.addOrder(payload);
    window.VividaStorage.clearPendingOrder();

    // Remove ordered item(s) from cart
    const existingCart = window.VividaStorage.getCart();
    const filtered = existingCart.filter(c => !(c.id === orderItem.id && (c.size || 'A4') === size));
    window.VividaStorage.saveCart(filtered);

    // Export to Google Sheets (Apps Script web app)
    exportToGoogleSheets(payload);

    const statusEl = document.getElementById('orderStatus');
    const eta = new Date(expectedDeliveryAt).toLocaleDateString();
    statusEl.textContent = `Thank you! Your order #${payload.orderId} has been placed. Expected delivery: ${eta}.`;

    // Ensure UPI QR updates if needed
    maybeRenderUPI();
  });
})(); 