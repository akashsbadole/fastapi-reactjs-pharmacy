import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  CreditCardIcon,
  ReceiptRefundIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import AddPayment from './AddPayment';
import '../../styles/print-invoice.css';

const InvoiceDetails = () => {
  const { id } = useParams();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoice, isLoading: invoiceLoading } = useQuery(
    ['invoice', id],
    () => api.get(endpoints.BILLING.INVOICE(id)).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const { data: patient } = useQuery(
    ['patient', invoice?.patient_id],
    () => invoice?.patient_id ? api.get(endpoints.PATIENTS.GET(invoice.patient_id)).then(res => res.data) : Promise.resolve(null),
    {
      enabled: !!invoice?.patient_id,
    }
  );

  const { data: payments } = useQuery(
    ['invoice-payments', id],
    () => api.get(endpoints.BILLING.PAYMENTS(id)).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const { data: prescriptions } = useQuery(
    ['invoice-prescriptions', id],
    () => api.get(`/api/billing/invoices/${id}/prescriptions`).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800';
      case 'REFUNDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'PARTIAL':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'REFUNDED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBalanceDue = () => {
    const total = invoice?.total_amount || 0;
    const paid = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    return total - paid;
  };

  const isOverdue = () => {
    if (!invoice || invoice.payment_status === 'PAID' || invoice.payment_status === 'CANCELLED') return false;
    // Note: Invoice model doesn't have a due_date field, using created_at + 30 days as a fallback
    const dueDate = new Date(invoice.created_at);
    dueDate.setDate(dueDate.getDate() + 30);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the invoice content
    const invoiceContent = document.getElementById('invoice-print-area');
    
    // Create the print HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              margin: 20px;
            }
            
            .invoice-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            
            .invoice-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .invoice-number {
              font-size: 14px;
              font-weight: bold;
            }
            
            .invoice-details {
              margin-bottom: 20px;
            }
            
            .invoice-details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            
            .invoice-items {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .invoice-items th,
            .invoice-items td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            
            .invoice-items th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .invoice-totals {
              text-align: right;
              margin-bottom: 20px;
            }
            
            .invoice-totals-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 5px;
            }
            
            .invoice-totals-label {
              width: 120px;
              padding-right: 10px;
              text-align: right;
            }
            
            .invoice-totals-value {
              width: 80px;
              text-align: right;
              font-weight: bold;
            }
            
            .invoice-footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            .bg-white {
              background-color: white;
            }
            
            .shadow {
              box-shadow: none;
            }
            
            .rounded-lg {
              border-radius: 0;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-title">PHARMACY INVOICE</div>
            <div class="invoice-number">Invoice #${invoice.invoice_number}</div>
            <div class="text-sm mt-2">Date: ${new Date(invoice.created_at).toLocaleDateString()}</div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-details-row">
              <span><strong>Bill To:</strong> ${patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}</span>
              <span><strong>Invoice Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</span>
            </div>
            <div class="invoice-details-row">
              <span><strong>Invoice Number:</strong> ${invoice.invoice_number}</span>
              <span><strong>Status:</strong> ${invoice.payment_status}</span>
            </div>
          </div>
          
          <div class="bg-white">
            <h3>Prescriptions</h3>
            <table class="invoice-items">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${prescriptions && prescriptions.length > 0 ? prescriptions.map(prescription => `
                  <tr>
                    <td>${prescription.prescription_id}</td>
                    <td>${new Date(prescription.created_at).toLocaleDateString()}</td>
                    <td>$${prescription.amount?.toFixed(2) || '0.00'}</td>
                  </tr>
                `).join('') : '<tr><td colspan="3">No prescriptions found for this invoice.</td></tr>'}
              </tbody>
            </table>
          </div>
          
          <div class="invoice-totals">
            <div class="invoice-totals-row">
              <div class="invoice-totals-label">Subtotal:</div>
              <div class="invoice-totals-value">$${invoice.subtotal?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="invoice-totals-row">
              <div class="invoice-totals-label">Tax:</div>
              <div class="invoice-totals-value">$${invoice.tax_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="invoice-totals-row">
              <div class="invoice-totals-label">Total:</div>
              <div class="invoice-totals-value">$${invoice.total_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="invoice-totals-row">
              <div class="invoice-totals-label">Paid:</div>
              <div class="invoice-totals-value">$${invoice.paid_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div class="invoice-totals-row">
              <div class="invoice-totals-label">Balance:</div>
              <div class="invoice-totals-value">$${getBalanceDue().toFixed(2)}</div>
            </div>
          </div>
          
          <div class="invoice-footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for the content to load, then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };
  };

  const handlePaymentSuccess = () => {
    setShowAddPayment(false);
    queryClient.invalidateQueries(['invoice-payments', id]);
    queryClient.invalidateQueries(['invoice', id]);
  };

  const handleRefund = async () => {
    try {
      await api.post(endpoints.BILLING.REFUND(id), {
        amount: invoice.total_amount,
        reason: "Customer refund"
      });
      queryClient.invalidateQueries(['invoice', id]);
      setShowRefundModal(false);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  if (invoiceLoading) {
    return <Loader text="Loading invoice details..." />;
  }

  if (!invoice) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 print-invoice" id="invoice-print-area">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoice Not Found</h1>
          <p className="mt-1 text-sm text-gray-600">
            The invoice you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 no-print">
        <div className="flex items-center">
          <Link
            to="/billing"
            className="flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Billing
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Invoice Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage invoice information.
        </p>
      </div>

      {/* Print Header */}
      <div className="invoice-header hidden print:block">
        <div className="invoice-title">PHARMACY INVOICE</div>
        <div className="invoice-number">Invoice #{invoice.invoice_number}</div>
        <div className="text-sm mt-2">Date: {new Date(invoice.created_at).toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-6 no-print">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {invoice.invoice_number}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created on {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Print Invoice Details */}
              <div className="invoice-details hidden print:block mb-6">
                <div className="invoice-details-row">
                  <span><strong>Bill To:</strong> {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}</span>
                  <span><strong>Invoice Date:</strong> {new Date(invoice.created_at).toLocaleDateString()}</span>
                </div>
                <div className="invoice-details-row">
                  <span><strong>Invoice Number:</strong> {invoice.invoice_number}</span>
                  <span><strong>Status:</strong> {invoice.payment_status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Patient
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${invoice.total_amount?.toFixed(2) || '0.00'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Balance Due
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    ${getBalanceDue().toFixed(2)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    {getStatusIcon(invoice.payment_status)}
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.payment_status)}`}>
                      {invoice.payment_status}
                      {isOverdue() && <span className="ml-1 text-red-500">(Overdue)</span>}
                    </span>
                  </dd>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {invoice.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Prescriptions */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 no-print">
                Prescriptions
              </h3>
              {prescriptions && prescriptions.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 invoice-items">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Prescription ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {prescription.prescription_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(prescription.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${prescription.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                            <Link
                              to={`/prescriptions/${prescription.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No prescriptions found for this invoice.</p>
              )}
            </div>
          </div>

          {/* Invoice Totals for Print */}
          <div className="invoice-totals print-only" style={{ display: 'none' }}>
            <div className="invoice-totals-row">
              <div className="invoice-totals-label">Subtotal:</div>
              <div className="invoice-totals-value">${invoice.subtotal?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="invoice-totals-row">
              <div className="invoice-totals-label">Tax:</div>
              <div className="invoice-totals-value">${invoice.tax_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="invoice-totals-row">
              <div className="invoice-totals-label">Total:</div>
              <div className="invoice-totals-value">${invoice.total_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="invoice-totals-row">
              <div className="invoice-totals-label">Paid:</div>
              <div className="invoice-totals-value">${invoice.paid_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="invoice-totals-row">
              <div className="invoice-totals-label">Balance:</div>
              <div className="invoice-totals-value">${getBalanceDue().toFixed(2)}</div>
            </div>
          </div>

          {/* Invoice Footer for Print */}
          <div className="invoice-footer print-only" style={{ display: 'none' }}>
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>

        {/* Invoice Actions and Payments */}
        <div className="no-print">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {invoice.payment_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setShowAddPayment(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add Payment
                    </button>
                  </>
                )}
                {invoice.payment_status === 'PAID' && (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ReceiptRefundIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Issue Refund
                  </button>
                )}
                <Link
                  to={`/patients/${invoice.patient_id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Patient
                </Link>
                <button
                  onClick={handlePrintInvoice}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PrinterIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Payments
              </h3>
              {payments && payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.payment_mode}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${payment.amount?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Transaction ID: {payment.transaction_id || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No payments recorded for this invoice.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add Payment</h3>
                <button
                  onClick={() => setShowAddPayment(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddPayment
                invoiceId={id}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowAddPayment(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Issue Refund</h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to issue a refund for invoice {invoice.invoice_number}?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Refund amount: <span className="font-semibold">${invoice.total_amount?.toFixed(2) || '0.00'}</span>
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Reason
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter reason for refund"
                    id="refundReason"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason = document.getElementById('refundReason').value;
                    if (reason) {
                      api.post(endpoints.BILLING.REFUND(id), {
                        amount: invoice.total_amount,
                        reason: reason
                      }).then(() => {
                        queryClient.invalidateQueries(['invoice', id]);
                        setShowRefundModal(false);
                      }).catch(error => {
                        console.error('Error processing refund:', error);
                      });
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;