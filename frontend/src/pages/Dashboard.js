import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import {
  UsersIcon,
  CubeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery(
    'dashboard-stats',
    () => api.get(endpoints.REPORTS.DASHBOARD_STATS).then(res => res.data),
    {
      refetchInterval: 60000, // Refetch every minute
      retry: 1,
      retryDelay: 1000,
    }
  );

  if (isLoading) {
    return <Loader text="Loading dashboard..." />;
  }

  // Use default data if API call fails
  const statsData = stats || {
    total_sales_today: 0,
    total_orders_today: 0,
    total_patients: 0,
    total_medicines: 0,
    low_stock_alerts: 0,
    expiring_soon_alerts: 0,
    pending_prescriptions: 0,
    recent_activities: [],
  };

  const statCards = [
    {
      name: 'Today\'s Sales',
      value: `$${statsData.total_sales_today?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      link: '/billing',
    },
    {
      name: 'Today\'s Orders',
      value: statsData.total_orders_today || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/billing',
    },
    {
      name: 'Total Patients',
      value: statsData.total_patients || 0,
      icon: UsersIcon,
      color: 'bg-purple-500',
      link: '/patients',
    },
    {
      name: 'Total Medicines',
      value: statsData.total_medicines || 0,
      icon: CubeIcon,
      color: 'bg-yellow-500',
      link: '/inventory',
    },
  ];

  const alertCards = [
    {
      name: 'Low Stock Alerts',
      value: statsData.low_stock_alerts || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      link: '/inventory?alerts=low-stock',
    },
    {
      name: 'Expiring Soon',
      value: statsData.expiring_soon_alerts || 0,
      icon: ClockIcon,
      color: 'bg-red-500',
      link: '/inventory?alerts=expiring',
    },
    {
      name: 'Pending Prescriptions',
      value: statsData.pending_prescriptions || 0,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      link: '/prescriptions?status=pending',
    },
  ];

  const recentActivities = statsData.recent_activities || [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your pharmacy management system dashboard.
        </p>
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <p className="text-sm">
              <span className="font-medium">Warning:</span> Unable to load dashboard data.
              {error.response?.status === 401 ? ' Please ensure the backend API is running and you are logged in.' : ' Using default values.'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className={`h-6 w-6 text-white ${stat.color} rounded-full p-1`}
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {alertCards.map((alert) => (
          <Link
            key={alert.name}
            to={alert.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <alert.icon
                    className={`h-6 w-6 text-white ${alert.color} rounded-full p-1`}
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {alert.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {alert.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activities
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                              <span className="text-white text-xs font-medium">
                                {activity.username?.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {activity.username}
                                </span>{' '}
                                {activity.action.toLowerCase()} {activity.resource_type.toLowerCase()}
                              </p>
                              {activity.new_values && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {activity.new_values}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {new Date(activity.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No recent activities</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/patients/create"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Patient
              </Link>
              <Link
                to="/prescriptions/create"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                New Prescription
              </Link>
              <Link
                to="/billing/create"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Invoice
              </Link>
              <Link
                to="/inventory/medicines/create"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Medicine
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;