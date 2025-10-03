import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { endpoints } from '../../services/api';

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.INVENTORY.MEDICINE(id));
        setMedicine(response.data);
        
        // Fetch batches for this medicine
        const batchesResponse = await api.get(`${endpoints.INVENTORY.BATCHES}?medicine_id=${id}`);
        setBatches(batchesResponse.data);
      } catch (err) {
        console.error('Error fetching medicine details:', err);
        setError('Failed to fetch medicine details');
        toast.error('Failed to fetch medicine details');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(endpoints.INVENTORY.MEDICINE(id));
        toast.success('Medicine deleted successfully');
        navigate('/inventory/medicines');
      } catch (err) {
        console.error('Error deleting medicine:', err);
        toast.error('Failed to delete medicine');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Medicine not found</h2>
        <button 
          onClick={() => navigate('/inventory/medicines')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Medicine Details</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/inventory/medicines')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`/inventory/medicines/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">{medicine.name}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Generic Name:</span>
                    <span className="ml-2">{medicine.generic_name}</span>
                  </div>
                  <div>
                    <span className="font-medium">Brand:</span>
                    <span className="ml-2">{medicine.brand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{medicine.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Strength:</span>
                    <span className="ml-2">{medicine.strength}</span>
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span>
                    <span className="ml-2">{medicine.unit}</span>
                  </div>
                  <div>
                    <span className="font-medium">Manufacturer:</span>
                    <span className="ml-2">{medicine.manufacturer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Barcode:</span>
                    <span className="ml-2">{medicine.barcode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing & Stock</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Price per Unit:</span>
                    <span className="ml-2">${medicine.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Low Stock Threshold:</span>
                    <span className="ml-2">{medicine.low_stock_threshold || '0'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Requires Prescription:</span>
                    <span className="ml-2">{medicine.requires_prescription ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Storage Requirements:</span>
                    <span className="ml-2">{medicine.storage_requirements || 'Room Temperature'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{medicine.description || 'No description available'}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Image</h3>
              {medicine.image_url ? (
                <img 
                  src={medicine.image_url} 
                  alt={medicine.name} 
                  className="max-w-md h-48 object-contain border rounded-md"
                />
              ) : (
                <div className="text-gray-500">No image available</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Batches</h3>
            {batches.length === 0 ? (
              <p className="text-gray-500">No batches available for this medicine</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.batch_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.current_stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.supplier?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/inventory/batches/${batch.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;