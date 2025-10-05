import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: batch, isLoading } = useQuery(
    ['batch', id],
    () => authAPI.get(endpoints.INVENTORY.BATCH(id)).then(res => res.data),
    {
      enabled: !!id,
      onError: () => {
        navigate('/app/inventory');
      }
    }
  );

  const { data: stockMovements } = useQuery(
    ['batch-stock-movements', id],
    () => authAPI.get(endpoints.INVENTORY.STOCK_MOVEMENT(id)).then(res => res.data),
    {
      enabled: !!id
    }
  );

  const deleteBatchMutation = useMutation(
    () => authAPI.delete(endpoints.INVENTORY.BATCH(id)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('batches');
        navigate('/app/inventory?tab=batches');
      },
      onError: (error) => {
        console.error('Error deleting batch:', error);
      }
    }
  );

  const handleDelete = () => {
    deleteBatchMutation.mutate();
  };

  if (isLoading) {
    return <Loader text="Loading batch details..." />;
  }

  if (!batch) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Batch not found</h2>
          <Link
            to="/app/inventory?tab=batches"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  const isExpiringSoon = () => {
    if (!batch.expiry_date) return false;
    const expiryDate = new Date(batch.expiry_date);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const isLowStock = () => {
    return batch.current_stock <= batch.low_stock_threshold;
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/app/inventory?tab=batches"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
          Back to Batches
        </Link>
      </div>

      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">Batch Details</h2>
          <p className="mt-1 text-sm text-gray-500">
            Batch {batch.batch_number} for {batch.medicine?.name || 'Unknown Medicine'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to={`/app/inventory/batches/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
        {isLowStock() && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Low Stock Alert: Current stock ({batch.current_stock}) is at or below threshold ({batch.low_stock_threshold})
                </p>
              </div>
            </div>
          </div>
        )}
        {isExpiringSoon() && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Expiring Soon: This batch expires on {new Date(batch.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Batch Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details about this medicine batch.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Medicine</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.medicine?.name || 'Unknown Medicine'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.batch_number}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.current_stock} units
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Initial Quantity</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.quantity} units
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(batch.expiry_date).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Supplier</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.supplier?.name || 'Unknown Supplier'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.manufacturer || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Storage Condition</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.storage_condition || 'Not specified'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ${batch.purchase_price?.toFixed(2) || '0.00'} per unit
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Selling Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ${batch.selling_price?.toFixed(2) || '0.00'} per unit
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Low Stock Threshold</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {batch.low_stock_threshold} units
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stock Movements */}
      {stockMovements && stockMovements.length > 0 && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Stock Movements</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              History of stock movements for this batch.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          movement.movement_type === 'IN' ? 'bg-green-100 text-green-800' :
                          movement.movement_type === 'OUT' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {movement.movement_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.reason || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Batch
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete batch {batch.batch_number}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetails;