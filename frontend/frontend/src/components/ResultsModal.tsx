'use client';

import { Election, ElectionResults } from '@/hooks/useVotingContract';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsModalProps {
  election: Election;
  results: ElectionResults;
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export function ResultsModal({ election, results, isOpen, onClose }: ResultsModalProps) {
  if (!isOpen) return null;

  const chartData = results.candidates.map((candidate, index) => ({
    name: candidate,
    votes: results.votes[index],
    percentage: election.totalVotes > 0 ? ((results.votes[index] / election.totalVotes) * 100).toFixed(1) : '0',
  }));

  const winner = chartData.reduce((prev, current) =>
    prev.votes > current.votes ? prev : current
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600';
      case 'Upcoming':
        return 'text-blue-600';
      case 'Ended':
        return 'text-gray-600';
      case 'Expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-0 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Election Results</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Election Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${getStatusColor(election.status)}`}>
                  {election.status}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-lg font-semibold text-gray-900">{election.totalVotes}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Candidates</p>
                <p className="text-lg font-semibold text-gray-900">{election.candidates.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Voting Period</p>
                <p className="text-sm text-gray-900">
                  {formatDate(election.startTime)}
                </p>
                <p className="text-sm text-gray-900">
                  to {formatDate(election.endTime)}
                </p>
              </div>
            </div>

            {/* Winner Announcement */}
            {election.totalVotes > 0 && election.status === 'Ended' && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Winner</h4>
                    <p className="text-xl font-bold text-indigo-600">{winner.name}</p>
                    <p className="text-sm text-gray-600">
                      {winner.votes} votes ({winner.percentage}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            {election.totalVotes > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Vote Count</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, 'Votes']}
                        labelFormatter={(label) => `Candidate: ${label}`}
                      />
                      <Bar dataKey="votes" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Vote Share</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="votes"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, 'Votes']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Votes Yet</h3>
                <p className="text-gray-500">
                  No votes have been cast in this election yet.
                </p>
              </div>
            )}

            {/* Detailed Results Table */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Results</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Rank</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Candidate</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Votes</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Percentage</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                      <tr key={candidate.name} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          {candidate.name}
                        </td>
                        <td className="py-3 px-3 text-sm text-right text-gray-900">
                          {candidate.votes}
                        </td>
                        <td className="py-3 px-3 text-sm text-right text-gray-900">
                          {candidate.percentage}%
                        </td>
                        <td className="py-3 px-3 text-sm">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${candidate.percentage}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Election Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">About This Election</h4>
              <p className="text-gray-700">{election.description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Election ID: {election.id} • Created by {election.creator.slice(0, 6)}...{election.creator.slice(-4)}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}