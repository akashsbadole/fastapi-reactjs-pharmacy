import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api, endpoints, apiHelpers } from '../../services/api';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  CubeIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery(
    'sales-report',
    () => api.get(endpoints.REPORTS.SALES).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: posDailySummary, isLoading: posLoading, error: posError } = useQuery(
    'pos-daily-summary',
    () => api.get(endpoints.POS.DAILY_SUMMARY).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: patientStats, error: patientError } = useQuery(
    'patient-stats',
    () => api.get(endpoints.REPORTS.PATIENTS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: inventoryStats, error: inventoryError } = useQuery(
    'inventory-stats',
    () => api.get(endpoints.REPORTS.INVENTORY).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: financialStats, error: financialError } = useQuery(
    'financial-stats',
    () => api.get(endpoints.REPORTS.FINANCIAL).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: CurrencyDollarIcon },
    { id: 'patients', name: 'Patient Report', icon: UserIcon },
    { id: 'inventory', name: 'Inventory Report', icon: CubeIcon },
    { id: 'financial', name: 'Financial Report', icon: ChartBarIcon },
    { id: 'prescriptions', name: 'Prescription Report', icon: DocumentTextIcon },
  ];

  const generateReport = (reportType) => {
    setSelectedReport(reportType);
    // In a real implementation, this would trigger the report generation
  };

  const downloadReport = async (reportType) => {
    try {
      // Get date range from state
      const params = new URLSearchParams();
      params.append('period', 'week'); // Default to week, could be made configurable
      
      if (dateRange.start) {
        params.append('date_from', dateRange.start);
      }
      
      if (dateRange.end) {
        params.append('date_to', dateRange.end);
      }
      
      // Download the report
      await apiHelpers.downloadCSV(
        `${endpoints.REPORTS.DOWNLOAD(reportType)}?${params.toString()}`,
        `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`
      );
    } catch (error) {
      console.error('Error downloading report:', error);
      // Show error message to user
      alert('Failed to download report. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {(salesError || patientError || inventoryError || financialError) && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
          <p className="text-sm">
            <span className="font-medium">Warning:</span> Some report data is unavailable.
            {(salesError?.response?.status === 401 || patientError?.response?.status === 401 || inventoryError?.response?.status === 401 || financialError?.response?.status === 401)
              ? ' Please ensure the backend API is running and you are logged in.'
              : ' Using default values where applicable.'}
          </p>
        </div>
      )}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate and view various reports.
          </p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => generateReport(report.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedReport === report.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <report.icon className="h-6 w-6 text-gray-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.id === 'sales' && 'View sales trends and revenue'}
                    {report.id === 'patients' && 'Analyze patient demographics'}
                    {report.id === 'inventory' && 'Track inventory levels and stock'}
                    {report.id === 'financial' && 'Financial overview and summaries'}
                    {report.id === 'prescriptions' && 'Prescription statistics and trends'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filter by Date Range</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {reportTypes.find(r => r.id === selectedReport)?.name} Preview
          </h2>
          <button
            onClick={() => downloadReport(selectedReport)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="-ml-0.5 mr-1 h-4 w-4" />
            Download
          </button>
        </div>

        {selectedReport === 'sales' && (
          <div>
            {salesLoading ? (
              <Loader text="Loading sales data..." />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(salesData?.total_sales || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {salesData?.total_invoices || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(salesData?.average_invoice_value || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Report Period</p>
                        <p className="text-lg font-semibold text-gray-900">
                          Last 7 days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* POS Daily Summary */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">POS Transaction Summary</h3>
                  {posLoading ? (
                    <Loader text="Loading POS data..." />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Cash Sales</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${(posDailySummary?.cash_sales || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <DocumentTextIcon className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Card Sales</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${(posDailySummary?.card_sales || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <UserIcon className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Insurance Sales</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${(posDailySummary?.insurance_sales || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <CubeIcon className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Online Sales</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${(posDailySummary?.online_sales || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Top Medicines from POS */}
                {posDailySummary?.top_medicines && posDailySummary.top_medicines.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Top Selling Medicines (POS)</h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {posDailySummary.top_medicines.slice(0, 5).map((medicine, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{medicine.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{medicine.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">${medicine.revenue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedReport === 'patients' && (
          <div>
            {patientStats ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Patients</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {patientStats?.total_patients || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">New Patients</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {patientStats?.new_patients_this_month || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Patients with Prescriptions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {patientStats?.patients_with_prescriptions || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No patient statistics available.</p>
            )}
          </div>
        )}

        {selectedReport === 'inventory' && (
          <div>
            {inventoryStats ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CubeIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Medicines</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {inventoryStats?.total_medicines || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {inventoryStats?.low_stock_items || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {inventoryStats?.expiring_items || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Value</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${(inventoryStats?.total_inventory_value || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No inventory statistics available.</p>
            )}
          </div>
        )}

        {selectedReport === 'financial' && (
          <div>
            {financialStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(financialStats?.total_revenue || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total Cost</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(financialStats?.total_cost || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Gross Profit</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(financialStats?.gross_profit || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {(financialStats?.profit_margin || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Breakdown */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Revenue by Payment Mode</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(financialStats?.revenue_by_payment_mode || {}).map(([mode, amount]) => (
                      <div key={mode} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">{mode}</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${(amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">Financial report will show comprehensive financial data including revenue, expenses, and profit margins.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedReport === 'prescriptions' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Prescription report will show prescription statistics, trends, and analysis.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;