import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState('medicine-prediction');
  const [symptoms, setSymptoms] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicinePredictions, setMedicinePredictions] = useState([]);
  const [upcomingNeeds, setUpcomingNeeds] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
    fetchUpcomingNeeds();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/inventory/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchUpcomingNeeds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/predict-upcoming-needs');
      setUpcomingNeeds(response.data.predictions);
    } catch (error) {
      console.error('Error fetching upcoming needs:', error);
      toast.error('Failed to fetch upcoming inventory needs');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictMedicines = async () => {
    if (!symptoms.trim()) {
      toast.error('Please enter at least one symptom');
      return;
    }

    try {
      setLoading(true);
      const symptomsList = symptoms.split(',').map(s => s.trim()).filter(s => s);
      const response = await api.post('/ai/predict-medicines', {
        symptoms: symptomsList,
        patient_id: selectedPatient || null,
        limit: 10
      });
      setMedicinePredictions(response.data.predictions);
      toast.success(`Found ${response.data.predictions.length} medicine predictions`);
    } catch (error) {
      console.error('Error predicting medicines:', error);
      toast.error('Failed to predict medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAlternatives = async () => {
    if (!selectedMedicine) {
      toast.error('Please select a medicine');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/ai/medicine-alternatives', {
        medicine_id: parseInt(selectedMedicine),
        limit: 5
      });
      setAlternatives(response.data.alternatives);
      toast.success(`Found ${response.data.alternatives.length} alternatives`);
    } catch (error) {
      console.error('Error getting alternatives:', error);
      toast.error('Failed to get medicine alternatives');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Features</h1>
      
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('medicine-prediction')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medicine-prediction'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medicine Prediction
          </button>
          <button
            onClick={() => setActiveTab('upcoming-needs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming-needs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Inventory Needs
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alternatives'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medicine Alternatives
          </button>
        </nav>
      </div>

      {activeTab === 'medicine-prediction' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Predict Medicines Based on Symptoms</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms (comma-separated)
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., fever, headache, cough"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient (Optional)
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handlePredictMedicines}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Predicting...' : 'Predict Medicines'}
              </button>
            </div>
          </div>

          {medicinePredictions.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Predicted Medicines</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reasoning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicinePredictions.map((prediction) => (
                      <tr key={prediction.medicine_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prediction.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${prediction.confidence * 100}%` }}
                              ></div>
                            </div>
                            {Math.round(prediction.confidence * 100)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            prediction.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {prediction.stock_quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {prediction.reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upcoming-needs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Inventory Needs</h2>
              <button
                onClick={fetchUpcomingNeeds}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {upcomingNeeds.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicted Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Until Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommended Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingNeeds.map((prediction) => (
                      <tr key={prediction.medicine_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prediction.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.current_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.predicted_usage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(prediction.urgency)}`}>
                            {prediction.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.days_until_out}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prediction.recommended_order}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No upcoming inventory needs predicted.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alternatives' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Find Medicine Alternatives</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Medicine
                </label>
                <select
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleGetAlternatives}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Finding...' : 'Find Alternatives'}
              </button>
            </div>
          </div>

          {alternatives.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Alternative Medicines</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Similarity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reasoning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alternatives.map((alternative) => (
                      <tr key={alternative.medicine_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {alternative.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {alternative.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${alternative.similarity * 100}%` }}
                              ></div>
                            </div>
                            {Math.round(alternative.similarity * 100)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            alternative.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {alternative.stock_quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {alternative.reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFeatures;