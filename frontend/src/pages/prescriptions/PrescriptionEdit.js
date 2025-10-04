import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const PrescriptionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_name: '',
    doctor_license: '',
    diagnosis: '',
    notes: '',
    status: 'PENDING',
    items: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  
  // Fetch prescription details
  const { data: prescription, isLoading: prescriptionLoading } = useQuery(
    ['prescription', id],
    () => api.get(endpoints.PRESCRIPTIONS.GET(id)).then(res => res.data),
    {
      enabled: !!id,
      onSuccess: (data) => {
        setFormData({
          patient_id: data.patient_id,
          doctor_name: data.doctor_name || '',
          doctor_license: data.doctor_license || '',
          diagnosis: data.diagnosis || '',
          notes: data.notes || '',
          status: data.status,
          items: data.items?.map(item => ({
            medicine_id: item.medicine_id,
            name: item.medicine_name,
            dosage: item.dosage || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            quantity: item.quantity || 1,
            instructions: item.instructions || '',
            batch_id: item.batch_id || null
          })) || []
        });
      }
    }
  );
  
  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery(
    'patients',
    () => api.get(endpoints.PATIENTS.LIST).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch medicines
  const { data: medicines, isLoading: medicinesLoading } = useQuery(
    'prescription-medicines',
    () => api.get('/api/prescriptions/create/medicines').then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  // Update prescription mutation
  const updatePrescriptionMutation = useMutation(
    (data) => api.put(endpoints.PRESCRIPTIONS.UPDATE(id), data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('prescriptions');
        queryClient.invalidateQueries(['prescription', id]);
        navigate(`/prescriptions/${id}`);
      },
      onError: (error) => {
        console.error('Error updating prescription:', error);
      }
    }
  );
  
  // Filter medicines based on search term
  useEffect(() => {
    if (medicines && searchTerm) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines || []);
    }
  }, [medicines, searchTerm]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddItem = (medicine) => {
    const newItem = {
      medicine_id: medicine.id,
      name: medicine.name,
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      instructions: '',
      batch_id: null
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.patient_id) {
      alert('Please select a patient');
      return;
    }
    
    // Update prescription
    updatePrescriptionMutation.mutate(formData);
  };
  
  if (prescriptionLoading || patientsLoading || medicinesLoading) {
    return <Loader text="Loading data..." />;
  }
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/prescriptions/${id}`)}
            className="flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Prescription Details
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit Prescription</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update prescription information.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients?.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} ({patient.date_of_birth})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="FILLED">Filled</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700">
                  Doctor Name
                </label>
                <input
                  type="text"
                  id="doctor_name"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="doctor_license" className="block text-sm font-medium text-gray-700">
                  Doctor License
                </label>
                <input
                  type="text"
                  id="doctor_license"
                  name="doctor_license"
                  value={formData.doctor_license}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                  Diagnosis
                </label>
                <input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Medicines Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Prescribed Medicines
              </h3>
              <span className="text-sm text-gray-500">
                {formData.items.length} medicine(s)
              </span>
            </div>
            
            {/* Medicine Search */}
            <div className="mb-4">
              <label htmlFor="medicine-search" className="block text-sm font-medium text-gray-700">
                Search Medicines
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="medicine-search"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name or generic name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Medicine List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Medicines</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMedicines?.map(medicine => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddItem(medicine)}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                      <div className="text-xs text-gray-500">{medicine.generic_name}</div>
                    </div>
                    <PlusIcon className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Medicines */}
            {formData.items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Medicines</h4>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">ID: {item.medicine_id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Dosage</label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                            placeholder="e.g., 10mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Frequency</label>
                          <input
                            type="text"
                            value={item.frequency}
                            onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Duration</label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="mt-1 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700">Instructions</label>
                        <textarea
                          value={item.instructions}
                          onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                          placeholder="Special instructions..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatePrescriptionMutation.isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {updatePrescriptionMutation.isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                Update Prescription
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionEdit;