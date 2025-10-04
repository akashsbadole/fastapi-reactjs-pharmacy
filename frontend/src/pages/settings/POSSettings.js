import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';
import {
  CreditCardIcon,
  PrinterIcon,
  QrCodeIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

const POSSettings = ({ onSettingsChange, onSave }) => {
  const { pos, isLoading, updatePOSSettings } = useSettings() || {};
  const [posSettings, setPosSettings] = useState({
    // Payment Methods
    paymentMethods: {
      cash: { enabled: true, name: 'Cash' },
      card: { enabled: true, name: 'Card' },
      upi: { enabled: false, name: 'UPI' },
      wallet: { enabled: false, name: 'Wallet' },
      insurance: { enabled: false, name: 'Insurance' },
    },
    
    // Barcode Settings
    barcodeScanning: {
      enabled: true,
      autoAddToCart: true,
      scannerType: 'usb', // usb, camera, bluetooth
      soundEnabled: true,
    },
    
    // Receipt Settings
    receipt: {
      printAutomatically: true,
      showCustomerDetails: true,
      showItemDetails: true,
      showPaymentDetails: true,
      showBarcode: false,
      showQrCode: false,
      headerText: 'Thank you for visiting!',
      footerText: 'Please come again!',
      logoSize: 'medium', // small, medium, large
      fontSize: 'normal', // small, normal, large
      currency: 'USD', // Default currency
    },
    
    // Discount Settings
    discount: {
      enabled: true,
      maxDiscountPercentage: 20,
      requireManagerApproval: true,
      approvalThreshold: 10,
      defaultDiscountReason: 'Special Discount',
    },
    
    // Terminal Settings
    terminal: {
      terminalId: 'POS-01',
      counterName: 'Main Counter',
      cashDrawer: { enabled: true, autoOpen: true },
      display: { showCustomerDisplay: true, customerDisplayType: 'lcd' },
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pos) {
      setPosSettings(pos);
    }
  }, [pos]);

  const handlePaymentMethodToggle = (method) => {
    setPosSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          enabled: !prev.paymentMethods[method].enabled,
        },
      },
    }));
    onSettingsChange();
  };

  const handlePaymentMethodNameChange = (method, name) => {
    setPosSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          name,
        },
      },
    }));
    onSettingsChange();
  };

  const handleBarcodeSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      barcodeScanning: {
        ...prev.barcodeScanning,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleReceiptSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      receipt: {
        ...prev.receipt,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleDiscountSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleTaxSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      tax: {
        ...prev.tax,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleTaxCategoryToggle = (index) => {
    setPosSettings(prev => ({
      ...prev,
      tax: {
        ...prev.tax,
        taxCategories: prev.tax.taxCategories.map((category, i) =>
          i === index ? { ...category, enabled: !category.enabled } : category
        ),
      },
    }));
    onSettingsChange();
  };

  const handleTaxCategoryRateChange = (index, rate) => {
    setPosSettings(prev => ({
      ...prev,
      tax: {
        ...prev.tax,
        taxCategories: prev.tax.taxCategories.map((category, i) =>
          i === index ? { ...category, rate } : category
        ),
      },
    }));
    onSettingsChange();
  };

  const handleTerminalSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      terminal: {
        ...prev.terminal,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleCashDrawerSettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      terminal: {
        ...prev.terminal,
        cashDrawer: {
          ...prev.terminal.cashDrawer,
          [setting]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleDisplaySettingChange = (setting, value) => {
    setPosSettings(prev => ({
      ...prev,
      terminal: {
        ...prev.terminal,
        display: {
          ...prev.terminal.display,
          [setting]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updatePOSSettings(posSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save POS settings');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">POS Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure payment methods, receipt layout, and terminal settings for your Point of Sale system.
        </p>
      </div>

      {/* Payment Methods */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-primary-500" />
          Payment Methods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(posSettings.paymentMethods).map(([key, method]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => handlePaymentMethodToggle(key)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <input
                    type="text"
                    value={method.name}
                    onChange={(e) => handlePaymentMethodNameChange(key, e.target.value)}
                    disabled={!method.enabled}
                    className="text-sm font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 capitalize">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Barcode Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2 text-primary-500" />
          Barcode Scanning
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={posSettings.barcodeScanning.enabled}
              onChange={(e) => handleBarcodeSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable barcode scanning</label>
          </div>
          
          {posSettings.barcodeScanning.enabled && (
            <>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={posSettings.barcodeScanning.autoAddToCart}
                  onChange={(e) => handleBarcodeSettingChange('autoAddToCart', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Automatically add scanned items to cart</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={posSettings.barcodeScanning.soundEnabled}
                  onChange={(e) => handleBarcodeSettingChange('soundEnabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Enable sound on successful scan</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scanner Type</label>
                <select
                  value={posSettings.barcodeScanning.scannerType}
                  onChange={(e) => handleBarcodeSettingChange('scannerType', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="usb">USB Scanner</option>
                  <option value="camera">Camera Scanner</option>
                  <option value="bluetooth">Bluetooth Scanner</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <PrinterIcon className="h-5 w-5 mr-2 text-primary-500" />
          Receipt Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={posSettings.receipt.printAutomatically}
              onChange={(e) => handleReceiptSettingChange('printAutomatically', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Print receipt automatically after sale</label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={posSettings.receipt.showCustomerDetails}
                onChange={(e) => handleReceiptSettingChange('showCustomerDetails', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show customer details</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={posSettings.receipt.showItemDetails}
                onChange={(e) => handleReceiptSettingChange('showItemDetails', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show detailed item information</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={posSettings.receipt.showPaymentDetails}
                onChange={(e) => handleReceiptSettingChange('showPaymentDetails', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show payment breakdown</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={posSettings.receipt.showBarcode}
                onChange={(e) => handleReceiptSettingChange('showBarcode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show barcode on receipt</label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
            <input
              type="text"
              value={posSettings.receipt.headerText}
              onChange={(e) => handleReceiptSettingChange('headerText', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <input
              type="text"
              value={posSettings.receipt.footerText}
              onChange={(e) => handleReceiptSettingChange('footerText', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Discount Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ReceiptPercentIcon className="h-5 w-5 mr-2 text-primary-500" />
          Discount Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={posSettings.discount.enabled}
              onChange={(e) => handleDiscountSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable discounts</label>
          </div>
          
          {posSettings.discount.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={posSettings.discount.maxDiscountPercentage}
                  onChange={(e) => handleDiscountSettingChange('maxDiscountPercentage', parseInt(e.target.value))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={posSettings.discount.requireManagerApproval}
                  onChange={(e) => handleDiscountSettingChange('requireManagerApproval', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Require manager approval for discounts</label>
              </div>
              
              {posSettings.discount.requireManagerApproval && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={posSettings.discount.approvalThreshold}
                    onChange={(e) => handleDiscountSettingChange('approvalThreshold', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Terminal Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ComputerDesktopIcon className="h-5 w-5 mr-2 text-primary-500" />
          Terminal Settings
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terminal ID</label>
              <input
                type="text"
                value={posSettings.terminal.terminalId}
                onChange={(e) => handleTerminalSettingChange('terminalId', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Counter Name</label>
              <input
                type="text"
                value={posSettings.terminal.counterName}
                onChange={(e) => handleTerminalSettingChange('counterName', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Cash Drawer</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={posSettings.terminal.cashDrawer.enabled}
                onChange={(e) => handleCashDrawerSettingChange('enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Enable cash drawer</label>
            </div>
            
            {posSettings.terminal.cashDrawer.enabled && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={posSettings.terminal.cashDrawer.autoOpen}
                  onChange={(e) => handleCashDrawerSettingChange('autoOpen', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Automatically open cash drawer on cash payment</label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save POS Settings'}
        </button>
      </div>
    </div>
  );
};

export default POSSettings;