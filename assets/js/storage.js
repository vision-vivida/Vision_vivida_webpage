(function(){
  const CART_KEY = 'VIVIDA_CART_V1';
  const ORDERS_KEY = 'VIVIDA_ORDERS_V1';
  const PENDING_ORDER_KEY = 'VIVIDA_PENDING_ORDER_V1';

  function read(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; }
  }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  const Storage = {
    getCart(){ return read(CART_KEY, []); },
    saveCart(cart){ write(CART_KEY, cart); },
    addToCart(item){ const c = read(CART_KEY, []); c.push(item); write(CART_KEY, c); return c; },
    removeFromCart(index){ const c = read(CART_KEY, []); c.splice(index,1); write(CART_KEY, c); return c; },
    clearCart(){ write(CART_KEY, []); },

    getOrders(){ return read(ORDERS_KEY, []); },
    saveOrders(orders){ write(ORDERS_KEY, orders); },
    addOrder(order){ const o = read(ORDERS_KEY, []); o.unshift(order); write(ORDERS_KEY, o); return o; },

    setPendingOrder(order){ write(PENDING_ORDER_KEY, order); },
    getPendingOrder(){ return read(PENDING_ORDER_KEY, null); },
    clearPendingOrder(){ localStorage.removeItem(PENDING_ORDER_KEY); }
  };

  window.VividaStorage = Storage;
})(); 