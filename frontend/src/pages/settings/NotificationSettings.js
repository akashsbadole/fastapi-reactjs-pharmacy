import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const NotificationSettings = ({ onSettingsChange, onSave }) => {
  const { notifications, isLoading, updateNotificationSettings } = useSettings() || {};
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      smtpServer: '',
      smtpPort: 587,
      username: '',
      password: '',
      useSSL: true,
      senderEmail: 'noreply@pharmacy.com',
      senderName: 'Pharmacy System',
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      senderId: 'PHARM',
    },
    whatsapp: {
      enabled: false,
      apiKey: '',
      phoneNumber: '',
      businessId: '',
    },
    notifications: {
      lowStock: { email: true, sms: false, whatsapp: false },
      expiryAlert: { email: true, sms: false, whatsapp: false },
      newOrder: { email: true, sms: false, whatsapp: false },
      paymentReceived: { email: true, sms: false, whatsapp: false },
      prescriptionReady: { email: true, sms: true, whatsapp: false },
      appointmentReminder: { email: true, sms: true, whatsapp: false },
      systemUpdates: { email: true, sms: false, whatsapp: false },
    },
    templates: {
      lowStockEmail: {
        subject: 'Low Stock Alert: {medicine_name}',
        body: 'Dear {recipient_name},\n\nThis is to inform you that the following medicine is running low on stock:\n\nMedicine: {medicine_name}\nCurrent Stock: {current_stock}\nReorder Level: {reorder_level}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System',
      },
      expiryAlertEmail: {
        subject: 'Expiry Alert: {medicine_name}',
        body: 'Dear {recipient_name},\n\nThis is to inform you that the following medicine is expiring soon:\n\nMedicine: {medicine_name}\nBatch: {batch_number}\nExpiry Date: {expiry_date}\nDays Until Expiry: {days_until_expiry}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System',
      },
      prescriptionReadySMS: {
        message: 'Dear {patient_name}, your prescription is ready for pickup. Order ID: {order_id}. Thank you!',
      },
      appointmentReminderSMS: {
        message: 'Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!',
      },
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSMS, setTestSMS] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (notifications) {
      setNotificationSettings(notifications);
    }
  }, [notifications]);

  const handleEmailSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleSMSSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleWhatsAppSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        [setting]: value,
      },
    }));
    onSettingsChange();
  };

  const handleNotificationTypeChange = (type, channel, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: {
          ...prev.notifications[type],
          [channel]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleTemplateChange = (template, field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [template]: {
          ...prev.templates[template],
          [field]: value,
        },
      },
    }));
    onSettingsChange();
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setIsSendingTest(true);
      const { api } = require('../../services/api');
      await api.post('/api/settings/test-email', { email: testEmail });
      
      toast.success(`Test email sent to ${testEmail}!`);
      setTestEmail('');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testSMS) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      setIsSendingTest(true);
      const { api } = require('../../services/api');
      await api.post('/api/settings/test-sms', { phone: testSMS });
      
      toast.success(`Test SMS sent to ${testSMS}!`);
      setTestSMS('');
    } catch (error) {
      toast.error('Failed to send test SMS');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await updateNotificationSettings(notificationSettings);
      
      if (success) {
        // Notify parent component that settings have been saved
        onSave();
      }
    } catch (error) {
      toast.error('Failed to save notification settings');
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure email, SMS, and WhatsApp notifications for various events.
        </p>
      </div>

      {/* Email Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-500" />
          Email Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.email.enabled}
              onChange={(e) => handleEmailSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable email notifications</label>
          </div>
          
          {notificationSettings.email.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
                  <input
                    type="text"
                    value={notificationSettings.email.smtpServer}
                    onChange={(e) => handleEmailSettingChange('smtpServer', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={notificationSettings.email.smtpPort}
                    onChange={(e) => handleEmailSettingChange('smtpPort', parseInt(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={notificationSettings.email.username}
                    onChange={(e) => handleEmailSettingChange('username', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={notificationSettings.email.password}
                    onChange={(e) => handleEmailSettingChange('password', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                  <input
                    type="email"
                    value={notificationSettings.email.senderEmail}
                    onChange={(e) => handleEmailSettingChange('senderEmail', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={notificationSettings.email.senderName}
                    onChange={(e) => handleEmailSettingChange('senderName', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.email.useSSL}
                  onChange={(e) => handleEmailSettingChange('useSSL', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Use SSL/TLS</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to test"
                  className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={isSendingTest}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSendingTest ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SMS Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-primary-500" />
          SMS Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.sms.enabled}
              onChange={(e) => handleSMSSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable SMS notifications</label>
          </div>
          
          {notificationSettings.sms.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Provider</label>
                <select
                  value={notificationSettings.sms.provider}
                  onChange={(e) => handleSMSSettingChange('provider', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="twilio">Twilio</option>
                  <option value="msg91">MSG91</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="text"
                    value={notificationSettings.sms.apiKey}
                    onChange={(e) => handleSMSSettingChange('apiKey', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                  <input
                    type="password"
                    value={notificationSettings.sms.apiSecret}
                    onChange={(e) => handleSMSSettingChange('apiSecret', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                  <input
                    type="text"
                    value={notificationSettings.sms.senderId}
                    onChange={(e) => handleSMSSettingChange('senderId', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={testSMS}
                  onChange={(e) => setTestSMS(e.target.value)}
                  placeholder="Enter phone number to test"
                  className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <button
                  onClick={handleTestSMS}
                  disabled={isSendingTest}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSendingTest ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-500" />
          WhatsApp Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={notificationSettings.whatsapp.enabled}
              onChange={(e) => handleWhatsAppSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Enable WhatsApp notifications</label>
          </div>
          
          {notificationSettings.whatsapp.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={notificationSettings.whatsapp.apiKey}
                  onChange={(e) => handleWhatsAppSettingChange('apiKey', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={notificationSettings.whatsapp.phoneNumber}
                  onChange={(e) => handleWhatsAppSettingChange('phoneNumber', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business ID</label>
                <input
                  type="text"
                  value={notificationSettings.whatsapp.businessId}
                  onChange={(e) => handleWhatsAppSettingChange('businessId', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <PaperAirplaneIcon className="h-5 w-5 mr-2 text-primary-500" />
          Email Templates
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Email</label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={notificationSettings.templates?.lowStockEmail?.subject || ''}
                  onChange={(e) => handleTemplateChange('lowStockEmail', 'subject', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Body</label>
                <textarea
                  rows={4}
                  value={notificationSettings.templates?.lowStockEmail?.body || ''}
                  onChange={(e) => handleTemplateChange('lowStockEmail', 'body', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{medicine_name}'}, {'{current_stock}'}, {'{reorder_level}'}, {'{recipient_name}'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Alert Email</label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={notificationSettings.templates?.expiryAlertEmail?.subject || ''}
                  onChange={(e) => handleTemplateChange('expiryAlertEmail', 'subject', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Body</label>
                <textarea
                  rows={4}
                  value={notificationSettings.templates?.expiryAlertEmail?.body || ''}
                  onChange={(e) => handleTemplateChange('expiryAlertEmail', 'body', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{medicine_name}'}, {'{batch_number}'}, {'{expiry_date}'}, {'{days_until_expiry}'}, {'{recipient_name}'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Templates */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-primary-500" />
          SMS Templates
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Ready SMS</label>
            <textarea
              rows={2}
              value={notificationSettings.templates?.prescriptionReadySMS?.message || ''}
              onChange={(e) => handleTemplateChange('prescriptionReadySMS', 'message', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{patient_name}'}, {'{order_id}'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Reminder SMS</label>
            <textarea
              rows={2}
              value={notificationSettings.templates?.appointmentReminderSMS?.message || ''}
              onChange={(e) => handleTemplateChange('appointmentReminderSMS', 'message', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{patient_name}'}, {'{appointment_date}'}, {'{appointment_time}'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-primary-500" />
          Notification Types
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(notificationSettings.notifications || {}).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={value?.email || false}
                      onChange={(e) => handleNotificationTypeChange(key, 'email', e.target.checked)}
                      disabled={!notificationSettings.email?.enabled}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={value?.sms || false}
                      onChange={(e) => handleNotificationTypeChange(key, 'sms', e.target.checked)}
                      disabled={!notificationSettings.sms?.enabled}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={value?.whatsapp || false}
                      onChange={(e) => handleNotificationTypeChange(key, 'whatsapp', e.target.checked)}
                      disabled={!notificationSettings.whatsapp?.enabled}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
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
          {isSaving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;