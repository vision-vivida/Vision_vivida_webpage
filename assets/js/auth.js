(function(){
  const USERS_KEY = 'VIVIDA_USERS_V1';
  const CURRENT_USER_KEY = 'VIVIDA_CURRENT_USER_V1';

  function read(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

  function getUsers(){ return read(USERS_KEY, []); }
  function saveUsers(users){ write(USERS_KEY, users); }

  function getCurrentUser(){ return read(CURRENT_USER_KEY, null); }
  function setCurrentUser(user){ write(CURRENT_USER_KEY, user); }
  function clearCurrentUser(){ localStorage.removeItem(CURRENT_USER_KEY); }

  function preservePendingOrderOnRedirect() {
    // If we are logging in from a redirect, keep the pending order in localStorage
    // No-op here, as localStorage persists across page loads
    // But if you want to sync between tabs or sessions, you could add logic here
  }

  const Auth = {
    signUp({ fullName, email, password }){
      email = String(email).trim().toLowerCase();
      const users = getUsers();
      if(users.find(u => u.email === email)){
        throw new Error('An account with this email already exists');
      }
      const user = { id: Math.random().toString(36).slice(2,10), fullName, email, password };
      users.push(user);
      saveUsers(users);
      setCurrentUser({ id: user.id, fullName: user.fullName, email: user.email });
      return user;
    },
    login({ email, password }){
      email = String(email).trim().toLowerCase();
      const users = getUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if(!found) throw new Error('Invalid email or password');
      setCurrentUser({ id: found.id, fullName: found.fullName, email: found.email });
      return found;
    },
    logout(){ clearCurrentUser(); },
    getCurrentUser,
    isLoggedIn(){ return !!getCurrentUser(); },
  };

  window.VividaAuth = Auth;
})(); 