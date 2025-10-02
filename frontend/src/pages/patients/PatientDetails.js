import React from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader';

const PatientDetails = () => {
  const { id } = useParams();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage patient information.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p>Patient ID: {id}</p>
        <p className="mt-4 text-gray-600">Patient details component will be implemented here.</p>
      </div>
    </div>
  );
};

export default PatientDetails;