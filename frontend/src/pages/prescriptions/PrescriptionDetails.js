import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const PrescriptionDetails = () => {
  const { id } = useParams();

  const { data: prescription, isLoading: prescriptionLoading } = useQuery(
    ['prescription', id],
    () => authAPI.get(endpoints.PRESCRIPTIONS.GET(id)).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const { data: patient } = useQuery(
    ['patient', prescription?.patient_id],
    () => prescription?.patient_id ? authAPI.get(endpoints.PATIENTS.GET(prescription.patient_id)).then(res => res.data) : Promise.resolve(null),
    {
      enabled: !!prescription?.patient_id,
    }
  );

  const { data: medicines } = useQuery(
    ['prescription-medicines', id],
    () => authAPI.get(endpoints.PRESCRIPTIONS.GET(id)).then(res => res.data.items),
    {
      enabled: !!id,
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'FILLED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'FILLED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'CANCELLED':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'APPROVED':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (prescriptionLoading) {
    return <Loader text="Loading prescription details..." />;
  }

  if (!prescription) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Prescription Not Found</h1>
          <p className="mt-1 text-sm text-gray-600">
            The prescription you're looking for doesn't exist.
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
            to="/prescriptions"
            className="flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Prescriptions
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Prescription Details</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage prescription information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {prescription.prescription_number}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created on {new Date(prescription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Patient
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patient ? patient.full_name : 'Unknown'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(prescription.created_at).toLocaleDateString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    {getStatusIcon(prescription.status)}
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${prescription.total_amount?.toFixed(2) || '0.00'}
                  </dd>
                </div>
              </div>

              {prescription.notes && (
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500">Doctor's Notes</dt>
                  <dd className="mt-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {prescription.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prescription Actions */}
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {prescription.status === 'PENDING' && (
                  <>
                    <Link
                      to={`/prescriptions/${id}/edit`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Edit Prescription
                    </Link>
                    <button
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Mark as Completed
                    </button>
                  </>
                )}
                {prescription.status === 'FILLED' && (
                  <button
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create Invoice
                  </button>
                )}
                <Link
                  to={`/patients/${prescription.patient_id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Patient
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Medicines */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Prescribed Medicines
            </h3>
            {medicines && medicines.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Medicine
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Dosage
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medicines.map((medicine, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {medicine.medicine_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.dosage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${medicine.selling_price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(medicine.selling_price * medicine.quantity)?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No medicines prescribed for this prescription.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetails;