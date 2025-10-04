import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const AuditLogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oldValues, setOldValues] = useState({});
  const [newValues, setNewValues] = useState({});

  // Fetch audit log details
  const { data: auditLog, isLoading, error } = useQuery(
    ['auditLog', id],
    async () => {
      const response = await api.get(`/api/audit/${id}`);
      return response.data;
    }
  );

  useEffect(() => {
    if (auditLog) {
      try {
        if (auditLog.old_values) {
          setOldValues(JSON.parse(auditLog.old_values));
        }
        if (auditLog.new_values) {
          setNewValues(JSON.parse(auditLog.new_values));
        }
      } catch (e) {
        console.error('Error parsing JSON values:', e);
      }
    }
  }, [auditLog]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  const getActionColor = (action) => {
    const actionColors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-yellow-100 text-yellow-800',
      VIEW: 'bg-gray-100 text-gray-800',
      APPROVE: 'bg-indigo-100 text-indigo-800',
      REJECT: 'bg-pink-100 text-pink-800',
    };
    
    return actionColors[action] || 'bg-gray-100 text-gray-800';
  };

  const renderValueChanges = () => {
    if (Object.keys(oldValues).length === 0 && Object.keys(newValues).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No detailed changes recorded
        </div>
      );
    }

    // Get all keys from both old and new values
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    return (
      <div className="space-y-4">
        {Array.from(allKeys).map((key) => (
          <div key={key} className="border-b border-gray-200 pb-3">
            <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
              {key.replace(/_/g, ' ')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Previous Value</div>
                <div className="text-sm bg-red-50 p-2 rounded">
                  {oldValues[key] !== undefined ? String(oldValues[key]) : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">New Value</div>
                <div className="text-sm bg-green-50 p-2 rounded">
                  {newValues[key] !== undefined ? String(newValues[key]) : '-'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/audit')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Audit Logs
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading audit log: {error.message}
              </p>
            </div>
          </div>
        </div>
      ) : auditLog ? (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Audit Log Details
                </h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(auditLog.action)}`}>
                  {auditLog.action}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Timestamp
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(auditLog.created_at)}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    User
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-primary-600 font-medium text-sm">
                          {auditLog.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{auditLog.full_name}</div>
                        <div className="text-gray-500">{auditLog.username}</div>
                      </div>
                    </div>
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Resource
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div>
                      <div className="font-medium">{auditLog.resource_type}</div>
                      {auditLog.resource_id && (
                        <div className="text-gray-500">ID: {auditLog.resource_id}</div>
                      )}
                    </div>
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                    IP Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {auditLog.ip_address || '-'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <DevicePhoneMobileIcon className="h-4 w-4 mr-2 text-gray-400" />
                    User Agent
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {auditLog.user_agent || '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Value Changes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Value Changes
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {renderValueChanges()}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Audit log not found
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogDetails;