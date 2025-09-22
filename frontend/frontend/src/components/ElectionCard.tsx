'use client';

import { useAccount } from 'wagmi';
import { useVotingContract, Election } from '@/hooks/useVotingContract';

interface ElectionCardProps {
  election: Election;
  onVote: () => void;
  onViewResults: () => void;
}

export function ElectionCard({ election, onVote, onViewResults }: ElectionCardProps) {
  const { address } = useAccount();
  const { voterInfo } = useVotingContract();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Ended':
        return 'bg-gray-100 text-gray-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    if (election.status === 'Upcoming') {
      const timeToStart = election.startTime - now;
      return {
        text: 'Starts in',
        value: formatTimeRemaining(timeToStart),
      };
    } else if (election.status === 'Active') {
      const timeToEnd = election.endTime - now;
      return {
        text: 'Ends in',
        value: formatTimeRemaining(timeToEnd),
      };
    }
    return null;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Now';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const canVote = () => {
    return (
      address &&
      voterInfo?.isRegistered &&
      voterInfo?.isVerified &&
      election.status === 'Active' &&
      !(election as any).userHasVoted
    );
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                {election.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{election.description}</p>
          </div>
        </div>

        {/* Election Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Voting Period</p>
            <p className="text-gray-900">{formatDate(election.startTime)}</p>
            <p className="text-gray-900">to {formatDate(election.endTime)}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium mb-1">Candidates</p>
            <p className="text-gray-900">{election.candidates.length} candidates</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium mb-1">Total Votes</p>
            <p className="text-gray-900">{election.totalVotes} votes cast</p>
          </div>
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{timeRemaining.text}</span>
              <span className="text-sm font-medium text-gray-900">{timeRemaining.value}</span>
            </div>
          </div>
        )}

        {/* Candidates Preview */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Candidates:</p>
          <div className="flex flex-wrap gap-2">
            {election.candidates.slice(0, 3).map((candidate, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {candidate}
              </span>
            ))}
            {election.candidates.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                +{election.candidates.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Vote Status */}
        {address && (
          <div className="mb-4">
            {!voterInfo?.isRegistered ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">You need to register as a voter to participate.</p>
              </div>
            ) : !voterInfo?.isVerified ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">Your voter registration is pending verification.</p>
              </div>
            ) : (election as any).userHasVoted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 text-sm font-medium">You have voted in this election</p>
                </div>
              </div>
            ) : election.status !== 'Active' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-700 text-sm">
                  {election.status === 'Upcoming' ? 'Voting has not started yet' : 'Voting has ended'}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {canVote() ? (
            <button
              onClick={onVote}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Vote Now
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              {election.status === 'Upcoming' ? 'Voting Not Started' :
               election.status === 'Ended' ? 'Voting Ended' :
               (election as any).userHasVoted ? 'Already Voted' : 'Cannot Vote'}
            </button>
          )}

          <button
            onClick={onViewResults}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            View Results
          </button>
        </div>

        {/* Election Creator */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Created by: <span className="font-mono">{election.creator.slice(0, 6)}...{election.creator.slice(-4)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}