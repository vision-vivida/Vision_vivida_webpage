(function(){
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('contactStatus');
  if(!form) return;

  // Configure these with your EmailJS public key and template details
  const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  if(window.emailjs){
    try{ window.emailjs.init(EMAILJS_PUBLIC_KEY); }catch(_){ /* no-op */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Sending...';

    const formData = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value
    };

    if(!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY'){
      statusEl.textContent = 'Demo mode: configure EmailJS keys in assets/js/contact.js to enable email sending.';
      return;
    }

    try{
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData);
      statusEl.textContent = 'Thanks! Your message has been sent.';
      form.reset();
    }catch(err){
      console.error(err);
      statusEl.textContent = 'Sorry, there was an error sending your message. Please try again later.';
    }
  });
})(); 