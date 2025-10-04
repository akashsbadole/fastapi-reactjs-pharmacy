import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const BackupSettings = ({ onSettingsChange, onSave }) => {
  const { backup, isLoading, updateBackupSettings } = useSettings() || {};
  const [backupSettings, setBackupSettings] = useState({});
  const [backupHistory, setBackupHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    if (backup) {
      setBackupSettings(backup);
    }
    fetchBackupHistory();
  }, [backup]);

  const fetchBackupHistory = async () => {
    try {
      const { api } = require('../../services/api');
      const response = await api.get('/api/settings/backup/history');
      setBackupHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch backup history');
    }
  };

  const handleAutomaticBackupChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      automaticBackup: {
        ...prev.automaticBackup,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleCloudBackupChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      cloudBackup: {
        ...prev.cloudBackup,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleLocalBackupChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      localBackup: {
        ...prev.localBackup,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleDataExportChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      dataExport: {
        ...prev.dataExport,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleDataImportChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      dataImport: {
        ...prev.dataImport,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleDataPrivacyChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      dataPrivacy: {
        ...prev.dataPrivacy,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const { api } = require('../../services/api');
      const response = await api.post('/api/settings/backup/create');
      
      // Add new backup to history
      setBackupHistory([response.data, ...backupHistory]);
      
      toast.success('Backup created successfully!');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    try {
      setIsRestoringBackup(true);
      const { api } = require('../../services/api');
      await api.post(`/api/settings/backup/${backupId}/restore`);
      
      toast.success('Backup restored successfully!');
    } catch (error) {
      toast.error('Failed to restore backup');
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      setIsExporting(true);
      const { api } = require('../../services/api');
      const response = await api.post('/api/settings/export', { format });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pharmacy_data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateBackupSettings(backupSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save backup settings');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Backup & Data</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure automatic backups, data import/export, and privacy settings.
        </p>
      </div>

      {/* Automatic Backup */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
          Automatic Backup
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={backupSettings.automaticBackup?.enabled || false}
              onChange={(e) => handleAutomaticBackupChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable automatic backups</label>
          </div>
          
          {backupSettings.automaticBackup?.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                  <select
                    value={backupSettings.automaticBackup?.frequency || 'daily'}
                    onChange={(e) => handleAutomaticBackupChange('frequency', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backup Time</label>
                  <input
                    type="time"
                    value={backupSettings.automaticBackup?.time || '02:00'}
                    onChange={(e) => handleAutomaticBackupChange('time', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={backupSettings.automaticBackup?.retentionDays || 30}
                    onChange={(e) => handleAutomaticBackupChange('retentionDays', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backupSettings.automaticBackup?.compression || false}
                    onChange={(e) => handleAutomaticBackupChange('compression', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Compress backups</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backupSettings.automaticBackup?.encryption || false}
                    onChange={(e) => handleAutomaticBackupChange('encryption', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Encrypt backups</label>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isCreatingBackup ? 'Creating...' : 'Create Backup Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Backup */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CloudArrowUpIcon className="h-5 w-5 mr-2 text-primary-500" />
          Cloud Backup
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={backupSettings.cloudBackup?.enabled || false}
              onChange={(e) => handleCloudBackupChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable cloud backup</label>
          </div>
          
          {backupSettings.cloudBackup?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Provider</label>
                <select
                  value={backupSettings.cloudBackup?.provider || 'aws'}
                  onChange={(e) => handleCloudBackupChange('provider', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="aws">Amazon S3</option>
                  <option value="google">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                  <option value="dropbox">Dropbox</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                  <input
                    type="text"
                    value={backupSettings.cloudBackup?.accessKey || ''}
                    onChange={(e) => handleCloudBackupChange('accessKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={backupSettings.cloudBackup?.secretKey || ''}
                    onChange={(e) => handleCloudBackupChange('secretKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                  <input
                    type="text"
                    value={backupSettings.cloudBackup?.bucket || ''}
                    onChange={(e) => handleCloudBackupChange('bucket', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={backupSettings.cloudBackup?.region || 'us-east-1'}
                    onChange={(e) => handleCloudBackupChange('region', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={backupSettings.cloudBackup?.encryption || false}
                  onChange={(e) => handleCloudBackupChange('encryption', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Encrypt cloud backups</label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-primary-500" />
          Data Export
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Formats</label>
            <div className="space-y-2">
              {['csv', 'json', 'xml'].map(format => (
                <div key={format} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backupSettings.dataExport?.formats?.includes(format) || false}
                    onChange={(e) => {
                      const currentFormats = backupSettings.dataExport?.formats || [];
                      if (e.target.checked) {
                        handleDataExportChange('formats', [...currentFormats, format]);
                      } else {
                        handleDataExportChange('formats', currentFormats.filter(f => f !== format));
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 uppercase">{format}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={backupSettings.dataExport?.dateRange || 'last_month'}
              onChange={(e) => handleDataExportChange('dateRange', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={backupSettings.dataExport?.includeSensitiveData || false}
                onChange={(e) => handleDataExportChange('includeSensitiveData', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Include sensitive data</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={backupSettings.dataExport?.includeImages || false}
                onChange={(e) => handleDataExportChange('includeImages', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Include images/documents</label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(backupSettings.dataExport?.formats || []).map(format => (
              <button
                key={format}
                onClick={() => handleExportData(format)}
                disabled={isExporting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ServerIcon className="h-5 w-5 mr-2 text-primary-500" />
          Backup History
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backupHistory.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backup.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {backup.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {backup.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      backup.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={isRestoringBackup}
                      className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Backup Settings'}
        </button>
      </div>
    </div>
  );
};

export default BackupSettings;