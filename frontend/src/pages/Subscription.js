import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, endpoints } from '../services/api';
import { loadScript } from '../utils/paymentUtils';
import toast from 'react-hot-toast';
import {
  CheckBadgeIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Subscription = () => {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch user's current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery(
    'user-subscription',
    () => api.get(endpoints.PAYMENTS.SUBSCRIPTION).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch available plans
  const { data: plansData, isLoading: plansLoading } = useQuery(
    'subscription-plans',
    () => api.get(endpoints.PAYMENTS.PLANS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation(
    () => api.post(endpoints.PAYMENTS.CANCEL),
    {
      onSuccess: () => {
        toast.success('Subscription cancelled successfully');
        queryClient.invalidateQueries('user-subscription');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
      },
    }
  );

  const handlePayment = async (plan, paymentMethod) => {
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const orderResponse = await api.post(endpoints.PAYMENTS.RAZORPAY_CREATE_ORDER, {
          plan_id: plan.id
        });
        
        const orderData = orderResponse.data;
        
        // Load Razorpay script
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          return;
        }

        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay key
          amount: orderData.amount,
          currency: orderData.currency,
          name: orderData.name,
          description: orderData.description,
          order_id: orderData.order_id,
          handler: async function (response) {
            // Verify payment with backend
            try {
              await api.post(endpoints.PAYMENTS.RAZORPAY_VERIFY, {
                plan_id: plan.id,
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature
              });
              
              toast.success('Payment successful! Subscription activated.');
              queryClient.invalidateQueries('user-subscription');
              setShowPaymentModal(false);
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999',
          },
          theme: {
            color: '#3399cc',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else if (paymentMethod === 'paypal') {
        // Create PayPal order
        const orderResponse = await api.post(endpoints.PAYMENTS.PAYPAL_CREATE_ORDER, {
          plan_id: plan.id
        });
        
        const orderData = orderResponse.data;
        
        // Load PayPal script
        const res = await loadScript('https://www.paypal.com/sdk/js?client-id=sb&currency=USD');

        if (!res) {
          toast.error('PayPal SDK failed to load. Are you online?');
          return;
        }

        window.paypal.Buttons({
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: orderData.amount,
                },
              }],
            });
          },
          onApprove: async function (data, actions) {
            const order = await actions.order.capture();
            
            // Verify payment with backend
            try {
              await api.post(endpoints.PAYMENTS.PAYPAL_VERIFY, {
                plan_id: plan.id,
                payment_id: order.id,
                order_id: orderData.order_id,
                payer_id: order.payer.payer_id
              });
              
              toast.success('Payment successful! Subscription activated.');
              queryClient.invalidateQueries('user-subscription');
              setShowPaymentModal(false);
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const openPaymentModal = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentSubscription = subscriptionData?.subscription;
  const plans = plansData || [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Subscription</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-lg font-semibold text-gray-900">{currentSubscription.plan.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg font-semibold text-green-600">{currentSubscription.status}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Renewal Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(currentSubscription.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Plan Features</h4>
              <ul className="list-disc list-inside space-y-1">
                {Array.isArray(currentSubscription.plan.features) 
                  ? currentSubscription.plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600">{feature}</li>
                    ))
                  : JSON.parse(currentSubscription.plan.features || '[]').map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600">{feature}</li>
                    ))
                }
              </ul>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {cancelSubscriptionMutation.isLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {currentSubscription ? 'Available Plans for Upgrade' : 'Choose a Subscription Plan'}
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${
                  currentSubscription?.plan.id === plan.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  {currentSubscription?.plan.id === plan.id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{plan.price}
                    <span className="text-sm font-medium text-gray-500">/{plan.billing_cycle}</span>
                  </p>
                </div>
                
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                  <ul className="space-y-2">
                    {Array.isArray(plan.features) 
                      ? plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))
                      : JSON.parse(plan.features || '[]').map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))
                    }
                  </ul>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => openPaymentModal(plan)}
                    disabled={currentSubscription?.plan.id === plan.id || isProcessing}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      currentSubscription?.plan.id === plan.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    } disabled:opacity-50`}
                  >
                    {currentSubscription?.plan.id === plan.id
                      ? 'Current Plan'
                      : isProcessing
                      ? 'Processing...'
                      : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Subscribe to {selectedPlan.name}
              </h3>
              <button
                onClick={closePaymentModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                You're about to subscribe to the {selectedPlan.name} plan at ₹{selectedPlan.price}/{selectedPlan.billing_cycle}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePayment(selectedPlan, 'razorpay')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Pay with Razorpay
              </button>
              
              <button
                onClick={() => handlePayment(selectedPlan, 'paypal')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Pay with PayPal
              </button>
            </div>
            
            <div id="paypal-button-container" className="mt-4"></div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your payment information is secure and encrypted. You can cancel your subscription at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;