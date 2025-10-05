import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { loadScript } from '../../utils/paymentUtils';

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pricingRef = useRef(null);

  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹999',
      frequency: '/month',
      description: 'Perfect for small pharmacies',
      features: [
        'Up to 3 users',
        'Basic inventory management',
        'POS functionality',
        'Email support',
        'Basic reports',
      ],
      cta: 'Start Free Trial',
      mostPopular: false,
    },
    {
      name: 'Professional',
      price: '₹1,999',
      frequency: '/month',
      description: 'Ideal for growing pharmacies',
      features: [
        'Up to 10 users',
        'Advanced inventory management',
        'POS with barcode scanning',
        'Priority email & phone support',
        'Advanced reports & analytics',
        'Prescription management',
        'Supplier management',
      ],
      cta: 'Start Free Trial',
      mostPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      frequency: '',
      description: 'For large pharmacy chains',
      features: [
        'Unlimited users',
        'Complete feature set',
        'Custom integrations',
        'Dedicated support manager',
        'Custom reports',
        'API access',
        'On-premise deployment option',
      ],
      cta: 'Contact Sales',
      mostPopular: false,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (pricingRef.current && scrollPosition > pricingRef.current.offsetTop + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePayment = async (plan, paymentMethod) => {
    setIsProcessing(true);
    setSelectedPlan(plan);

    try {
      if (paymentMethod === 'razorpay') {
        // Load Razorpay script
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
          alert('Razorpay SDK failed to load. Are you online?');
          return;
        }

        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay key
          amount: plan.price === 'Custom' ? 0 : plan.price.replace('₹', '') * 100,
          currency: 'INR',
          name: 'Pharmacy Management System',
          description: `Subscription for ${plan.name} Plan`,
          image: 'https://example.com/your-logo.png',
          handler: function (response) {
            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            // Here you would typically verify the payment on your backend
            // and then redirect to a success page or dashboard
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999',
          },
          notes: {
            address: 'Pharmacy Management System',
          },
          theme: {
            color: '#3399cc',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else if (paymentMethod === 'paypal') {
        // Load PayPal script
        const res = await loadScript('https://www.paypal.com/sdk/js?client-id=sb&currency=USD');

        if (!res) {
          alert('PayPal SDK failed to load. Are you online?');
          return;
        }

        window.paypal.Buttons({
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: plan.price === 'Custom' ? '0.01' : (plan.price.replace('₹', '') / 75).toFixed(2), // Convert INR to USD roughly
                },
              }],
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              alert(`Transaction completed by ${details.payer.name.given_name}!`);
              // Here you would typically verify the payment on your backend
              // and then redirect to a success page or dashboard
            });
          },
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div ref={pricingRef} className={`bg-gradient-to-br from-gray-50 to-blue-50 py-24 sm:py-32 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mx-auto max-w-4xl text-center transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-600">
            Choose the right plan for your pharmacy
          </p>
        </div>
        <p className={`mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 transition-all duration-700 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Choose an affordable plan that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
        </p>
        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 transition-all duration-700 transform hover:scale-105 hover:shadow-xl ${
                plan.mostPopular ? 'ring-2 ring-indigo-600 shadow-lg' : ''
              } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{transitionDelay: `${index * 200 + 700}ms`}}
            >
              <div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">{plan.frequency}</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={feature} className={`flex gap-x-3 transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-5 opacity-0'}`} style={{transitionDelay: `${index * 200 + featureIndex * 100 + 900}ms`}}>
                      <CheckBadgeIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                {plan.name === 'Enterprise' ? (
                  <Link
                    to="/contact"
                    className="block w-full rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform hover:scale-105"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => handlePayment(plan, 'razorpay')}
                      disabled={isProcessing && selectedPlan?.name === plan.name}
                      className="mb-2 w-full rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
                    >
                      {isProcessing && selectedPlan?.name === plan.name ? 'Processing...' : `Pay with Razorpay - ${plan.price}`}
                    </button>
                    <button
                      onClick={() => handlePayment(plan, 'paypal')}
                      disabled={isProcessing && selectedPlan?.name === plan.name}
                      className="w-full rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:from-yellow-500 hover:to-yellow-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
                    >
                      {isProcessing && selectedPlan?.name === plan.name ? 'Processing...' : `Pay with PayPal - ${plan.price}`}
                    </button>
                    <div id="paypal-button-container" className="mt-2"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;