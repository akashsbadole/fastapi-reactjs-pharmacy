import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';
import {
  PaintBrushIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  PhotoIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const ThemeSettings = ({ onSettingsChange, onSave }) => {
  const { theme, isLoading, updateThemeSettings } = useSettings() || {};
  const [themeSettings, setThemeSettings] = useState({
    // Theme Mode
    themeMode: 'light', // light, dark, system
    
    // Color Scheme
    colorScheme: {
      primary: '#3b82f6', // blue-500
      secondary: '#6b7280', // gray-500
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#3b82f6', // blue-500
    },
    
    // Branding
    branding: {
      logo: '',
      favicon: '',
      companyName: 'Pharmacy Management System',
      tagline: 'Your trusted pharmacy partner',
      showLogoInHeader: true,
      showLogoInLogin: true,
      showLogoInReports: true,
    },
    
    // UI Preferences
    ui: {
      compactMode: false,
      showSidebarIcons: true,
      showSidebarLabels: true,
      sidebarCollapsed: false,
      showBreadcrumbs: true,
      showPageTitles: true,
      showFooter: true,
      animationsEnabled: true,
    },
    
    // Print Settings
    print: {
      header: true,
      footer: true,
      logo: true,
      companyName: true,
      date: true,
      pageNumber: true,
      fontSize: 'normal', // small, normal, large
      margins: 'normal', // narrow, normal, wide
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    if (theme) {
      setThemeSettings(theme);
      if (theme.branding?.logo) {
        setLogoPreview(theme.branding.logo);
      }
      if (theme.branding?.favicon) {
        setFaviconPreview(theme.branding.favicon);
      }
    }
  }, [theme]);
  
  // Listen for organization settings changes that might affect theme
  useEffect(() => {
    // This effect will be triggered when theme settings are updated from organization changes
    if (theme && theme.branding) {
      // Force a re-render to ensure the UI reflects the updated values
      setThemeSettings(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          companyName: theme.branding.companyName,
          logo: theme.branding.logo,
        }
      }));
      
      if (theme.branding.logo) {
        setLogoPreview(theme.branding.logo);
      }
    }
  }, [theme?.branding?.companyName, theme?.branding?.logo]);

  const handleThemeModeChange = (mode) => {
    setThemeSettings(prev => ({
      ...prev,
      themeMode: mode,
    }));
    onSettingsChange();
  };

  const handleColorSchemeChange = (color, value) => {
    setThemeSettings(prev => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [color]: value,
      },
    }));
    onSettingsChange();
  };

  const handleBrandingChange = (setting, value) => {
    setThemeSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleUIChange = (setting, value) => {
    setThemeSettings(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };


  const handlePrintChange = (setting, value) => {
    setThemeSettings(prev => ({
      ...prev,
      print: {
        ...prev.print,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleLogoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        handleBrandingChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
        handleBrandingChange('favicon', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateThemeSettings(themeSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTheme = () => {
    if (window.confirm('Are you sure you want to reset all theme settings to defaults?')) {
      // Reset to default theme settings
      setThemeSettings({
        themeMode: 'light',
        colorScheme: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        branding: {
          logo: '',
          favicon: '',
          companyName: 'Pharmacy Management System',
          tagline: 'Your trusted pharmacy partner',
          showLogoInHeader: true,
          showLogoInLogin: true,
          showLogoInReports: true,
        },
        ui: {
          compactMode: false,
          showSidebarIcons: true,
          showSidebarLabels: true,
          sidebarCollapsed: false,
          showBreadcrumbs: true,
          showPageTitles: true,
          showFooter: true,
          animationsEnabled: true,
        },
        print: {
          header: true,
          footer: true,
          logo: true,
          companyName: true,
          date: true,
          pageNumber: true,
          fontSize: 'normal',
          margins: 'normal',
        },
      });
      setLogoPreview('');
      setFaviconPreview('');
      toast.success('Theme settings reset to defaults!');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Theme & UI</h2>
        <p className="text-sm text-gray-500 mb-6">
          Customize the appearance and user interface of your pharmacy system.
        </p>
      </div>

      {/* Theme Mode */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <PaintBrushIcon className="h-5 w-5 mr-2 text-primary-500" />
          Theme Mode
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => handleThemeModeChange('light')}
            className={`flex items-center px-4 py-2 border rounded-md ${
              themeSettings.themeMode === 'light'
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <SunIcon className="h-5 w-5 mr-2" />
            Light
          </button>
          <button
            onClick={() => handleThemeModeChange('dark')}
            className={`flex items-center px-4 py-2 border rounded-md ${
              themeSettings.themeMode === 'dark'
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <MoonIcon className="h-5 w-5 mr-2" />
            Dark
          </button>
          <button
            onClick={() => handleThemeModeChange('system')}
            className={`flex items-center px-4 py-2 border rounded-md ${
              themeSettings.themeMode === 'system'
                ? 'bg-primary-100 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <ComputerDesktopIcon className="h-5 w-5 mr-2" />
            System
          </button>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <SwatchIcon className="h-5 w-5 mr-2 text-primary-500" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(themeSettings.colorScheme).map(([color, value]) => (
            <div key={color}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {color} Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorSchemeChange(color, e.target.value)}
                  className="h-10 w-10 border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorSchemeChange(color, e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <PhotoIcon className="h-5 w-5 mr-2 text-primary-500" />
          Branding
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={themeSettings.branding.companyName}
                onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={themeSettings.branding.tagline}
                onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain" />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleLogoChange(e.target.files[0]);
                      }
                    }}
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
              <div className="flex items-center space-x-4">
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Favicon preview" className="h-8 w-8 object-contain" />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                    <PhotoIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFaviconChange(e.target.files[0]);
                      }
                    }}
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">ICO, PNG 32x32px</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.branding.showLogoInHeader}
                onChange={(e) => handleBrandingChange('showLogoInHeader', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show logo in header</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.branding.showLogoInLogin}
                onChange={(e) => handleBrandingChange('showLogoInLogin', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show logo in login page</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.branding.showLogoInReports}
                onChange={(e) => handleBrandingChange('showLogoInReports', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show logo in reports</label>
            </div>
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ComputerDesktopIcon className="h-5 w-5 mr-2 text-primary-500" />
          UI Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.compactMode}
                onChange={(e) => handleUIChange('compactMode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Compact mode</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.showSidebarIcons}
                onChange={(e) => handleUIChange('showSidebarIcons', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show sidebar icons</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.showSidebarLabels}
                onChange={(e) => handleUIChange('showSidebarLabels', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show sidebar labels</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.showBreadcrumbs}
                onChange={(e) => handleUIChange('showBreadcrumbs', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show breadcrumbs</label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.showPageTitles}
                onChange={(e) => handleUIChange('showPageTitles', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show page titles</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.showFooter}
                onChange={(e) => handleUIChange('showFooter', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Show footer</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.ui.animationsEnabled}
                onChange={(e) => handleUIChange('animationsEnabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Enable animations</label>
            </div>
          </div>
        </div>
      </div>

      {/* Print Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DocumentIcon className="h-5 w-5 mr-2 text-primary-500" />
          Print Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.print.header}
                onChange={(e) => handlePrintChange('header', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Print header</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.print.footer}
                onChange={(e) => handlePrintChange('footer', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Print footer</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.print.logo}
                onChange={(e) => handlePrintChange('logo', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Print logo</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={themeSettings.print.companyName}
                onChange={(e) => handlePrintChange('companyName', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Print company name</label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select
                value={themeSettings.print.fontSize}
                onChange={(e) => handlePrintChange('fontSize', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margins</label>
              <select
                value={themeSettings.print.margins}
                onChange={(e) => handlePrintChange('margins', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleResetTheme}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Theme Settings'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;