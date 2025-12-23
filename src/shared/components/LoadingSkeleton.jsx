import React from 'react';

/**
 * Reusable Loading Skeleton Components
 * Provides consistent loading states across the application
 */

// Basic skeleton bar
export const SkeletonBar = ({ className = '', width = 'w-full' }) => (
  <div className={`h-4 bg-gray-200 rounded animate-pulse ${width} ${className}`} />
);

// Skeleton for text lines
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, idx) => (
      <SkeletonBar key={idx} width={idx === lines - 1 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

// Skeleton for cards
export const SkeletonCard = ({ className = '' }) => (
  <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonBar width="w-1/2" />
        <SkeletonBar width="w-full" />
        <SkeletonBar width="w-3/4" />
      </div>
    </div>
  </div>
);

// Skeleton for table rows
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-gray-200">
    {[...Array(columns)].map((_, idx) => (
      <td key={idx} className="px-4 py-3">
        <SkeletonBar />
      </td>
    ))}
  </tr>
);

// Skeleton for table
export const SkeletonTable = ({ rows = 5, columns = 5, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          {[...Array(columns)].map((_, idx) => (
            <th key={idx} className="px-4 py-3">
              <SkeletonBar width="w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, idx) => (
          <SkeletonTableRow key={idx} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton for match card
export const SkeletonMatchCard = ({ className = '' }) => (
  <div className={`rounded-3xl border border-gray-200 bg-white p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <SkeletonBar width="w-32" />
      <SkeletonBar width="w-20" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <SkeletonBar width="w-32" />
      </div>
      <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex items-center gap-3 flex-1 justify-end">
        <SkeletonBar width="w-32" />
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// Skeleton for team card
export const SkeletonTeamCard = ({ className = '' }) => (
  <div className={`rounded-3xl border border-gray-200 bg-white p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="flex-1 space-y-2">
        <SkeletonBar width="w-32" />
        <SkeletonBar width="w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBar />
      <SkeletonBar />
      <SkeletonBar width="w-3/4" />
    </div>
  </div>
);

// Generic loading spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

// Full page loading
export const PageLoading = ({ message = 'Đang tải...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Section loading
export const SectionLoading = ({ message = 'Đang tải...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="md" className="mb-3" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

export default {
  Bar: SkeletonBar,
  Text: SkeletonText,
  Card: SkeletonCard,
  TableRow: SkeletonTableRow,
  Table: SkeletonTable,
  MatchCard: SkeletonMatchCard,
  TeamCard: SkeletonTeamCard,
  Spinner: LoadingSpinner,
  Page: PageLoading,
  Section: SectionLoading
};
