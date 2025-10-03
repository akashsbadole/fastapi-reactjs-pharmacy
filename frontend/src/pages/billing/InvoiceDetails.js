import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
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
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const InvoiceDetails = () => {
  const { id } = useParams();
  const [showAddPayment, setShowAddPayment] = useState(false);

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
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
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
    if (!invoice || invoice.status === 'paid' || invoice.status === 'cancelled') return false;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (invoiceLoading) {
    return <Loader text="Loading invoice details..." />;
  }

  if (!invoice) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
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
      <div className="mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {invoice.invoice_id}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created on {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Patient
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient ? patient.full_name : 'Unknown'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
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
                    {getStatusIcon(invoice.status)}
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Prescriptions
              </h3>
              {prescriptions && prescriptions.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
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
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
        </div>

        {/* Invoice Actions and Payments */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {invoice.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setShowAddPayment(true)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add Payment
                    </button>
                    <button
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <ReceiptRefundIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Issue Refund
                    </button>
                  </>
                )}
                <Link
                  to={`/patients/${invoice.patient_id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Patient
                </Link>
                <button
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
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
                            {payment.payment_method}
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
                            {payment.status}
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
    </div>
  );
};

export default InvoiceDetails;