import React from 'react';
import { CheckCircle2, Clock, FileEdit, Archive, Calendar } from 'lucide-react';

export const StatusBadge = ({ status, scheduledPublishAt }) => {
  const isScheduled = status === 'DRAFT' || status === 'PENDING_APPROVAL' || status === 'PUBLISHED'
    ? (scheduledPublishAt && new Date(scheduledPublishAt) > new Date())
    : false;

  if (isScheduled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
        <Calendar className="w-3 h-3 text-sky-500" />
        <span>Scheduled ({new Date(scheduledPublishAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
      </span>
    );
  }

  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Published</span>
        </span>
      );
    case 'PENDING_APPROVAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>Pending Approval</span>
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          <FileEdit className="w-3 h-3 text-neutral-400" />
          <span>Draft</span>
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <Archive className="w-3 h-3 text-rose-500" />
          <span>Archived</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Published</span>
        </span>
      );
  }
};
