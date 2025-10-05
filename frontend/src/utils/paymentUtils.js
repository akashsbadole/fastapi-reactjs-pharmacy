export const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (options) => {
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};

export const displayPayPal = async (containerId, createOrderCallback, onApproveCallback) => {
  const res = await loadScript('https://www.paypal.com/sdk/js?client-id=sb&currency=USD');

  if (!res) {
    alert('PayPal SDK failed to load. Are you online?');
    return;
  }

  window.paypal.Buttons({
    createOrder: createOrderCallback,
    onApprove: onApproveCallback,
  }).render(containerId);
};