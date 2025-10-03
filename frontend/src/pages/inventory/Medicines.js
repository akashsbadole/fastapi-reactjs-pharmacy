import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { authAPI, endpoints, apiHelpers } from '../../services/api';
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: medicines, isLoading } = useQuery(
    'medicines',
    () => authAPI.get(endpoints.INVENTORY.MEDICINES).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: lowStockAlerts } = useQuery(
    'low-stock-alerts',
    () => authAPI.get(endpoints.INVENTORY.LOW_STOCK_ALERTS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const filteredMedicines = medicines?.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
    if (stock <= minStock) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await apiHelpers.downloadCSV(endpoints.INVENTORY.EXPORT_MEDICINES_CSV, 'medicines.csv');
    } catch (error) {
      console.error('Error exporting medicines:', error);
      alert('Failed to export medicines. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await apiHelpers.importCSV(endpoints.INVENTORY.IMPORT_MEDICINES_CSV, file);
      setImportResult(result);
      
      // Refresh medicines list
      queryClient.invalidateQueries('medicines');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing medicines:', error);
      setImportResult({
        message: 'Import failed',
        imported: 0,
        skipped: 0,
        errors: [error.response?.data?.detail || 'Unknown error occurred']
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await authAPI.delete(endpoints.INVENTORY.MEDICINE(medicineId));
      queryClient.invalidateQueries('medicines');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('Failed to delete medicine. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllMedicines = async () => {
    if (!window.confirm('Are you sure you want to delete all medicines? This action cannot be undone and will only work if no medicines have active stock.')) {
      return;
    }

    setDeletingAll(true);
    try {
      await authAPI.delete(endpoints.INVENTORY.MEDICINES);
      queryClient.invalidateQueries('medicines');
    } catch (error) {
      console.error('Error deleting all medicines:', error);
      alert('Failed to delete all medicines. Please make sure no medicines have active stock.');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage medicine inventory.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <label className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50">
            <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {importing ? 'Importing...' : 'Import CSV'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              disabled={importing}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDeleteAllMedicines}
            disabled={deletingAll}
            className="inline-flex items-center justify-center rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {deletingAll ? 'Deleting...' : 'Delete All'}
          </button>
          <Link
            to="/inventory/medicines/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Medicine
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
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Import Result Alert */}
      {importResult && (
        <div className={`mt-4 border-l-4 p-4 ${
          importResult.errors && importResult.errors.length > 0
            ? 'bg-yellow-50 border-yellow-400'
            : 'bg-green-50 border-green-400'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {importResult.errors && importResult.errors.length > 0 ? (
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              ) : (
                <CubeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                importResult.errors && importResult.errors.length > 0
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }`}>
                <span className="font-medium">{importResult.message}</span>
                <br />
                Imported: {importResult.imported}, Skipped: {importResult.skipped}
                {importResult.errors && importResult.errors.length > 0 && (
                  <>
                    <br />
                    Errors: {importResult.errors.length}
                  </>
                )}
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm font-medium text-yellow-700 cursor-pointer">View Errors</summary>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>... and {importResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </details>
              )}
              <button
                onClick={() => setImportResult(null)}
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockAlerts && lowStockAlerts.length > 0 && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">{lowStockAlerts.length}</span> medicine(s) are low in stock.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medicines Table */}
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
                      Medicine Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Generic Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      MRP
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Selling Price
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
                      <td colSpan="8" className="px-6 py-4 text-center">
                        <Loader text="Loading medicines..." />
                      </td>
                    </tr>
                  ) : filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => {
                      const stockStatus = getStockStatus(
                        medicine.stock_quantity || 0,
                        medicine.reorder_level || 0
                      );
                      
                      return (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {medicine.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medicine.generic_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medicine.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">{medicine.stock_quantity || 0} units</span>
                              {stockStatus.status === 'low-stock' && (
                                <span className="text-xs text-yellow-600">
                                  (Min: {medicine.reorder_level})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${medicine.mrp?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${medicine.selling_price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                              {stockStatus.status === 'out-of-stock' ? 'Out of Stock' :
                               stockStatus.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/inventory/medicines/${medicine.id}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                View
                              </Link>
                              <Link
                                to={`/inventory/medicines/${medicine.id}/edit`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteMedicine(medicine.id)}
                                disabled={deleting}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                              <Link
                                to={`/inventory/batches/create?medicine_id=${medicine.id}`}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <ArrowsRightLeftIcon className="h-4 w-4 inline" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No medicines found.
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

export default Medicines;