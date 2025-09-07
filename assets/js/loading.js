(function(){
  const loadingPage = document.querySelector('.loading-page');
  if(!loadingPage) return;
  document.body.classList.add('loading');
  const MIN_LOADING_TIME = 3250; // milliseconds
  const start = Date.now();
  function hideLoading() {
    const elapsed = Date.now() - start;
    const delay = Math.max(0, MIN_LOADING_TIME - elapsed);
    setTimeout(() => {
      loadingPage.classList.add('hide');
      setTimeout(() => {
        loadingPage.style.display = 'none';
        document.body.classList.remove('loading');
      }, 400);
    }, delay);
  }
  if(document.readyState === 'complete' || document.readyState === 'interactive') {
    hideLoading();
  } else {
    window.addEventListener('DOMContentLoaded', hideLoading);
  }
})();