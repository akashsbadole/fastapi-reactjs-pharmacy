import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { endpoints } from '../../services/api';

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.INVENTORY.SUPPLIER(id));
        setSupplier(response.data);
        
        // Fetch medicines from this supplier
        // Note: This might not be directly available in the API
        // For now, we'll fetch all medicines and filter by supplier
        const medicinesResponse = await api.get(endpoints.INVENTORY.MEDICINES);
        // In a real implementation, the backend would have a way to filter medicines by supplier
        setMedicines(medicinesResponse.data);
      } catch (err) {
        console.error('Error fetching supplier details:', err);
        setError('Failed to fetch supplier details');
        toast.error('Failed to fetch supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(endpoints.INVENTORY.SUPPLIER(id));
        toast.success('Supplier deleted successfully');
        navigate('/inventory/suppliers');
      } catch (err) {
        console.error('Error deleting supplier:', err);
        toast.error('Failed to delete supplier');
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

  if (error || !supplier) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Supplier not found</h2>
        <button 
          onClick={() => navigate('/inventory/suppliers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Supplier Details</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/inventory/suppliers')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`/inventory/suppliers/${id}/edit`)}
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
                <h2 className="text-xl font-semibold mb-4">{supplier.name}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Contact Person:</span>
                    <span className="ml-2">{supplier.contact_person}</span>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{supplier.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{supplier.email}</span>
                  </div>
                  {supplier.tax_id && (
                    <div>
                      <span className="font-medium">Tax ID / VAT:</span>
                      <span className="ml-2">{supplier.tax_id}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div>
                      <span className="font-medium">Website:</span>
                      <span className="ml-2">
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {supplier.website}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="space-y-2">
                  <p>{supplier.address}</p>
                  <p>{supplier.city}, {supplier.state} {supplier.postal_code}</p>
                  <p>{supplier.country}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                <div className="space-y-2">
                  {supplier.payment_terms && (
                    <div>
                      <span className="font-medium">Payment Terms:</span>
                      <span className="ml-2">{supplier.payment_terms}</span>
                    </div>
                  )}
                  {supplier.bank_name && (
                    <div>
                      <span className="font-medium">Bank Name:</span>
                      <span className="ml-2">{supplier.bank_name}</span>
                    </div>
                  )}
                  {supplier.bank_account && (
                    <div>
                      <span className="font-medium">Bank Account:</span>
                      <span className="ml-2">{supplier.bank_account}</span>
                    </div>
                  )}
                  {supplier.bank_swift && (
                    <div>
                      <span className="font-medium">SWIFT Code:</span>
                      <span className="ml-2">{supplier.bank_swift}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{supplier.notes || 'No notes available'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Supplied Medicines</h3>
            {medicines.length === 0 ? (
              <p className="text-gray-500">No medicines available from this supplier</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strength</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.generic_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.strength}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/inventory/medicines/${medicine.id}`)}
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

export default SupplierDetails;