'use client';

import { useState } from 'react';
import { useVotingContract, Election } from '@/hooks/useVotingContract';

interface VotingModalProps {
  election: Election;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess: () => void;
}

export function VotingModal({ election, isOpen, onClose, onVoteSuccess }: VotingModalProps) {
  const { vote, isVoting } = useVotingContract();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [confirmationStep, setConfirmationStep] = useState(false);

  if (!isOpen) return null;

  const handleCandidateSelect = (candidate: string) => {
    setSelectedCandidate(candidate);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return;

    try {
      vote(election.id, selectedCandidate);
      onVoteSuccess();
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const resetModal = () => {
    setSelectedCandidate('');
    setConfirmationStep(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleNext = () => {
    if (selectedCandidate) {
      setConfirmationStep(true);
    }
  };

  const handleBack = () => {
    setConfirmationStep(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {confirmationStep ? 'Confirm Your Vote' : 'Cast Your Vote'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!confirmationStep ? (
            <div className="space-y-4">
              {/* Election Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">{election.title}</h4>
                <p className="text-sm text-gray-600">{election.description}</p>
              </div>

              {/* Candidate Selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select your candidate:
                </p>
                <div className="space-y-2">
                  {election.candidates.map((candidate, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCandidate === candidate
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate}
                        checked={selectedCandidate === candidate}
                        onChange={() => handleCandidateSelect(candidate)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                        selectedCandidate === candidate
                          ? 'border-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCandidate === candidate && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">{candidate}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Important</p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Your vote is permanent and cannot be changed once submitted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedCandidate}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Confirmation */}
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Confirm Your Vote</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Please review your selection before submitting your vote.
                </p>
              </div>

              {/* Vote Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Election</p>
                    <p className="font-medium text-gray-900">{election.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Vote</p>
                    <p className="font-medium text-gray-900">{selectedCandidate}</p>
                  </div>
                </div>
              </div>

              {/* Final Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-800 text-sm font-medium">Final Warning</p>
                    <p className="text-red-700 text-xs mt-1">
                      This action cannot be undone. Your vote will be recorded on the blockchain permanently.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  disabled={isVoting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitVote}
                  disabled={isVoting}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVoting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Vote'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}