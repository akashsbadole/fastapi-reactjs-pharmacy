import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

const ComplianceSettings = ({ onSettingsChange, onSave }) => {
  const { compliance, isLoading, updateComplianceSettings } = useSettings() || {};
  const [complianceSettings, setComplianceSettings] = useState({
    regulatory: {
      scheduleH: {
        enabled: false,
        requirePrescription: false,
        recordKeeping: false,
        maxSaleQuantity: 30,
        maxDaysSupply: 30,
      },
      scheduleX: {
        enabled: false,
        requirePrescription: false,
        recordKeeping: false,
        maxSaleQuantity: 7,
        maxDaysSupply: 7,
        specialStorage: false,
      },
      ndps: {
        enabled: false,
        requirePrescription: false,
        recordKeeping: false,
        maxSaleQuantity: 14,
        maxDaysSupply: 14,
        specialStorage: false,
      },
    },
    licenses: {
      pharmacyLicense: {
        number: '',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        reminderDays: 90,
        documentUrl: '',
      },
    },
    audit: {
      enabled: false,
      logLevel: 'info',
      retentionPeriod: 365,
      includeSensitiveData: false,
      emailReports: false,
      reportFrequency: 'monthly',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState('');

  useEffect(() => {
    if (compliance) {
      setComplianceSettings(prevSettings => ({
        ...prevSettings,
        ...compliance,
        regulatory: {
          ...prevSettings.regulatory,
          ...(compliance.regulatory || {}),
        },
        licenses: {
          ...prevSettings.licenses,
          ...(compliance.licenses || {}),
        },
        audit: {
          ...prevSettings.audit,
          ...(compliance.audit || {}),
        },
      }));
    }
  }, [compliance]);

  const handleRegulatoryChange = (schedule, setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      regulatory: {
        ...prev.regulatory,
        [schedule]: {
          ...(prev.regulatory?.[schedule] || {}),
          [setting]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleLicenseChange = (licenseType, setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      licenses: {
        ...prev.licenses,
        [licenseType]: {
          ...(prev.licenses?.[licenseType] || {}),
          [setting]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleAuditChange = (setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      audit: {
        ...(prev.audit || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handlePrivacyChange = (setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      privacy: {
        ...(prev.privacy || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handlePrescriptionChange = (setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      prescription: {
        ...(prev.prescription || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleReportingChange = (setting, value) => {
    setComplianceSettings(prev => ({
      ...prev,
      reporting: {
        ...(prev.reporting || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleDocumentUpload = async (licenseType, file) => {
    try {
      setUploadingDocument(licenseType);
      const { api } = require('../../services/api');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('license_type', licenseType);
      
      const response = await api.post('/api/settings/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      handleLicenseChange(licenseType, 'documentUrl', response.data.url);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument('');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateComplianceSettings(complianceSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save compliance settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance & Regulations</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure regulatory compliance settings, license management, and audit logging.
        </p>
      </div>

      {/* Regulatory Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
          Regulatory Settings
        </h3>
        <div className="space-y-6">
          {/* Schedule H */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={complianceSettings.regulatory.scheduleH.enabled}
                onChange={(e) => handleRegulatoryChange('scheduleH', 'enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900">Schedule H Drugs</label>
            </div>
            
            {complianceSettings.regulatory.scheduleH.enabled && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.scheduleH.requirePrescription}
                    onChange={(e) => handleRegulatoryChange('scheduleH', 'requirePrescription', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Require prescription</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.scheduleH.recordKeeping}
                    onChange={(e) => handleRegulatoryChange('scheduleH', 'recordKeeping', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Maintain records</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Sale Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.scheduleH.maxSaleQuantity}
                      onChange={(e) => handleRegulatoryChange('scheduleH', 'maxSaleQuantity', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Supply</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.scheduleH.maxDaysSupply}
                      onChange={(e) => handleRegulatoryChange('scheduleH', 'maxDaysSupply', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Schedule X */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={complianceSettings.regulatory.scheduleX.enabled}
                onChange={(e) => handleRegulatoryChange('scheduleX', 'enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900">Schedule X Drugs</label>
            </div>
            
            {complianceSettings.regulatory.scheduleX.enabled && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.scheduleX.requirePrescription}
                    onChange={(e) => handleRegulatoryChange('scheduleX', 'requirePrescription', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Require prescription</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.scheduleX.recordKeeping}
                    onChange={(e) => handleRegulatoryChange('scheduleX', 'recordKeeping', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Maintain records</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.scheduleX.specialStorage}
                    onChange={(e) => handleRegulatoryChange('scheduleX', 'specialStorage', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Special storage requirements</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Sale Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.scheduleX.maxSaleQuantity}
                      onChange={(e) => handleRegulatoryChange('scheduleX', 'maxSaleQuantity', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Supply</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.scheduleX.maxDaysSupply}
                      onChange={(e) => handleRegulatoryChange('scheduleX', 'maxDaysSupply', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* NDPS */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={complianceSettings.regulatory.ndps.enabled}
                onChange={(e) => handleRegulatoryChange('ndps', 'enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900">NDPS Drugs</label>
            </div>
            
            {complianceSettings.regulatory.ndps.enabled && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.ndps.requirePrescription}
                    onChange={(e) => handleRegulatoryChange('ndps', 'requirePrescription', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Require prescription</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.ndps.recordKeeping}
                    onChange={(e) => handleRegulatoryChange('ndps', 'recordKeeping', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Maintain records</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={complianceSettings.regulatory.ndps.specialStorage}
                    onChange={(e) => handleRegulatoryChange('ndps', 'specialStorage', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Special storage requirements</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Sale Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.ndps.maxSaleQuantity}
                      onChange={(e) => handleRegulatoryChange('ndps', 'maxSaleQuantity', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Supply</label>
                    <input
                      type="number"
                      min="1"
                      value={complianceSettings.regulatory.ndps.maxDaysSupply}
                      onChange={(e) => handleRegulatoryChange('ndps', 'maxDaysSupply', parseInt(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* License Management */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
          License Management
        </h3>
        <div className="space-y-6">
          {/* Pharmacy License */}
          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pharmacy License</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={complianceSettings.licenses.pharmacyLicense.number}
                  onChange={(e) => handleLicenseChange('pharmacyLicense', 'number', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={complianceSettings.licenses.pharmacyLicense.issuingAuthority}
                  onChange={(e) => handleLicenseChange('pharmacyLicense', 'issuingAuthority', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date</label>
                <input
                  type="date"
                  value={complianceSettings.licenses.pharmacyLicense.issuedDate}
                  onChange={(e) => handleLicenseChange('pharmacyLicense', 'issuedDate', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={complianceSettings.licenses.pharmacyLicense.expiryDate}
                  onChange={(e) => handleLicenseChange('pharmacyLicense', 'expiryDate', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days Before Expiry</label>
                <input
                  type="number"
                  min="1"
                  value={complianceSettings.licenses.pharmacyLicense.reminderDays}
                  onChange={(e) => handleLicenseChange('pharmacyLicense', 'reminderDays', parseInt(e.target.value))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleDocumentUpload('pharmacyLicense', e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {uploadingDocument === 'pharmacyLicense' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
              </div>
              {complianceSettings.licenses.pharmacyLicense.documentUrl && (
                <div className="mt-2">
                  <a
                    href={complianceSettings.licenses.pharmacyLicense.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
          Audit Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={complianceSettings.audit.enabled}
              onChange={(e) => handleAuditChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable audit logging</label>
          </div>
          
          {complianceSettings.audit.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
                <select
                  value={complianceSettings.audit.logLevel}
                  onChange={(e) => handleAuditChange('logLevel', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (days)</label>
                <input
                  type="number"
                  min="1"
                  value={complianceSettings.audit.retentionPeriod}
                  onChange={(e) => handleAuditChange('retentionPeriod', parseInt(e.target.value))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={complianceSettings.audit.includeSensitiveData}
                  onChange={(e) => handleAuditChange('includeSensitiveData', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Include sensitive data in logs</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={complianceSettings.audit.emailReports}
                  onChange={(e) => handleAuditChange('emailReports', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Email audit reports</label>
              </div>
              
              {complianceSettings.audit.emailReports && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Frequency</label>
                  <select
                    value={complianceSettings.audit.reportFrequency}
                    onChange={(e) => handleAuditChange('reportFrequency', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Compliance Settings'}
        </button>
      </div>
    </div>
  );
};

export default ComplianceSettings;