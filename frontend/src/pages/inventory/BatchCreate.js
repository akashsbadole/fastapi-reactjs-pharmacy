import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const BatchCreate = () => {
  const { medicine_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    medicine_id: medicine_id || '',
    batch_number: '',
    quantity: '',
    expiry_date: '',
    manufacture_date: '', // Added manufacture_date field
    purchase_price: '',
    selling_price: '',
    low_stock_threshold: '10',
    supplier_id: '',
    manufacturer: '',
    storage_condition: 'Room Temperature'
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Get medicine details
  const { data: medicine, isLoading: medicineLoading } = useQuery(
    ['medicine', medicine_id],
    () => authAPI.get(endpoints.INVENTORY.MEDICINE(medicine_id)).then(res => res.data),
    {
      enabled: !!medicine_id,
      onError: () => {
        navigate('/app/inventory/medicines');
      }
    }
  );

  // Get medicines list for selection
  const { data: medicines, isLoading: medicinesLoading } = useQuery(
    'medicines',
    () => authAPI.get(endpoints.INVENTORY.MEDICINES).then(res => res.data),
    {
      enabled: !medicine_id // Only fetch if no medicine_id is provided
    }
  );

  // Get suppliers list
  const { data: suppliers, isLoading: suppliersLoading } = useQuery(
    'suppliers',
    () => authAPI.get(endpoints.INVENTORY.SUPPLIERS).then(res => res.data)
  );

  // Create batch mutation
  const createBatchMutation = useMutation(
    (batchData) => authAPI.post(endpoints.INVENTORY.BATCHES, batchData),
    {
      onSuccess: (data) => {
        setSuccessMessage('Batch created successfully!');
        queryClient.invalidateQueries('medicines');
        queryClient.invalidateQueries(['medicine', medicine_id]);
        queryClient.invalidateQueries('batches'); // Add this to refresh the batches list
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(medicine_id ? `/app/inventory/medicines/${medicine_id}` : '/app/inventory?tab=batches');
        }, 2000);
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData?.detail) {
          // Handle case where detail is an object (validation errors)
          if (typeof errorData.detail === 'object') {
            // Convert validation errors to a more readable format
            const errorMessages = Object.entries(errorData.detail).map(([field, errors]) => {
              const errorArray = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorArray.join(', ')}`;
            });
            setErrors({ submit: errorMessages.join('; ') });
          } else {
            setErrors({ submit: errorData.detail });
          }
        } else {
          setErrors({ submit: 'Failed to create batch. Please try again.' });
        }
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMedicineChange = (e) => {
    const medicineId = e.target.value;
    setFormData(prev => ({
      ...prev,
      medicine_id: medicineId
    }));
    
    // Clear error for this field
    if (errors.medicine_id) {
      setErrors(prev => ({
        ...prev,
        medicine_id: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate medicine selection if no medicine_id is in URL
    if (!medicine_id && !formData.medicine_id) {
      newErrors.medicine_id = 'Please select a medicine';
    }
    
    if (!formData.batch_number.trim()) {
      newErrors.batch_number = 'Batch number is required';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.expiry_date = 'Expiry date must be in the future';
      }
    }
    
    if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
      newErrors.purchase_price = 'Purchase price must be greater than 0';
    }
    
    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Selling price must be greater than 0';
    }
    
    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const batchData = {
      medicine_id: parseInt(medicine_id || formData.medicine_id),
      batch_number: formData.batch_number,
      quantity: parseInt(formData.quantity),
      expiry_date: formData.expiry_date,
      manufacture_date: formData.manufacture_date || new Date().toISOString().split('T')[0], // Added manufacture_date with default
      cost_price: parseFloat(formData.purchase_price), // Changed from purchase_price to cost_price
      selling_price: parseFloat(formData.selling_price),
      low_stock_threshold: parseInt(formData.low_stock_threshold),
      supplier_id: parseInt(formData.supplier_id),
      manufacturer: formData.manufacturer || medicine?.manufacturer || '',
      storage_condition: formData.storage_condition
    };
    
    createBatchMutation.mutate(batchData);
  };

  if (medicineLoading || suppliersLoading || (!medicine_id && medicinesLoading)) {
    return <Loader text="Loading data..." />;
  }

  if (medicine_id && !medicine) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Medicine not found</h2>
          <Link
            to="/app/inventory/medicines"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to={medicine_id ? `/app/inventory/medicines/${medicine_id}` : "/app/inventory/medicines"}
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
          Back to {medicine_id ? "Medicine Details" : "Medicines"}
        </Link>
      </div>

      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
          <p className="mt-1 text-sm text-gray-500">
            {medicine_id ?
              `Add a new batch for: <span className="font-medium">${medicine?.name || 'Loading...'}</span>` :
              "Add a new batch for a medicine"
            }
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Batch Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter the batch details for this medicine.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-1">
              <div className="grid grid-cols-1 gap-6">
                {/* Medicine selection - only show if no medicine_id in URL */}
                {!medicine_id && (
                  <div>
                    <label htmlFor="medicine_id" className="block text-sm font-medium text-gray-700">
                      Medicine *
                    </label>
                    <select
                      id="medicine_id"
                      name="medicine_id"
                      value={formData.medicine_id}
                      onChange={handleMedicineChange}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.medicine_id ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select a medicine</option>
                      {medicines?.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.name} ({med.strength})
                        </option>
                      ))}
                    </select>
                    {errors.medicine_id && (
                      <p className="mt-2 text-sm text-red-600">{errors.medicine_id}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    name="batch_number"
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.batch_number ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., BATCH001"
                  />
                  {errors.batch_number && (
                    <p className="mt-2 text-sm text-red-600">{errors.batch_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.quantity ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 100"
                  />
                  {errors.quantity && (
                    <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiry_date"
                    id="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.expiry_date ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.expiry_date && (
                    <p className="mt-2 text-sm text-red-600">{errors.expiry_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="manufacture_date" className="block text-sm font-medium text-gray-700">
                    Manufacture Date
                  </label>
                  <input
                    type="date"
                    name="manufacture_date"
                    id="manufacture_date"
                    value={formData.manufacture_date}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700">
                    Supplier *
                  </label>
                  <select
                    id="supplier_id"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.supplier_id ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers?.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.supplier_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={medicine?.manufacturer || 'e.g., Johnson & Johnson'}
                  />
                </div>

                <div>
                  <label htmlFor="storage_condition" className="block text-sm font-medium text-gray-700">
                    Storage Condition
                  </label>
                  <select
                    id="storage_condition"
                    name="storage_condition"
                    value={formData.storage_condition}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="Room Temperature">Room Temperature</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Dry Place">Dry Place</option>
                    <option value="Away from Light">Away from Light</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Pricing Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the pricing details for this batch.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-1">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                    Purchase Price ($) *
                  </label>
                  <input
                    type="number"
                    name="purchase_price"
                    id="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.purchase_price ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 5.00"
                  />
                  {errors.purchase_price && (
                    <p className="mt-2 text-sm text-red-600">{errors.purchase_price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    name="selling_price"
                    id="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.selling_price ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 7.50"
                  />
                  {errors.selling_price && (
                    <p className="mt-2 text-sm text-red-600">{errors.selling_price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    id="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleChange}
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g., 10"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Alert when stock falls below this quantity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(medicine_id ? `/app/inventory/medicines/${medicine_id}` : '/app/inventory/medicines')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createBatchMutation.isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {createBatchMutation.isLoading ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchCreate;