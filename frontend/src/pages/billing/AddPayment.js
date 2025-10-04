import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api, { endpoints } from '../../services/api';

const AddPayment = ({ invoiceId, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [invoice, setInvoice] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.BILLING.INVOICE(invoiceId));
        setInvoice(response.data);
        setRemainingBalance(response.data.total_amount - response.data.paid_amount);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        toast.error('Failed to fetch invoice details');
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, onCancel]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post(endpoints.BILLING.PAYMENTS(invoiceId), {
        invoice_id: parseInt(invoiceId),
        amount: parseFloat(data.amount),
        payment_mode: data.payment_mode,
        transaction_id: data.transaction_id || null,
        notes: data.notes || null
      });
      
      toast.success('Payment added successfully');
      onSuccess();
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
      <div className="flex justify-center items-center h-32">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-4">
        <h2 className="text-lg font-semibold text-red-600">Invoice not found</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">Invoice #{invoice.invoice_number}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Total Amount</p>
            <p className="font-semibold">${invoice.total_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Paid Amount</p>
            <p className="font-semibold">${invoice.paid_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Remaining Balance</p>
            <p className="font-semibold text-red-600">${remainingBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

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
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="INSURANCE">Insurance</option>
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

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
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
  );
};

export default AddPayment;