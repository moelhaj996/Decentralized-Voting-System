'use client';

import { useState } from 'react';
import { useVotingContract } from '@/hooks/useVotingContract';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const createElectionSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  startDate: yup.string().required('Start date is required'),
  startTime: yup.string().required('Start time is required'),
  endDate: yup.string().required('End date is required'),
  endTime: yup.string().required('End time is required'),
  candidates: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Candidate name is required').min(2, 'Name must be at least 2 characters'),
    })
  ).min(2, 'At least 2 candidates are required'),
});

interface CreateElectionForm {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  candidates: { name: string }[];
}

export function CreateElection() {
  const { createElection, isCreatingElection } = useVotingContract();
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateElectionForm>({
    resolver: yupResolver(createElectionSchema),
    defaultValues: {
      candidates: [{ name: '' }, { name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'candidates',
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateElectionForm) => {
    try {
      // Convert date/time to Unix timestamp
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      const startTime = Math.floor(startDateTime.getTime() / 1000);
      const endTime = Math.floor(endDateTime.getTime() / 1000);

      // Validate times
      if (startTime <= Math.floor(Date.now() / 1000)) {
        alert('Start time must be in the future');
        return;
      }

      if (endTime <= startTime) {
        alert('End time must be after start time');
        return;
      }

      const candidateNames = data.candidates.map(c => c.name).filter(name => name.trim() !== '');

      if (candidateNames.length < 2) {
        alert('At least 2 candidates are required');
        return;
      }

      createElection(
        data.title,
        data.description,
        startTime,
        endTime,
        candidateNames
      );

      // Reset form on success
      reset();
    } catch (error) {
      console.error('Failed to create election:', error);
    }
  };

  const addCandidate = () => {
    append({ name: '' });
  };

  const removeCandidate = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const getDateTimeString = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return '';
    return new Date(`${dateStr}T${timeStr}`).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Create New Election</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  !previewMode
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  previewMode
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!previewMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Basic Information</h4>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Election Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Presidential Election 2024"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe the purpose and details of this election..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Election Schedule</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      {...register('startDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      {...register('startTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      {...register('endDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      {...register('endTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Candidates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Candidates</h4>
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    + Add Candidate
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`candidates.${index}.name` as const)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Candidate ${index + 1} name`}
                        />
                        {errors.candidates?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.candidates[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        disabled={fields.length <= 2}
                        className="text-red-600 hover:text-red-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {errors.candidates && (
                  <p className="text-sm text-red-600">{errors.candidates.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isCreatingElection}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingElection ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Election'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Preview Mode
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {watchedValues.title || 'Election Title'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {watchedValues.description || 'Election description...'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Voting Period</p>
                    <p className="text-sm text-gray-600">
                      {getDateTimeString(watchedValues.startDate, watchedValues.startTime) || 'Start time not set'}
                      {' → '}
                      {getDateTimeString(watchedValues.endDate, watchedValues.endTime) || 'End time not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Candidates</p>
                    <p className="text-sm text-gray-600">
                      {watchedValues.candidates?.filter(c => c.name.trim() !== '').length || 0} candidates
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Candidates</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {watchedValues.candidates?.map((candidate, index) => (
                      candidate.name.trim() && (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}