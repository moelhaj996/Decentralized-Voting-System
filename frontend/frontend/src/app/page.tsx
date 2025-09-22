'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useVotingContract } from '@/hooks/useVotingContract';
import { VoterRegistration } from '@/components/VoterRegistration';
import { ElectionList } from '@/components/ElectionList';
import { CreateElection } from '@/components/CreateElection';
import { useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { voterInfo, electionCount, activeElections } = useVotingContract();
  const [activeTab, setActiveTab] = useState<'vote' | 'create' | 'register'>('vote');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Decentralized Voting System
            </h1>
            <p className="text-gray-600 mb-8">
              Secure, transparent, and tamper-proof elections on the blockchain
            </p>
            <ConnectButton />
            <div className="mt-8 space-y-4 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Immutable voting records</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Real-time transparent results</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Verified voter system</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Voting System
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {voterInfo?.isRegistered ? (
                  <span className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${voterInfo.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span>{voterInfo.name}</span>
                    <span className="text-xs">
                      ({voterInfo.isVerified ? 'Verified' : 'Pending Verification'})
                    </span>
                  </span>
                ) : (
                  <span className="text-orange-600">Not Registered</span>
                )}
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('vote')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vote'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Elections
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Election
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'register'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Voter Registration
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-8">
          {activeTab === 'vote' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Active Elections
                </h2>
                <p className="text-gray-600">
                  Participate in ongoing elections. Make sure you're registered and verified to vote.
                </p>
              </div>

              {!voterInfo?.isRegistered && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">
                    You need to register as a voter before you can participate in elections.
                    Go to the "Voter Registration" tab to get started.
                  </p>
                </div>
              )}

              {!voterInfo?.isVerified && voterInfo?.isRegistered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    Your voter registration is pending verification.
                    You'll be able to vote once an authorized verifier approves your registration.
                  </p>
                </div>
              )}

              <ElectionList />
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Create New Election
                </h2>
                <p className="text-gray-600">
                  Set up a new election with candidates and voting parameters.
                </p>
              </div>
              <CreateElection />
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Voter Registration
                </h2>
                <p className="text-gray-600">
                  Register to participate in elections or verify other voters if you're an authorized verifier.
                </p>
              </div>
              <VoterRegistration />
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">
              {electionCount || 0}
            </div>
            <div className="text-sm text-gray-600">Total Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {activeElections?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Elections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {voterInfo?.votedElections || 0}
            </div>
            <div className="text-sm text-gray-600">Your Votes Cast</div>
          </div>
        </div>
      </main>
    </div>
  );
}