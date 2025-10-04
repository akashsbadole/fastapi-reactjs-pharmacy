import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const Subscription = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    method_type: 'CREDIT_CARD',
    last_four: '',
    expiry_month: '',
    expiry_year: '',
    cardholder_name: '',
    is_default: true,
  });
  
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery(
    'currentSubscription',
    async () => {
      const response = await api.get('/api/subscription/subscriptions/current');
      return response.data;
    },
    {
      retry: false,
      onError: () => {
        // User might not have a subscription, which is fine
      }
    }
  );

  // Fetch usage data
  const { data: usage, isLoading: usageLoading } = useQuery(
    'usageData',
    async () => {
      const response = await api.get('/api/subscription/usage');
      return response.data;
    }
  );

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery(
    'subscriptionPlans',
    async () => {
      const response = await api.get('/api/subscription/plans');
      return response.data;
    }
  );

  // Fetch payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery(
    'paymentMethods',
    async () => {
      const response = await api.get('/api/subscription/payment-methods');
      return response.data;
    }
  );

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery(
    'invoices',
    async () => {
      const response = await api.get('/api/subscription/invoices');
      return response.data;
    }
  );

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation(
    (paymentMethodData) => api.post('/api/subscription/payment-methods', paymentMethodData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        setShowPaymentModal(false);
        setNewPaymentMethod({
          method_type: 'CREDIT_CARD',
          last_four: '',
          expiry_month: '',
          expiry_year: '',
          cardholder_name: '',
          is_default: true,
        });
        toast.success('Payment method added successfully');
      },
      onError: (error) => {
        toast.error(`Error adding payment method: ${error.response?.data?.detail || error.message}`);
      },
    }
  );

  const handleAddPaymentMethod = () => {
    addPaymentMethodMutation.mutate({
      ...newPaymentMethod,
      user_id: currentUser.id,
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    // Convert from cents to dollars
    return (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      ACTIVE: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUsagePercentage = (current, max) => {
    return Math.min(100, Math.round((current / max) * 100));
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your subscription plan, payment methods, and view billing history</p>
      </div>

      {/* Subscription Overview */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Subscription</h2>
            {subscriptionLoading ? (
              <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
            ) : subscription ? (
              <div>
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {subscription.plan_billing_cycle} billing
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{subscription.plan_name}</h3>
                <p className="text-gray-600">{subscription.plan_description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  <span>
                    Renews on {formatDate(subscription.end_date)} | {formatCurrency(subscription.plan_price)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  Subscribe Now
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => queryClient.invalidateQueries('currentSubscription')}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Usage Statistics */}
        {usage && !usageLoading && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Users</span>
                  <span className="text-sm text-gray-500">
                    {usage.current_users} of {usage.max_users}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.current_users, usage.max_users))}`}
                    style={{ width: `${getUsagePercentage(usage.current_users, usage.max_users)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Pharmacies</span>
                  <span className="text-sm text-gray-500">
                    {usage.current_pharmacies} of {usage.max_pharmacies}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.current_pharmacies, usage.max_pharmacies))}`}
                    style={{ width: `${getUsagePercentage(usage.current_pharmacies, usage.max_pharmacies)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                  <span className="text-sm text-gray-500">
                    {usage.storage_used_mb.toFixed(1)} MB of {(usage.storage_limit_mb / 1024).toFixed(1)} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.storage_used_mb, usage.storage_limit_mb))}`}
                    style={{ width: `${getUsagePercentage(usage.storage_used_mb, usage.storage_limit_mb)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Plans & Features
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payment'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Billing History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Plans & Features Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Plans</h2>
            
            {plansLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`border rounded-lg p-6 ${
                      subscription && subscription.plan_id === plan.id 
                        ? 'border-primary-500 ring-2 ring-primary-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    {subscription && subscription.plan_id === plan.id && (
                      <div className="flex justify-center mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          Current Plan
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{plan.name}</h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-500">/{plan.billing_cycle.toLowerCase()}</span>
                    </div>
                    <p className="text-gray-600 text-center mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                        subscription && subscription.plan_id === plan.id
                          ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                      disabled={subscription && subscription.plan_id === plan.id}
                    >
                      {subscription && subscription.plan_id === plan.id ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subscription plans available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for available plans.</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Payment Method
              </button>
            </div>
            
            {paymentMethodsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.method_type.replace('_', ' ').title()}
                          {method.is_default && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.cardholder_name} •••• {method.last_four}
                          {method.expiry_month && method.expiry_year && (
                            <span> • Expires {method.expiry_month}/{method.expiry_year}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.is_default && (
                        <button className="text-sm text-primary-600 hover:text-primary-800">
                          Make Default
                        </button>
                      )}
                      <button className="text-sm text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
                <p className="mt-1 text-sm text-gray-500">Add a payment method to manage your subscription.</p>
              </div>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'billing' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
            
            {invoicesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            View
                          </button>
                          {invoice.status === 'PENDING' && (
                            <button className="text-green-600 hover:text-green-900">
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't been billed yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                <select
                  value={newPaymentMethod.method_type}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, method_type: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={newPaymentMethod.cardholder_name}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cardholder_name: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newPaymentMethod.expiry_month}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiry_month: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="MM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                  <input
                    type="number"
                    min={new Date().getFullYear()}
                    value={newPaymentMethod.expiry_year}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiry_year: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="YYYY"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={newPaymentMethod.last_four}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, last_four: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="•••• •••• •••• 1234"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="is_default"
                  type="checkbox"
                  checked={newPaymentMethod.is_default}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, is_default: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                  Set as default payment method
                </label>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                disabled={addPaymentMethodMutation.isLoading || !newPaymentMethod.cardholder_name || !newPaymentMethod.last_four}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {addPaymentMethodMutation.isLoading ? 'Adding...' : 'Add Payment Method'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;