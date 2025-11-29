export const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      console.log('✅ Razorpay already loaded');
      resolve(window.Razorpay);
      return;
    }

    console.log('⏳ Waiting for Razorpay to load...');

    // Check every 100ms for max 50 times (5 seconds)
    let attempts = 0;
    const maxAttempts = 50;

    const checkInterval = setInterval(() => {
      attempts++;

      if (window.Razorpay) {
        clearInterval(checkInterval);
        console.log(`✅ Razorpay loaded after ${attempts * 100}ms`);
        resolve(window.Razorpay);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('❌ Razorpay SDK failed to load after 5 seconds');
        reject(new Error('Razorpay SDK timeout - script may be blocked'));
      }
    }, 100);

    // Fallback: Try loading dynamically if not already in DOM
    if (!document.querySelector('script[src*="checkout.razorpay"]')) {
      console.log('📝 Loading Razorpay script dynamically...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded from CDN');
        clearInterval(checkInterval);
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay from CDN');
        clearInterval(checkInterval);
        reject(new Error('Failed to load Razorpay script from CDN'));
      };
      document.head.appendChild(script);
    }
  });
};