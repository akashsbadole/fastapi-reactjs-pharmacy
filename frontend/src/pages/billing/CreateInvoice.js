import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      items: [{}]
    }
  });
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const watchedItems = watch('items');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients/');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patients');
      }
    };

    const fetchMedicines = async () => {
      try {
        const response = await api.get('/inventory/medicines');
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        toast.error('Failed to fetch medicines');
      }
    };

    fetchPatients();
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (selectedMedicine) {
      const fetchBatches = async () => {
        try {
          const response = await api.get(`/inventory/batches?medicine_id=${selectedMedicine.id}`);
          setBatches(response.data);
        } catch (error) {
          console.error('Error fetching batches:', error);
          toast.error('Failed to fetch batches');
        }
      };
      fetchBatches();
    } else {
      setBatches([]);
    }
  }, [selectedMedicine]);

  const handleMedicineChange = (e) => {
    const medicineId = e.target.value;
    const medicine = medicines.find(m => m.id === parseInt(medicineId));
    setSelectedMedicine(medicine);
    setValue('batch_id', '');
  };

  const addItem = () => {
    if (!watchedItems || watchedItems.length === 0 || !watchedItems[watchedItems.length - 1]) {
      toast.error('Please fill in all item details before adding another');
      return;
    }
    
    setItems([...items, ...watchedItems]);
    setValue('items', []);
    setSelectedMedicine(null);
    setBatches([]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity) - item.discount;
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        patient_id: parseInt(data.patient_id),
        items: items.map(item => ({
          medicine_id: item.medicine_id,
          batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0
        })),
        payment_mode: data.payment_mode
      };

      const response = await api.post('/billing/', invoiceData);
      toast.success('Invoice created successfully');
      navigate(`/billing/invoices/${response.data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to create invoice');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  {...register('patient_id', { required: 'Patient is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} ({patient.patient_id})
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  {...register('payment_mode', { required: 'Payment mode is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
                {errors.payment_mode && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_mode.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-500">
                <div>Medicine</div>
                <div>Batch</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Discount</div>
              </div>

              {(watchedItems || []).map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <select
                      {...register(`items.${index}.medicine_id`, { required: 'Medicine is required' })}
                      onChange={handleMedicineChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(medicine => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      {...register(`items.${index}.batch_id`, { required: 'Batch is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Batch</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>
                          {batch.batch_number} (Exp: {new Date(batch.expiry_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { required: 'Quantity is required', min: 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unit_price`, { required: 'Price is required', min: 0 })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.discount`, { required: false, min: 0 })}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Added Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => {
                        const total = (item.unit_price * item.quantity) - item.discount;
                        const medicine = medicines.find(m => m.id === item.medicine_id);
                        const batch = batches.find(b => b.id === item.batch_id);
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch?.batch_number || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unit_price?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.discount?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${total.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/billing')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;