import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api, { endpoints } from '../../services/api';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.BILLING.INVOICE(id));
        setInvoice(response.data);
        
        // Set form values
        setValue('payment_status', response.data.payment_status);
        setValue('payment_mode', response.data.payment_mode);
        setValue('notes', response.data.notes);
        
        // Fetch payments for this invoice
        const paymentsResponse = await api.get(endpoints.BILLING.PAYMENTS(id));
        setPayments(paymentsResponse.data);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        toast.error('Failed to fetch invoice details');
        navigate('/billing');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id, setValue, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.put(endpoints.BILLING.INVOICE(id), data);
      toast.success('Invoice updated successfully');
      navigate(`/billing/invoices/${id}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to update invoice');
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

  const calculateRemainingBalance = () => {
    return invoice.total_amount - invoice.paid_amount;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      'partial': { text: 'Partially Paid', color: 'bg-blue-100 text-blue-800' },
      'paid': { text: 'Paid', color: 'bg-green-100 text-green-800' },
      'refunded': { text: 'Refunded', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Invoice</h1>
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Invoice #{invoice.invoice_number}</h2>
                <p className="text-gray-600">Created: {new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(invoice.payment_status)}
                <p className="text-gray-600 mt-1">Remaining: ${calculateRemainingBalance().toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                <p className="text-gray-700">{invoice.patient_name}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                <p className="text-gray-700">Mode: {invoice.payment_mode}</p>
                <p className="text-gray-700">Paid: ${invoice.paid_amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.medicine_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.batch_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unit_price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-lg font-semibold">${invoice.subtotal.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Tax</p>
                <p className="text-lg font-semibold">${invoice.tax_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-semibold">${invoice.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Update Invoice</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    {...register('payment_status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    {...register('payment_mode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/billing')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payments</h2>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments recorded for this invoice</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.payment_mode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.transaction_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/billing/invoices/${id}/payments`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;