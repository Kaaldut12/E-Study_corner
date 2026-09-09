// frontend/src/components/common/SkeletonLoader.jsx
import React from 'react';

/**
 * Basic Shimmer Box Component
 */
export const SkeletonItem = ({ className = '', style = {} }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={style}
    aria-hidden="true"
  />
);

/**
 * Top Header Banner Skeleton
 * Matches glass-panel glass-card-accent banner layout
 */
export const SkeletonHeader = ({ hasAction = true }) => (
  <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden shadow-2xl skeleton-glow">
    <div className="space-y-3 max-w-xl w-full">
      <div className="flex items-center gap-2">
        <SkeletonItem className="h-5 w-32 rounded-full" />
        <SkeletonItem className="h-4 w-40 rounded-md hidden sm:inline-block opacity-60" />
      </div>
      <SkeletonItem className="h-8 sm:h-9 w-3/4 rounded-xl" />
      <SkeletonItem className="h-4 w-full rounded-lg opacity-75" />
      <SkeletonItem className="h-4 w-4/5 rounded-lg opacity-60" />
    </div>
    {hasAction && (
      <div className="flex items-center gap-3 shrink-0">
        <SkeletonItem className="h-11 w-36 rounded-xl" />
      </div>
    )}
  </div>
);

/**
 * Metric/Stats Grid Skeleton
 */
