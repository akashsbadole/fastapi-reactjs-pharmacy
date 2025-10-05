import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from 'react-query';
import { api, endpoints } from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, QRCodeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

const TwoFactorSetup = ({ onToggle }) => {
  const { loadUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // Get user data from React Query cache to match Profile page
  const user = queryClient.getQueryData('user-profile');

  useEffect(() => {
    if (user) {
      setIsEnabled(user.two_factor_enabled || false);
    }
  }, [user]);

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(endpoints.AUTH.SETUP_2FA);
      const data = response.data;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(data.provisioning_uri);
      setQrCodeUrl(qrDataUrl);
      
      setSetupData(data);
      setShowSetup(true);
      toast.success('2FA setup initiated. Please scan the QR code.');
    } catch (error) {
      toast.error('Failed to setup 2FA');
      console.error('2FA setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(endpoints.AUTH.VERIFY_2FA, {
        code: verificationCode
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        setIsEnabled(true);
        setShowSetup(false);
        setSetupData(null);
        setVerificationCode('');
        setQrCodeUrl('');
        
        // Reload user data
        await loadUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
      console.error('2FA verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(endpoints.AUTH.DISABLE_2FA);
      
      if (response.data.message) {
        toast.success(response.data.message);
        setIsEnabled(false);
        
        // Reload user data
        await loadUser();
      }
    } catch (error) {
      toast.error('Failed to disable 2FA');
      console.error('2FA disable error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
    setSetupData(null);
    setVerificationCode('');
    setQrCodeUrl('');
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Two-Factor Authentication
          </h3>
        </div>

        <div className="mt-4 max-w-xl text-sm text-gray-600">
          <p>
            Two-factor authentication adds an extra layer of security to your account by requiring 
            a verification code in addition to your password when signing in.
          </p>
        </div>

        <div className="mt-5">
          {isEnabled ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    2FA is enabled
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your account is protected with two-factor authentication.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleDisable2FA}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    2FA is disabled
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your account is not protected with two-factor authentication.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleSetup2FA}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Setting up...' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSetup && setupData && (
          <div className="mt-6 border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Setup Two-Factor Authentication</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Step 1: Scan QR Code</h5>
                <p className="text-sm text-gray-600 mb-4">
                  Use your authenticator app (like Google Authenticator, Authy, or 1Password) to scan this QR code:
                </p>
                <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Can't scan? Use this secret key: <code className="bg-gray-100 px-1 py-0.5 rounded">{setupData.secret}</code>
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Step 2: Enter Verification Code</h5>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="block w-full text-center text-lg font-mono tracking-widest border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleVerify2FA}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSetup}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;