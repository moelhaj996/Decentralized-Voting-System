'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useVotingContract, Election, ElectionResults } from '@/hooks/useVotingContract';
import { ElectionCard } from './ElectionCard';
import { VotingModal } from './VotingModal';
import { ResultsModal } from './ResultsModal';

export function ElectionList() {
  const { address } = useAccount();
  const { activeElections, allElections, getElection, getElectionResults, hasVoted } = useVotingContract();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [votingModalOpen, setVotingModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [electionResults, setElectionResults] = useState<ElectionResults | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('active');

  useEffect(() => {
    loadElections();
  }, [allElections, activeElections, filter]);

  const loadElections = async () => {
    if (!allElections) return;

    setLoading(true);
    try {
      const electionPromises = allElections.map(async (id) => {
        const election = await getElection(id);
        if (election) {
          // Check if user has voted
          let userHasVoted = false;
          if (address) {
            userHasVoted = await hasVoted(id, address);
          }
          return { ...election, userHasVoted };
        }
        return null;
      });

      const loadedElections = (await Promise.all(electionPromises)).filter(Boolean) as Election[];

      // Apply filter
      let filteredElections = loadedElections;
      if (filter === 'active') {
        filteredElections = loadedElections.filter(e => e.status === 'Active');
      } else if (filter === 'ended') {
        filteredElections = loadedElections.filter(e => e.status === 'Ended');
      }

      setElections(filteredElections);
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (election: Election) => {
    setSelectedElection(election);
    setVotingModalOpen(true);
  };

  const handleViewResults = async (election: Election) => {
    try {
      const results = await getElectionResults(election.id);
      if (results) {
        setElectionResults(results);
        setSelectedElection(election);
        setResultsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const closeModals = () => {
    setVotingModalOpen(false);
    setResultsModalOpen(false);
    setSelectedElection(null);
    setElectionResults(null);
  };

  const onVoteSuccess = () => {
    closeModals();
    loadElections(); // Reload to update vote status
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setFilter('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              filter === 'active'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Elections
            {activeElections && (
              <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs rounded-full px-2 py-1">
                {activeElections.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Elections
            {allElections && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                {allElections.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              filter === 'ended'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ended Elections
          </button>
        </nav>
      </div>

      {/* Elections List */}
      {elections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'active' ? 'No Active Elections' : filter === 'ended' ? 'No Ended Elections' : 'No Elections'}
          </h3>
          <p className="text-gray-500">
            {filter === 'active'
              ? 'There are currently no active elections to vote in.'
              : filter === 'ended'
              ? 'No elections have ended yet.'
              : 'No elections have been created yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {elections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              onVote={() => handleVote(election)}
              onViewResults={() => handleViewResults(election)}
            />
          ))}
        </div>
      )}

      {/* Voting Modal */}
      {votingModalOpen && selectedElection && (
        <VotingModal
          election={selectedElection}
          isOpen={votingModalOpen}
          onClose={closeModals}
          onVoteSuccess={onVoteSuccess}
        />
      )}

      {/* Results Modal */}
      {resultsModalOpen && selectedElection && electionResults && (
        <ResultsModal
          election={selectedElection}
          results={electionResults}
          isOpen={resultsModalOpen}
          onClose={closeModals}
        />
      )}
    </div>
  );
}