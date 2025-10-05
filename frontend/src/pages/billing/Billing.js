import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../../services/api';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'invoices', 'pos', 'held'

  const { data: invoices, isLoading: invoicesLoading } = useQuery(
    'invoices',
    () => api.get(endpoints.BILLING.INVOICES).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: posTransactions, isLoading: posLoading } = useQuery(
    'pos-transactions',
    () => api.get(endpoints.BILLING.POS_TRANSACTIONS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: heldBills, isLoading: heldLoading } = useQuery(
    'held-bills',
    () => api.get(endpoints.BILLING.HELD_BILLS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: allTransactions, isLoading: allLoading } = useQuery(
    'all-transactions',
    () => api.get(endpoints.BILLING.ALL_TRANSACTIONS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: patients } = useQuery(
    'patients',
    () => api.get(endpoints.PATIENTS.LIST).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Combine all data based on active tab
  const getAllData = () => {
    switch (activeTab) {
      case 'invoices':
        return invoices || [];
      case 'pos':
        return posTransactions || [];
      case 'held':
        return heldBills || [];
      default:
        // For 'all' tab, combine all data if unified endpoint doesn't work
        if (allTransactions && allTransactions.length > 0) {
          return allTransactions;
        }
        // Fallback to combining individual data sources
        const allInvoices = invoices || [];
        const allPos = posTransactions || [];
        const allHeld = heldBills || [];
        return [...allInvoices, ...allPos, ...allHeld];
    }
  };

  const filteredData = getAllData().filter(item => {
    const matchesSearch =
      item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hold_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         item.payment_status === statusFilter ||
                         item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Debug logging for the all tab
  React.useEffect(() => {
    if (activeTab === 'all') {
      console.log('All Transactions Data:', allTransactions);
      console.log('Invoices Data:', invoices);
      console.log('POS Transactions Data:', posTransactions);
      console.log('Held Bills Data:', heldBills);
      console.log('Combined Data:', getAllData());
    }
  }, [activeTab, allTransactions, invoices, posTransactions, heldBills]);

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
      case 'HELD':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'PARTIAL':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'REFUNDED':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'HELD':
        return <DocumentTextIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPatientName = (patientId) => {
    if (!patients) return '';
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : '';
  };

  const getOverdueCount = () => {
    const allData = getAllData();
    return allData?.filter(item =>
      item.payment_status === 'REFUNDED' || item.status === 'REFUNDED'
    ).length || 0;
  };

  const getPendingCount = () => {
    const allData = getAllData();
    return allData?.filter(item =>
      item.payment_status === 'PENDING' || item.status === 'PENDING'
    ).length || 0;
  };

  const getHeldCount = () => {
    return heldBills?.length || 0;
  };

  const getTotalRevenue = () => {
    const allData = getAllData();
    return allData?.filter(item =>
      item.payment_status === 'PAID' || item.status === 'PAID'
    ).reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0;
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage invoices and payments.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/app/billing/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Regular Invoices
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pos'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            POS Transactions
          </button>
          <button
            onClick={() => setActiveTab('held')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'held'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Held Bills ({getHeldCount()})
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${getTotalRevenue().toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Invoices
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {getPendingCount()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue Invoices
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {getOverdueCount()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {getAllData().length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by ID or patient name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="REFUNDED">Refunded</option>
            <option value="HELD">Held</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {activeTab === 'held' ? 'Hold Number' : (activeTab === 'all' ? 'Transaction ID' : 'Invoice ID')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
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
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(invoicesLoading || posLoading || heldLoading || allLoading) ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <Loader text="Loading transactions..." />
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.invoice_number || item.hold_number}
                          {item.type === 'pos' && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">POS</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.patient_name || item.customer_name}
                          {(activeTab === 'held' || item.type === 'held') && item.items_count && (
                            <div className="text-xs text-gray-400">
                              {item.items_count} items
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at || item.held_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.total_amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(item.payment_status || item.status)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.payment_status || item.status)}`}>
                              {(item.payment_status || item.status)?.charAt(0).toUpperCase() + (item.payment_status || item.status)?.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {item.type === 'held' || activeTab === 'held' ? (
                              <>
                                <Link
                                  to={`/app/pos/hold/${item.id}`}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  Resume
                                </Link>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => {
                                    // Handle delete held bill
                                    if (window.confirm('Are you sure you want to delete this held bill?')) {
                                      // API call to delete held bill
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  to={`/app/billing/invoices/${item.id}`}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  View
                                </Link>
                                {(item.payment_status === 'PENDING' || item.status === 'PENDING') && (
                                  <Link
                                    to={`/app/billing/invoices/${item.id}/edit`}
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    Edit
                                  </Link>
                                )}
                                {(item.payment_status === 'PENDING' || item.status === 'PENDING') && (
                                  <Link
                                    to={`/app/billing/invoices/${item.id}/payments`}
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    Add Payment
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No {activeTab === 'held' ? 'held bills' : activeTab === 'pos' ? 'POS transactions' : activeTab === 'invoices' ? 'invoices' : 'transactions'} found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;