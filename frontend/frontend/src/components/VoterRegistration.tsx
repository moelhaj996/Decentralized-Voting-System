'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVotingContract } from '@/hooks/useVotingContract';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Form validation schemas
const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
});

const verifySchema = yup.object().shape({
  voterAddress: yup.string().required('Voter address is required').matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

interface RegisterForm {
  name: string;
}

interface VerifyForm {
  voterAddress: string;
}

export function VoterRegistration() {
  const { address } = useAccount();
  const { voterInfo, registerVoter, verifyVoter, isRegistering, isVerifying } = useVotingContract();
  const [activeForm, setActiveForm] = useState<'register' | 'verify'>('register');

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const {
    register: verifyForm,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: resetVerifyForm,
  } = useForm<VerifyForm>({
    resolver: yupResolver(verifySchema),
  });

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      registerVoter(data.name);
      resetRegisterForm();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const onVerifySubmit = async (data: VerifyForm) => {
    try {
      verifyVoter(data.voterAddress);
      resetVerifyForm();
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Registration Status</h3>

        {!address ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Please connect your wallet to view registration status</p>
          </div>
        ) : voterInfo?.isRegistered ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${voterInfo.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="font-medium text-gray-900">{voterInfo.name}</p>
                <p className="text-sm text-gray-600">
                  Status: {voterInfo.isVerified ? 'Verified Voter' : 'Pending Verification'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">{new Date(voterInfo.registrationTime * 1000).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Elections Voted</p>
                <p className="font-medium">{voterInfo.votedElections}</p>
              </div>
            </div>

            {!voterInfo.isVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  Your registration is pending verification. An authorized verifier will review and approve your registration.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">Not Registered</p>
            <p className="text-gray-500 text-sm">You need to register to participate in elections</p>
          </div>
        )}
      </div>

      {/* Form Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveForm('register')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeForm === 'register'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register as Voter
            </button>
            <button
              onClick={() => setActiveForm('verify')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeForm === 'verify'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verify Voter
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeForm === 'register' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Register as Voter</h3>
                <p className="text-gray-600 text-sm">
                  Register yourself as a voter to participate in elections. You'll need verification from an authorized verifier.
                </p>
              </div>

              {voterInfo?.isRegistered ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">You are already registered as a voter.</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...registerForm('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your full name"
                    />
                    {registerErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.name.message}</p>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Important</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          After registration, you'll need verification from an authorized verifier before you can vote.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registering...</span>
                      </div>
                    ) : (
                      'Register as Voter'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeForm === 'verify' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Voter</h3>
                <p className="text-gray-600 text-sm">
                  If you're an authorized verifier, you can verify registered voters here.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit(onVerifySubmit)} className="space-y-4">
                <div>
                  <label htmlFor="voterAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Voter Address
                  </label>
                  <input
                    type="text"
                    id="voterAddress"
                    {...verifyForm('voterAddress')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0x..."
                  />
                  {verifyErrors.voterAddress && (
                    <p className="mt-1 text-sm text-red-600">{verifyErrors.voterAddress.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-blue-800 text-sm font-medium">Authorized Verifiers Only</p>
                      <p className="text-blue-700 text-sm mt-1">
                        Only addresses authorized by the contract owner can verify voters.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Voter'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}