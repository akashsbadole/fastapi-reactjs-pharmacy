import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AddPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [invoice, setInvoice] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/billing/${id}`);
        setInvoice(response.data);
        setRemainingBalance(response.data.total_amount - response.data.paid_amount);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        toast.error('Failed to fetch invoice details');
        navigate('/billing');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/billing/${id}/payments`, {
        amount: parseFloat(data.amount),
        payment_mode: data.payment_mode,
        transaction_id: data.transaction_id || null,
        notes: data.notes || null
      });
      
      toast.success('Payment added successfully');
      navigate(`/billing/invoices/${id}`);
    } catch (error) {
      console.error('Error adding payment:', error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to add payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Invoice not found</h2>
        <button 
          onClick={() => navigate('/billing')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Billing
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add Payment</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`/billing/invoices/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Invoice
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Invoice #{invoice.invoice_number}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-medium">{invoice.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold">${invoice.total_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="font-semibold">${invoice.paid_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="font-semibold text-red-600">${remainingBalance.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.payment_status === 'partial' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.payment_status === 'paid' ? 'Paid' : 
                 invoice.payment_status === 'partial' ? 'Partially Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Payment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={remainingBalance}
                    {...register('amount', { 
                      required: 'Payment amount is required',
                      min: 0.01,
                      max: {
                        value: remainingBalance,
                        message: 'Payment amount cannot exceed remaining balance'
                      }
                    })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Maximum amount: ${remainingBalance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  {...register('payment_mode', { required: 'Payment mode is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
                {errors.payment_mode && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_mode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  {...register('transaction_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes about the payment"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/billing/invoices/${id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || remainingBalance <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;