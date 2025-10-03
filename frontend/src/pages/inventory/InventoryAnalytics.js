import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { authAPI, endpoints } from '../../services/api';
import {
  ChartBarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const InventoryAnalytics = () => {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'inventory-analytics',
    () => authAPI.get(endpoints.INVENTORY.ANALYTICS_SUMMARY).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: stockMovement, isLoading: movementLoading } = useQuery(
    ['stock-movement', days],
    () => authAPI.get(`${endpoints.INVENTORY.ANALYTICS_STOCK_MOVEMENT}?days=${days}`).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  if (analyticsLoading || movementLoading) {
    return <Loader text="Loading analytics..." />;
  }

  // Prepare data for category distribution chart
  const categoryData = analytics?.category_distribution || [];
  const maxCategoryCount = Math.max(...categoryData.map(c => c.count), 1);

  // Prepare data for stock movement chart
  const movementData = stockMovement?.movement_data || {};
  const movementDates = Object.keys(movementData).sort();
  const maxMovementValue = Math.max(
    ...movementDates.flatMap(date => [
      movementData[date].IN || 0,
      movementData[date].OUT || 0,
      movementData[date].ADJUSTMENT || 0
    ]),
    1
  );

  // Prepare data for top medicines chart
  const topMedicines = analytics?.top_medicines_by_value || [];
  const maxMedicineValue = Math.max(...topMedicines.map(m => m.total_value), 1);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Overview of your pharmacy inventory performance and metrics.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Medicines</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.total_medicines || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Stock Value</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${analytics?.total_stock_value?.toFixed(2) || '0.00'}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.low_stock_count || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.out_of_stock_count || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Category Distribution Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Medicines by Category</h3>
            <div className="mt-5">
              {categoryData.length > 0 ? (
                <div className="space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-24 text-sm text-gray-500 truncate">{category.category}</div>
                      <div className="flex-1 mx-2">
                        <div className="bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-primary-600 h-4 rounded-full"
                            style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 w-12 text-right">{category.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Medicines by Value Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Medicines by Stock Value</h3>
            <div className="mt-5">
              {topMedicines.length > 0 ? (
                <div className="space-y-2">
                  {topMedicines.map((medicine, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1 text-sm text-gray-500 truncate pr-2">{medicine.name}</div>
                      <div className="w-32">
                        <div className="bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-green-600 h-4 rounded-full"
                            style={{ width: `${(medicine.total_value / maxMedicineValue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 w-20 text-right pl-2">
                        ${medicine.total_value.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No medicine data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movement Chart */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Stock Movement Trend</h3>
            <div className="flex items-center space-x-2">
              <label htmlFor="days" className="text-sm text-gray-500">Period:</label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            {movementDates.length > 0 ? (
              <div className="space-y-2">
                {movementDates.map((date, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-500">
                      {new Date(date).toLocaleDateString()}
                    </div>
                    <div className="flex-1 mx-2 flex space-x-1">
                      {movementData[date].IN > 0 && (
                        <div className="flex items-center">
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          <div className="bg-green-200 rounded h-4 relative flex-1">
                            <div
                              className="bg-green-600 h-4 rounded"
                              style={{ width: `${(movementData[date].IN / maxMovementValue) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-green-700 ml-1 w-8">{movementData[date].IN}</span>
                        </div>
                      )}
                      {movementData[date].OUT > 0 && (
                        <div className="flex items-center">
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                          <div className="bg-red-200 rounded h-4 relative flex-1">
                            <div
                              className="bg-red-600 h-4 rounded"
                              style={{ width: `${(movementData[date].OUT / maxMovementValue) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-red-700 ml-1 w-8">{movementData[date].OUT}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No stock movement data available for the selected period</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;