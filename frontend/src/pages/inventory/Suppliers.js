import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suppliers, isLoading } = useQuery(
    'suppliers',
    () => authAPI.get(endpoints.INVENTORY.SUPPLIERS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage supplier information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/app/inventory/suppliers/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Supplier
          </Link>
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
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Table */}
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
                      Supplier Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact Person
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact Information
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Address
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
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <Loader text="Loading suppliers..." />
                      </td>
                    </tr>
                  ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <TruckIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {supplier.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {supplier.supplier_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supplier.contact_person}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{supplier.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{supplier.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                            <span>{supplier.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/app/inventory/suppliers/${supplier.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </Link>
                            <Link
                              to={`/app/inventory/suppliers/${supplier.id}/edit`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No suppliers found.
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

export default Suppliers;