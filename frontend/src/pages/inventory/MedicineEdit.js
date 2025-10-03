import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const MedicineEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand: '',
    category: '',
    description: '',
    dosage_form: '',
    strength: '',
    manufacturer: '',
    requires_prescription: false,
    barcode: '',
    sku: '',
    pack_size: '',
    hsn_code: '',
    mrp: '',
    purchase_price: '',
    selling_price: '',
    tax_percent: '',
    stock_quantity: '',
    reorder_level: '',
    storage_condition: '',
    schedule: '',
    alternative_drug_names: '',
    substitution_allowed: true,
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: medicine, isLoading } = useQuery(
    ['medicine', id],
    () => authAPI.get(endpoints.INVENTORY.MEDICINE(id)).then(res => res.data),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          generic_name: data.generic_name || '',
          brand: data.brand || '',
          category: data.category || '',
          description: data.description || '',
          dosage_form: data.dosage_form || '',
          strength: data.strength || '',
          manufacturer: data.manufacturer || '',
          requires_prescription: data.requires_prescription || false,
          barcode: data.barcode || '',
          sku: data.sku || '',
          pack_size: data.pack_size || '',
          hsn_code: data.hsn_code || '',
          mrp: data.mrp?.toString() || '',
          purchase_price: data.purchase_price?.toString() || '',
          selling_price: data.selling_price?.toString() || '',
          tax_percent: data.tax_percent?.toString() || '',
          stock_quantity: data.stock_quantity?.toString() || '',
          reorder_level: data.reorder_level?.toString() || '',
          storage_condition: data.storage_condition || '',
          schedule: data.schedule || '',
          alternative_drug_names: data.alternative_drug_names || '',
          substitution_allowed: data.substitution_allowed !== false,
          location: data.location || '',
          notes: data.notes || ''
        });
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null,
        tax_percent: formData.tax_percent ? parseFloat(formData.tax_percent) : 0,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : 10
      };

      await authAPI.put(endpoints.INVENTORY.MEDICINE(id), submitData);
      queryClient.invalidateQueries('medicines');
      navigate(`/inventory/medicines/${id}`);
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Failed to update medicine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader text="Loading medicine details..." />;
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <Link to={`/inventory/medicines/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Medicine Details
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Medicine</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic details about the medicine.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="generic_name" className="block text-sm font-medium text-gray-700">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    id="generic_name"
                    name="generic_name"
                    value={formData.generic_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Dosage Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Details about dosage and strength.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="dosage_form" className="block text-sm font-medium text-gray-700">
                    Dosage Form
                  </label>
                  <input
                    type="text"
                    id="dosage_form"
                    name="dosage_form"
                    value={formData.dosage_form}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="strength" className="block text-sm font-medium text-gray-700">
                    Strength
                  </label>
                  <input
                    type="text"
                    id="strength"
                    name="strength"
                    value={formData.strength}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                    Schedule
                  </label>
                  <input
                    type="text"
                    id="schedule"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Pricing & Stock</h3>
              <p className="mt-1 text-sm text-gray-500">
                Pricing and inventory information.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="mrp" className="block text-sm font-medium text-gray-700">
                    MRP ($)
                  </label>
                  <input
                    type="number"
                    id="mrp"
                    name="mrp"
                    step="0.01"
                    min="0"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    id="selling_price"
                    name="selling_price"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    id="purchase_price"
                    name="purchase_price"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="tax_percent" className="block text-sm font-medium text-gray-700">
                    Tax Percent (%)
                  </label>
                  <input
                    type="number"
                    id="tax_percent"
                    name="tax_percent"
                    step="0.01"
                    min="0"
                    value={formData.tax_percent}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="reorder_level" className="block text-sm font-medium text-gray-700">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    id="reorder_level"
                    name="reorder_level"
                    min="0"
                    value={formData.reorder_level}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Additional details and identifiers.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                    Barcode
                  </label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="pack_size" className="block text-sm font-medium text-gray-700">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    id="pack_size"
                    name="pack_size"
                    value={formData.pack_size}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="hsn_code" className="block text-sm font-medium text-gray-700">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    id="hsn_code"
                    name="hsn_code"
                    value={formData.hsn_code}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="storage_condition" className="block text-sm font-medium text-gray-700">
                    Storage Condition
                  </label>
                  <input
                    type="text"
                    id="storage_condition"
                    name="storage_condition"
                    value={formData.storage_condition}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="alternative_drug_names" className="block text-sm font-medium text-gray-700">
                    Alternative Drug Names
                  </label>
                  <input
                    type="text"
                    id="alternative_drug_names"
                    name="alternative_drug_names"
                    value={formData.alternative_drug_names}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="requires_prescription"
                        name="requires_prescription"
                        type="checkbox"
                        checked={formData.requires_prescription}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="requires_prescription" className="font-medium text-gray-700">
                        Requires Prescription
                      </label>
                      <p className="text-gray-500">Check if this medicine requires a prescription to purchase.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="substitution_allowed"
                        name="substitution_allowed"
                        type="checkbox"
                        checked={formData.substitution_allowed}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="substitution_allowed" className="font-medium text-gray-700">
                        Substitution Allowed
                      </label>
                      <p className="text-gray-500">Check if pharmacists can substitute with alternative drugs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/inventory/medicines/${id}`)}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineEdit;