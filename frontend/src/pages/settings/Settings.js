import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CubeIcon,
  BellIcon,
  LinkIcon,
  ShieldCheckIcon,
  CloudArrowDownIcon,
  PaintBrushIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Settings components
import OrganizationSettings from './OrganizationSettings';
import UserRolesSettings from './UserRolesSettings';
import POSSettings from './POSSettings';
import InventorySettings from './InventorySettings';
import NotificationSettings from './NotificationSettings';
import IntegrationSettings from './IntegrationSettings';
import ComplianceSettings from './ComplianceSettings';
import BackupSettings from './BackupSettings';
import ThemeSettings from './ThemeSettings';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('organization');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const settingsTabs = [
    {
      id: 'organization',
      name: 'Organization Settings',
      description: 'Store details, tax info, and formats',
      icon: BuildingOfficeIcon,
      component: OrganizationSettings,
    },
    {
      id: 'users',
      name: 'User & Roles',
      description: 'Manage users and their permissions',
      icon: UserGroupIcon,
      component: UserRolesSettings,
    },
    {
      id: 'pos',
      name: 'POS Settings',
      description: 'Payment methods and receipt layout',
      icon: ShoppingCartIcon,
      component: POSSettings,
    },
    {
      id: 'inventory',
      name: 'Inventory Settings',
      description: 'Reorder levels and expiry alerts',
      icon: CubeIcon,
      component: InventorySettings,
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Email/SMS templates and gateways',
      icon: BellIcon,
      component: NotificationSettings,
    },
    {
      id: 'integrations',
      name: 'Integrations',
      description: 'Third-party service connections',
      icon: LinkIcon,
      component: IntegrationSettings,
    },
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Regulatory settings and licenses',
      icon: ShieldCheckIcon,
      component: ComplianceSettings,
    },
    {
      id: 'backup',
      name: 'Backup & Data',
      description: 'Data backup and import/export',
      icon: CloudArrowDownIcon,
      component: BackupSettings,
    },
    {
      id: 'theme',
      name: 'Theme & UI',
      description: 'Appearance and branding',
      icon: PaintBrushIcon,
      component: ThemeSettings,
    },
  ];

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave this tab?')) {
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
      }
    } else {
      setActiveTab(tabId);
    }
  };

  const handleSave = () => {
    // This would be implemented by each component
    setHasUnsavedChanges(false);
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      // This would reset all settings to defaults
      toast.success('Settings reset to defaults!');
      navigate(0); // Refresh the page
    }
  };

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component;

  // Check if current tab's settings are available
  const isCurrentTabAvailable = () => {
    // For now, assume all tabs are available since we use default values
    // In the future, we could check if the API call succeeded
    return true;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy system configuration and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const isAvailable = isCurrentTabAvailable();
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    disabled={!isAvailable}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                        : !isAvailable
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <tab.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          activeTab === tab.id
                            ? 'text-primary-500'
                            : !isAvailable
                            ? 'text-gray-300'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="text-left">
                        <div className={isAvailable ? '' : 'line-through'}>
                          {tab.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tab.description}
                          {!isAvailable && ' (Not Available)'}
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon
                      className={`h-4 w-4 ${
                        activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  hasUnsavedChanges
                    ? 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {ActiveComponent && (
                  <ActiveComponent
                    onSettingsChange={() => setHasUnsavedChanges(true)}
                    onSave={handleSave}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
