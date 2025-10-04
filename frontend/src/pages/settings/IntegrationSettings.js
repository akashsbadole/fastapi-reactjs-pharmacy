import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import {
  LinkIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CloudIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const IntegrationSettings = ({ onSettingsChange, onSave }) => {
  const { integrations, isLoading, updateIntegrationSettings } = useSettings() || {};
  const [integrationSettings, setIntegrationSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testConnection, setTestConnection] = useState('');

  useEffect(() => {
    if (integrations) {
      setIntegrationSettings(integrations);
    }
  }, [integrations]);

  const handlePaymentGatewayChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      paymentGateway: {
        ...(prev.paymentGateway || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleEprescriptionChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      eprescription: {
        ...(prev.eprescription || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleAccountingChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      accounting: {
        ...(prev.accounting || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleInsuranceProviderChange = (index, setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        providers: (prev.insurance?.providers || []).map((provider, i) =>
          i === index ? { ...provider, [setting]: value } : provider
        ),
      },
    }));
    onSettingsChange();
  };

  const handleCloudStorageChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      cloudStorage: {
        ...(prev.cloudStorage || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleLaboratoryChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      laboratory: {
        ...(prev.laboratory || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleSupplierPortalChange = (setting, value) => {
    setIntegrationSettings(prev => ({
      ...prev,
      supplierPortal: {
        ...(prev.supplierPortal || {}),
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleTestConnection = async (integration) => {
    try {
      setIsTesting(true);
      const { api } = require('../../services/api');
      await api.post(`/api/settings/test-connection/${integration}`);
      
      toast.success(`${integration} connection test successful!`);
    } catch (error) {
      toast.error(`Failed to test ${integration} connection`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateIntegrationSettings(integrationSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save integration settings');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Integration Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure third-party service integrations for payment, accounting, and more.
        </p>
      </div>

      {/* Payment Gateway */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-primary-500" />
          Payment Gateway
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={integrationSettings.paymentGateway?.enabled || false}
              onChange={(e) => handlePaymentGatewayChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable payment gateway</label>
          </div>
          
          {integrationSettings.paymentGateway?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Provider</label>
                <select
                  value={integrationSettings.paymentGateway?.provider || 'stripe'}
                  onChange={(e) => handlePaymentGatewayChange('provider', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                  <option value="square">Square</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={integrationSettings.paymentGateway?.apiKey || ''}
                    onChange={(e) => handlePaymentGatewayChange('apiKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                  <input
                    type="password"
                    value={integrationSettings.paymentGateway?.apiSecret || ''}
                    onChange={(e) => handlePaymentGatewayChange('apiSecret', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <input
                    type="password"
                    value={integrationSettings.paymentGateway?.webhookSecret || ''}
                    onChange={(e) => handlePaymentGatewayChange('webhookSecret', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={integrationSettings.paymentGateway?.testMode || false}
                  onChange={(e) => handlePaymentGatewayChange('testMode', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Test mode</label>
              </div>
              
              <button
                onClick={() => handleTestConnection('Payment Gateway')}
                disabled={isTesting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* E-prescription */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-500" />
          E-prescription Integration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={integrationSettings.eprescription?.enabled || false}
              onChange={(e) => handleEprescriptionChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable e-prescription integration</label>
          </div>
          
          {integrationSettings.eprescription?.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={integrationSettings.eprescription?.apiKey || ''}
                    onChange={(e) => handleEprescriptionChange('apiKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                  <input
                    type="url"
                    value={integrationSettings.eprescription?.apiEndpoint || ''}
                    onChange={(e) => handleEprescriptionChange('apiEndpoint', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={integrationSettings.eprescription?.autoImport || false}
                  onChange={(e) => handleEprescriptionChange('autoImport', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Automatically import e-prescriptions</label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Accounting Software */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CalculatorIcon className="h-5 w-5 mr-2 text-primary-500" />
          Accounting Software Integration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={integrationSettings.accounting?.enabled || false}
              onChange={(e) => handleAccountingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable accounting integration</label>
          </div>
          
          {integrationSettings.accounting?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accounting Software</label>
                <select
                  value={integrationSettings.accounting?.provider || 'none'}
                  onChange={(e) => handleAccountingChange('provider', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="none">Select Software</option>
                  <option value="tally">Tally</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="zoho">Zoho Books</option>
                </select>
              </div>
              
              {integrationSettings.accounting?.provider !== 'none' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="text"
                        value={integrationSettings.accounting?.apiKey || ''}
                        onChange={(e) => handleAccountingChange('apiKey', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Code</label>
                      <input
                        type="text"
                        value={integrationSettings.accounting?.companyCode || ''}
                        onChange={(e) => handleAccountingChange('companyCode', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
                    <select
                      value={integrationSettings.accounting?.syncFrequency || 'daily'}
                      onChange={(e) => handleAccountingChange('syncFrequency', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={integrationSettings.accounting?.autoSync || false}
                      onChange={(e) => handleAccountingChange('autoSync', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable automatic sync</label>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Insurance Providers */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-500" />
          Insurance Providers
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={integrationSettings.insurance?.enabled || false}
              onChange={(e) => setIntegrationSettings(prev => ({
                ...prev,
                insurance: {
                  ...(prev.insurance || {}),
                  enabled: e.target.checked,
                },
              }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable insurance integration</label>
          </div>
          
          {integrationSettings.insurance?.enabled && (
            <div className="space-y-4">
              {(integrationSettings.insurance?.providers || []).map((provider, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => handleInsuranceProviderChange(index, 'name', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                      <input
                        type="url"
                        value={provider.apiEndpoint}
                        onChange={(e) => handleInsuranceProviderChange(index, 'apiEndpoint', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input
                      type="text"
                      value={provider.apiKey}
                      onChange={(e) => handleInsuranceProviderChange(index, 'apiKey', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) => handleInsuranceProviderChange(index, 'enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enable this provider</label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cloud Storage */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CloudIcon className="h-5 w-5 mr-2 text-primary-500" />
          Cloud Storage
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={integrationSettings.cloudStorage?.enabled || false}
              onChange={(e) => handleCloudStorageChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable cloud storage</label>
          </div>
          
          {integrationSettings.cloudStorage?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Provider</label>
                <select
                  value={integrationSettings.cloudStorage?.provider || 'aws'}
                  onChange={(e) => handleCloudStorageChange('provider', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="aws">Amazon S3</option>
                  <option value="google">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                  <input
                    type="text"
                    value={integrationSettings.cloudStorage?.accessKey || ''}
                    onChange={(e) => handleCloudStorageChange('accessKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={integrationSettings.cloudStorage?.secretKey || ''}
                    onChange={(e) => handleCloudStorageChange('secretKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                  <input
                    type="text"
                    value={integrationSettings.cloudStorage?.bucket || ''}
                    onChange={(e) => handleCloudStorageChange('bucket', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={integrationSettings.cloudStorage?.region || 'us-east-1'}
                    onChange={(e) => handleCloudStorageChange('region', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
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
          {isSaving ? 'Saving...' : 'Save Integration Settings'}
        </button>
      </div>
    </div>
  );
};

export default IntegrationSettings;