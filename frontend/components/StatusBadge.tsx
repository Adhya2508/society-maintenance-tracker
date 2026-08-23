import React from 'react';

export default function StatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';

  if (status === 'OPEN') {
    bgColor = 'bg-amber-100';
    textColor = 'text-amber-800';
  } else if (status === 'IN_PROGRESS') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
  } else if (status === 'RESOLVED') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (status === 'OVERDUE') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
