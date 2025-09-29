"use client";

import { players } from "../data/players";

interface PitchingOrderProps {
  pitchingOrder: { inning: number; pitcher: string }[];
  isGenerated: boolean;
}

export default function PitchingOrder({
  pitchingOrder,
  isGenerated,
}: PitchingOrderProps) {
  // Filter players to get pitcher information
  const getPitcherInfo = (pitcherName: string) => {
    const pitcher = players.find(p => p.name === pitcherName);
    return pitcher ? {
      name: pitcher.name,
      priority: pitcher.pitchingPriority,
      preferredPosition: pitcher.preferredPosition
    } : null;
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return "Primary";
      case 2: return "Secondary";
      case 3: return "Tertiary";
      default: return "Emergency";
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200";
      case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  if (!isGenerated || pitchingOrder.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pitching Order
          </h3>
          <p className="text-gray-600">
            Generate game setup to see pitching assignments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pitching Order</h1>
        <div className="text-sm text-gray-600">
          {pitchingOrder.length} innings scheduled
        </div>
      </div>

      {/* Pitcher Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Pitcher Priority Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(priority => {
            const pitcher = players.find(p => p.pitchingPriority === priority);
            if (!pitcher) return null;
            
            return (
              <div key={priority} className={`px-3 py-2 rounded-lg border ${getPriorityColor(priority)}`}>
                <div className="font-medium text-sm">{getPriorityLabel(priority)}</div>
                <div className="text-xs">{pitcher.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {pitchingOrder.map((assignment) => {
          const pitcherInfo = getPitcherInfo(assignment.pitcher);
          const priority = pitcherInfo?.priority || 0;
          
          return (
            <div
              key={assignment.inning}
              className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#D22237]">
                  Inning {assignment.inning}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                  {getPriorityLabel(priority)}
                </span>
              </div>
              <div className="text-lg font-medium text-gray-900">
                {assignment.pitcher}
              </div>
              {pitcherInfo && (
                <div className="text-sm text-gray-600 mt-1">
                  Preferred Position: {pitcherInfo.preferredPosition === 'none' ? 'None' : pitcherInfo.preferredPosition}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-[#D22237]">
              <th className="px-4 py-3 text-left font-semibold text-white">
                Inning
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Pitcher
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Priority
              </th>
              <th className="px-4 py-3 text-left font-semibold text-white">
                Preferred Position
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pitchingOrder.map((assignment, index) => {
              const pitcherInfo = getPitcherInfo(assignment.pitcher);
              const priority = pitcherInfo?.priority || 0;
              
              return (
                <tr
                  key={assignment.inning}
                  className={index % 2 === 0 ? "bg-[#354d74]/10" : "bg-white"}
                >
                  <td className="px-4 py-3 font-medium text-[#354d74]">
                    {assignment.inning}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {assignment.pitcher}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                      {getPriorityLabel(priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {pitcherInfo?.preferredPosition === 'none' 
                      ? 'None' 
                      : pitcherInfo?.preferredPosition || 'Unknown'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pitching Statistics */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Pitching Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(priority => {
            const pitcher = players.find(p => p.pitchingPriority === priority);
            if (!pitcher) return null;
            
            const assignmentCount = pitchingOrder.filter(a => a.pitcher === pitcher.name).length;
            const percentage = ((assignmentCount / pitchingOrder.length) * 100).toFixed(1);
            
            return (
              <div key={priority} className="text-center">
                <div className="text-2xl font-bold text-blue-900">{assignmentCount}</div>
                <div className="text-sm text-blue-700">{pitcher.name}</div>
                <div className="text-xs text-blue-600">{percentage}% of innings</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
