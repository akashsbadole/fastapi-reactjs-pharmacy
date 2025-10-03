import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  CubeIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('medicines');
  
  // Set active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['medicines', 'batches', 'suppliers', 'analytics', 'alerts'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const { data: medicines, isLoading: medicinesLoading } = useQuery(
    'medicines',
    () => authAPI.get(endpoints.INVENTORY.MEDICINES).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: batches, isLoading: batchesLoading } = useQuery(
    'batches',
    () => authAPI.get(endpoints.INVENTORY.BATCHES).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: suppliers, isLoading: suppliersLoading } = useQuery(
    'suppliers',
    () => authAPI.get(endpoints.INVENTORY.SUPPLIERS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: alerts, isLoading: alertsLoading } = useQuery(
    'inventory-alerts',
    () => Promise.all([
      authAPI.get(endpoints.INVENTORY.LOW_STOCK_ALERTS),
      authAPI.get(endpoints.INVENTORY.EXPIRING_SOON)
    ]).then(([lowStock, expiringSoon]) => ({
      low_stock: lowStock.data,
      expiring_soon: expiringSoon.data
    })),
    {
      refetchOnWindowFocus: false,
    }
  );

  const filteredMedicines = medicines?.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredBatches = batches?.filter(batch =>
    batch.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabs = [
    { id: 'medicines', name: 'Medicines', icon: CubeIcon },
    { id: 'batches', name: 'Batches', icon: CubeIcon },
    { id: 'suppliers', name: 'Suppliers', icon: TruckIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage medicines, batches, and suppliers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {activeTab !== 'analytics' && (
            <Link
              to={activeTab === 'medicines' ? '/inventory/medicines/create' :
                   activeTab === 'batches' ? '/inventory/batches/create' :
                   activeTab === 'suppliers' ? '/inventory/suppliers/create' : '#'}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add {activeTab === 'medicines' ? 'Medicine' :
                   activeTab === 'batches' ? 'Batch' :
                   activeTab === 'suppliers' ? 'Supplier' : 'Item'}
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
                {tab.id === 'alerts' && alerts && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {alerts.low_stock?.length + alerts.expiring_soon?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'medicines' && (
          <div>
            {medicinesLoading ? (
              <Loader text="Loading medicines..." />
            ) : filteredMedicines.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredMedicines.map((medicine) => (
                    <li key={medicine.id}>
                      <Link
                        to={`/inventory/medicines/${medicine.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="flex-shrink-0">
                                  <CubeIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1 px-4">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {medicine.name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {medicine.generic_name}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">
                                {medicine.total_stock || 0} units
                              </p>
                              <p className="text-sm text-gray-500">
                                ${medicine.price?.toFixed(2) || '0.00'} per unit
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">No medicines found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'batches' && (
          <div>
            {batchesLoading ? (
              <Loader text="Loading batches..." />
            ) : filteredBatches.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredBatches.map((batch) => (
                    <li key={batch.id}>
                      <Link
                        to={`/inventory/batches/${batch.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="flex-shrink-0">
                                  <CubeIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1 px-4">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {batch.medicine?.name || 'Unknown Medicine'}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    Batch: {batch.batch_number} | Supplier: {batch.supplier?.name || 'Unknown Supplier'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">
                                {batch.current_stock || 0} units
                              </p>
                              <p className="text-sm text-gray-500">
                                ${batch.selling_price?.toFixed(2) || '0.00'} per unit
                              </p>
                              <p className="text-xs text-gray-400">
                                Expires: {new Date(batch.expiry_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">No batches found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div>
            {suppliersLoading ? (
              <Loader text="Loading suppliers..." />
            ) : filteredSuppliers.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <li key={supplier.id}>
                      <Link
                        to={`/inventory/suppliers/${supplier.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="min-w-0 flex-1 flex items-center">
                                <div className="flex-shrink-0">
                                  <TruckIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1 px-4">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {supplier.name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {supplier.contact_person}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">
                                {supplier.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                {supplier.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">No suppliers found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Inventory Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View detailed analytics and reports for your inventory.
                </p>
                <div className="mt-6">
                  <Link
                    to="/inventory/analytics"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {alertsLoading ? (
              <Loader text="Loading alerts..." />
            ) : (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Low Stock Alerts
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {alerts.low_stock?.length || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                    {alerts.low_stock && alerts.low_stock.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Medicines with low stock:</p>
                        <ul className="mt-2 text-sm text-gray-500">
                          {alerts.low_stock.slice(0, 3).map((medicine, index) => (
                            <li key={index}>
                              • {medicine.name} ({medicine.current_stock} units)
                            </li>
                          ))}
                          {alerts.low_stock.length > 3 && (
                            <li>• ... and {alerts.low_stock.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Expiring Soon
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {alerts.expiring_soon?.length || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                    {alerts.expiring_soon && alerts.expiring_soon.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Medicines expiring soon:</p>
                        <ul className="mt-2 text-sm text-gray-500">
                          {alerts.expiring_soon.slice(0, 3).map((medicine, index) => (
                            <li key={index}>
                              • {medicine.name} (expires {medicine.expiry_date})
                            </li>
                          ))}
                          {alerts.expiring_soon.length > 3 && (
                            <li>• ... and {alerts.expiring_soon.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;