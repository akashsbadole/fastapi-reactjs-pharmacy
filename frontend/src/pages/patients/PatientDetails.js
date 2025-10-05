import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import { ArrowLeftIcon, UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const PatientDetails = () => {
  const { id } = useParams();

  const { data: patient, isLoading } = useQuery(
    ['patient', id],
    () => authAPI.get(endpoints.PATIENTS.GET(id)).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery(
    ['patient-prescriptions', id],
    () => authAPI.get(endpoints.PATIENTS.PRESCRIPTIONS(id)).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return <Loader text="Loading patient details..." />;
  }

  if (!patient) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Patient Not Found</h1>
          <p className="mt-1 text-sm text-gray-600">
            The patient you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center">
          <Link
            to="/app/patients"
            className="flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Patients
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Patient Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage patient information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {patient.full_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Patient ID: {patient.patient_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient.phone || 'Not provided'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient.email || 'Not provided'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Age
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient.age} years old
                  </dd>
                </div>

                {patient.insurance_provider && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-2" />
                      Insurance Provider
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {patient.insurance_provider}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Actions */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/app/prescriptions/create?patient_id=${id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  New Prescription
                </Link>
                <Link
                  to={`/app/patients/${id}/edit`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Edit Patient
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Prescriptions */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Prescriptions
            </h3>
            {prescriptionsLoading ? (
              <Loader text="Loading prescriptions..." />
            ) : prescriptions && prescriptions.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Prescription ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prescription.prescription_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            prescription.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            prescription.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/app/prescriptions/${prescription.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No prescriptions found for this patient.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;