export const SkeletonStats = ({ count = 4, cols = 4 }) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[4]} gap-4`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel p-5 rounded-2xl space-y-3 skeleton-glow"
        >
          <div className="flex items-center justify-between">
            <SkeletonItem className="h-3.5 w-24 rounded-md" />
            <SkeletonItem className="h-3 w-3 rounded-full" />
          </div>
          <SkeletonItem className="h-8 w-20 rounded-lg" />
          <SkeletonItem className="h-3 w-36 rounded-md opacity-60" />
        </div>
      ))}
    </div>
  );
};

/**
 * Card Grid Skeleton (Assignments, Tasks, Submissions, Faculty Leaves)
 */
export const SkeletonCardList = ({ count = 4, cols = 2 }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[2]} gap-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-5 border border-slate-800/80 skeleton-glow"
        >
          <div className="space-y-4">
            {/* Top row: tags and badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <SkeletonItem className="h-6 w-20 rounded-lg" />
                <SkeletonItem className="h-5 w-24 rounded-md opacity-70" />
              </div>
              <SkeletonItem className="h-6 w-28 rounded-full" />
            </div>

            {/* Title & description */}
            <SkeletonItem className="h-6 w-4/5 rounded-lg" />
            <div className="space-y-2">
              <SkeletonItem className="h-3.5 w-full rounded-md opacity-70" />
              <SkeletonItem className="h-3.5 w-11/12 rounded-md opacity-50" />
            </div>

            {/* Meta chips */}
            <div className="flex items-center gap-3 pt-2">
              <SkeletonItem className="h-4 w-28 rounded-md opacity-60" />
              <SkeletonItem className="h-4 w-20 rounded-md opacity-60" />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <SkeletonItem className="h-4 w-24 rounded-md opacity-50" />
            <SkeletonItem className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Course Catalog Grid Skeleton
 */
export const SkeletonCourseList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-4 skeleton-glow"
      >
        <div className="space-y-3.5">
          {/* Thumbnail preview */}
          <SkeletonItem className="h-40 w-full rounded-2xl" />

          {/* Category & Year */}
          <div className="flex items-center gap-2">
            <SkeletonItem className="h-5 w-20 rounded-md" />
            <SkeletonItem className="h-4 w-16 rounded-md opacity-60" />
          </div>

          {/* Title & Desc */}
          <SkeletonItem className="h-5 w-4/5 rounded-lg" />
          <div className="space-y-1.5">
            <SkeletonItem className="h-3.5 w-full rounded-md opacity-70" />
            <SkeletonItem className="h-3.5 w-3/4 rounded-md opacity-50" />
          </div>
        </div>

        {/* Progress bar or action */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <SkeletonItem className="h-4 w-24 rounded-md opacity-60" />
          <SkeletonItem className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Data Table Skeleton
 * Matches UserManagement / Rosters / Analytics tables
 */
export const SkeletonTable = ({ rows = 6, cols = 5 }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-800/80 glass-panel">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-900/90 border-b border-slate-800">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-6 py-4">
              <SkeletonItem className="h-4 w-24 rounded-md opacity-75" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/60">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className="hover:bg-slate-900/30">
            {/* Col 1: Profile/Avatar + Name + Email */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <SkeletonItem className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 w-36">
                  <SkeletonItem className="h-4 w-28 rounded-md" />
                  <SkeletonItem className="h-3 w-36 rounded-md opacity-60" />
                </div>
              </div>
            </td>

            {/* Col 2: Badge */}
            <td className="px-6 py-4">
              <SkeletonItem className="h-6 w-20 rounded-full" />
            </td>

            {/* Col 3: Details */}
            <td className="px-6 py-4">
              <SkeletonItem className="h-4 w-32 rounded-md opacity-75" />
            </td>

            {/* Col 4: Tags */}
            <td className="px-6 py-4">
              <div className="flex gap-1.5">
                <SkeletonItem className="h-5 w-14 rounded-md" />
                <SkeletonItem className="h-5 w-14 rounded-md opacity-75" />
              </div>
            </td>

            {/* Col 5: Actions */}
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <SkeletonItem className="h-8 w-16 rounded-xl" />
                <SkeletonItem className="h-8 w-16 rounded-xl opacity-70" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Attendance Widget Skeleton
 */
export const SkeletonAttendance = () => (
  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 skeleton-glow">
    <div className="flex items-center gap-4">
      <SkeletonItem className="w-12 h-12 rounded-2xl shrink-0" />
      <div className="space-y-1.5">
        <SkeletonItem className="h-4 w-36 rounded-md" />
        <SkeletonItem className="h-3.5 w-60 rounded-md opacity-60" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <SkeletonItem className="h-10 w-28 rounded-xl" />
      <SkeletonItem className="h-10 w-32 rounded-xl" />
    </div>
  </div>
);

/**
 * Full Role-Specific Dashboard Skeleton
 * Renders within SidebarLayout for seamless transitions
 */
export const SkeletonDashboard = ({ role = 'student' }) => (
  <div className="space-y-6 page-animate">
    {/* Welcome Header */}
    <SkeletonHeader hasAction={true} />

    {/* Attendance Strip for student and teacher */}
    {(role === 'student' || role === 'teacher') && <SkeletonAttendance />}

    {/* Metric Overview Cards */}
    <SkeletonStats count={4} cols={4} />

    {/* Split View Content Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Primary Left Feed / Content Block (2 Cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonItem className="h-5 w-48 rounded-md" />
          <SkeletonItem className="h-4 w-20 rounded-md opacity-60" />
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 skeleton-glow">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <SkeletonItem className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonItem className="h-4 w-2/3 rounded-md" />
                  <SkeletonItem className="h-3 w-1/2 rounded-md opacity-60" />
                </div>
              </div>
              <SkeletonItem className="h-8 w-24 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Right Activity / Quick Actions Panel (1 Col) */}
      <div className="space-y-4">
        <SkeletonItem className="h-5 w-36 rounded-md" />
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 skeleton-glow">
          <SkeletonItem className="h-4 w-32 rounded-md" />
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <SkeletonItem className="w-2.5 h-2.5 rounded-full" />
                  <SkeletonItem className="h-3.5 w-32 rounded-md" />
                </div>
                <SkeletonItem className="h-3 w-12 rounded-md opacity-60" />
              </div>
            ))}
          </div>
          <SkeletonItem className="h-10 w-full rounded-xl mt-2" />
        </div>
      </div>
    </div>
  </div>
);

export default {
  SkeletonItem,
  SkeletonHeader,
  SkeletonStats,
  SkeletonCardList,
  SkeletonCourseList,
  SkeletonTable,
  SkeletonAttendance,
  SkeletonDashboard
};
