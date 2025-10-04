import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TagIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const InventorySettings = ({ onSettingsChange, onSave }) => {
  const { inventory, isLoading, updateInventorySettings } = useSettings() || {};
  const [suppliers, setSuppliers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [inventorySettings, setInventorySettings] = useState({
    reorder: {
      defaultReorderLevel: 20,
      defaultReorderQuantity: 100,
      enableAutoReorder: false,
      autoReorderSuppliers: [],
    },
    expiry: {
      enabled: true,
      alertDaysBefore: 30,
      criticalAlertDaysBefore: 7,
      dailyAlerts: true,
      weeklyAlerts: true,
      alertEmails: ['manager@pharmacy.com'],
    },
    lowStock: {
      enabled: true,
      alertThreshold: 10,
      criticalThreshold: 5,
      dailyAlerts: true,
      weeklyAlerts: true,
      alertEmails: ['manager@pharmacy.com'],
    },
    alternatives: {
      enabled: true,
      autoSuggestAlternatives: true,
      requirePharmacistApproval: true,
      mappingRules: [
        { condition: 'out_of_stock', action: 'suggest_alternatives' },
        { condition: 'higher_price', action: 'suggest_cheaper' },
        { condition: 'same_generic', action: 'suggest_generic' },
      ],
    },
    batchPricing: {
      enabled: false,
      allowDifferentPrices: true,
      defaultPricingMethod: 'fifo',
      priceChangeApproval: true,
    },
    stockMovement: {
      trackAllMovements: true,
      requireReasonForAdjustments: true,
      autoLogSales: true,
      autoLogPurchases: true,
      adjustmentReasons: [
        'Damage', 'Theft', 'Expired', 'Return', 'Correction', 'Transfer',
      ],
    },
  });

  useEffect(() => {
    if (inventory) {
      setInventorySettings(inventory);
      fetchSuppliers();
    }
  }, [inventory]);

  const fetchSuppliers = async () => {
    try {
      const { api } = require('../../services/api');
      const response = await api.get('/api/inventory/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      // Fallback to mock data if API fails
      const mockSuppliers = [
        { id: 1, name: 'MediSupply Corp' },
        { id: 2, name: 'PharmaDistributor Ltd' },
        { id: 3, name: 'HealthSource Inc' },
      ];
      setSuppliers(mockSuppliers);
    }
  };

  const handleReorderSettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      reorder: {
        ...prev.reorder,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleExpirySettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      expiry: {
        ...prev.expiry,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleLowStockSettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      lowStock: {
        ...prev.lowStock,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleAlternativesSettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      alternatives: {
        ...prev.alternatives,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleBatchPricingSettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      batchPricing: {
        ...prev.batchPricing,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleStockMovementSettingChange = (setting, value) => {
    setInventorySettings(prev => ({
      ...prev,
      stockMovement: {
        ...prev.stockMovement,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleAutoReorderSupplierToggle = (supplierId) => {
    const currentSuppliers = inventorySettings.reorder.autoReorderSuppliers;
    const updatedSuppliers = currentSuppliers.includes(supplierId)
      ? currentSuppliers.filter(id => id !== supplierId)
      : [...currentSuppliers, supplierId];
    
    handleReorderSettingChange('autoReorderSuppliers', updatedSuppliers);
  };

  const handleAddAlertEmail = (alertType, email) => {
    if (!email) return;
    
    const currentEmails = inventorySettings[alertType].alertEmails;
    if (!currentEmails.includes(email)) {
      const updatedEmails = [...currentEmails, email];
      if (alertType === 'expiry') {
        handleExpirySettingChange('alertEmails', updatedEmails);
      } else if (alertType === 'lowStock') {
        handleLowStockSettingChange('alertEmails', updatedEmails);
      }
    }
  };

  const handleRemoveAlertEmail = (alertType, index) => {
    const currentEmails = inventorySettings[alertType].alertEmails;
    const updatedEmails = currentEmails.filter((_, i) => i !== index);
    
    if (alertType === 'expiry') {
      handleExpirySettingChange('alertEmails', updatedEmails);
    } else if (alertType === 'lowStock') {
      handleLowStockSettingChange('alertEmails', updatedEmails);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateInventorySettings(inventorySettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save inventory settings');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure reorder levels, expiry alerts, and inventory management preferences.
        </p>
      </div>

      {/* Reorder Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ArrowPathIcon className="h-5 w-5 mr-2 text-primary-500" />
          Reorder Settings
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={inventorySettings.reorder.defaultReorderLevel}
                onChange={(e) => handleReorderSettingChange('defaultReorderLevel', parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Reorder Quantity
              </label>
              <input
                type="number"
                min="1"
                value={inventorySettings.reorder.defaultReorderQuantity}
                onChange={(e) => handleReorderSettingChange('defaultReorderQuantity', parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={inventorySettings.reorder.enableAutoReorder}
              onChange={(e) => handleReorderSettingChange('enableAutoReorder', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable automatic reordering</label>
          </div>
          
          {inventorySettings.reorder.enableAutoReorder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Suppliers for Auto Reorder
              </label>
              <div className="space-y-2">
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inventorySettings.reorder.autoReorderSuppliers.includes(supplier.id)}
                      onChange={() => handleAutoReorderSupplierToggle(supplier.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">{supplier.name}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expiry Alerts */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-primary-500" />
          Expiry Alerts
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={inventorySettings.expiry.enabled}
              onChange={(e) => handleExpirySettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable expiry alerts</label>
          </div>
          
          {inventorySettings.expiry.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Days Before Expiry
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inventorySettings.expiry.alertDaysBefore}
                    onChange={(e) => handleExpirySettingChange('alertDaysBefore', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critical Alert Days Before Expiry
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={inventorySettings.expiry.alertDaysBefore}
                    value={inventorySettings.expiry.criticalAlertDaysBefore}
                    onChange={(e) => handleExpirySettingChange('criticalAlertDaysBefore', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inventorySettings.expiry.dailyAlerts}
                    onChange={(e) => handleExpirySettingChange('dailyAlerts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send daily alerts</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inventorySettings.expiry.weeklyAlerts}
                    onChange={(e) => handleExpirySettingChange('weeklyAlerts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send weekly summary</label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Email Recipients
                </label>
                <div className="space-y-2">
                  {inventorySettings.expiry.alertEmails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...inventorySettings.expiry.alertEmails];
                          newEmails[index] = e.target.value;
                          handleExpirySettingChange('alertEmails', newEmails);
                        }}
                        className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAlertEmail('expiry', index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="Add email address"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddAlertEmail('expiry', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add email address"]');
                        if (input && input.value) {
                          handleAddAlertEmail('expiry', input.value);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <BellAlertIcon className="h-5 w-5 mr-2 text-primary-500" />
          Low Stock Alerts
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={inventorySettings.lowStock.enabled}
              onChange={(e) => handleLowStockSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable low stock alerts</label>
          </div>
          
          {inventorySettings.lowStock.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inventorySettings.lowStock.alertThreshold}
                    onChange={(e) => handleLowStockSettingChange('alertThreshold', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critical Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={inventorySettings.lowStock.alertThreshold}
                    value={inventorySettings.lowStock.criticalThreshold}
                    onChange={(e) => handleLowStockSettingChange('criticalThreshold', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inventorySettings.lowStock.dailyAlerts}
                    onChange={(e) => handleLowStockSettingChange('dailyAlerts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send daily alerts</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inventorySettings.lowStock.weeklyAlerts}
                    onChange={(e) => handleLowStockSettingChange('weeklyAlerts', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send weekly summary</label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alternative Medicine Mapping */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-primary-500" />
          Alternative Medicine Mapping
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={inventorySettings.alternatives.enabled}
              onChange={(e) => handleAlternativesSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable alternative medicine suggestions</label>
          </div>
          
          {inventorySettings.alternatives.enabled && (
            <>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventorySettings.alternatives.autoSuggestAlternatives}
                  onChange={(e) => handleAlternativesSettingChange('autoSuggestAlternatives', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Automatically suggest alternatives</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventorySettings.alternatives.requirePharmacistApproval}
                  onChange={(e) => handleAlternativesSettingChange('requirePharmacistApproval', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Require pharmacist approval for alternatives</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mapping Rules</label>
                <div className="space-y-2">
                  {inventorySettings.alternatives.mappingRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="text-sm text-gray-700">
                        When <span className="font-medium">{rule.condition.replace('_', ' ')}</span>, 
                        <span className="font-medium"> {rule.action.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch Pricing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CubeIcon className="h-5 w-5 mr-2 text-primary-500" />
          Batch Pricing
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={inventorySettings.batchPricing.enabled}
              onChange={(e) => handleBatchPricingSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable batch-wise pricing</label>
          </div>
          
          {inventorySettings.batchPricing.enabled && (
            <>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventorySettings.batchPricing.allowDifferentPrices}
                  onChange={(e) => handleBatchPricingSettingChange('allowDifferentPrices', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Allow different prices for different batches</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Pricing Method</label>
                <select
                  value={inventorySettings.batchPricing.defaultPricingMethod}
                  onChange={(e) => handleBatchPricingSettingChange('defaultPricingMethod', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="fifo">First In, First Out (FIFO)</option>
                  <option value="lifo">Last In, First Out (LIFO)</option>
                  <option value="average">Average Cost</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={inventorySettings.batchPricing.priceChangeApproval}
                  onChange={(e) => handleBatchPricingSettingChange('priceChangeApproval', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Require approval for price changes</label>
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
          {isSaving ? 'Saving...' : 'Save Inventory Settings'}
        </button>
      </div>
    </div>
  );
};

export default InventorySettings;