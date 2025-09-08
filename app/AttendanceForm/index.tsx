"use client";

import { useState } from "react";
import { players } from "../data/players";

interface AttendanceFormProps {
  attendingPlayers: string[];
  onAttendanceChange: (playerName: string, isAttending: boolean) => void;
}

export default function AttendanceForm({
  attendingPlayers,
  onAttendanceChange,
}: AttendanceFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 mb-8">
      {/* Collapsible Header */}
      <div
        className="p-4 sm:p-6 cursor-pointer hover:bg-white/20 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Player Attendance
            </h2>
            <span className="text-lg font-bold text-[#D22237] bg-red-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
              {attendingPlayers.length} / {players.length}
            </span>
          </div>
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Large Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#D22237] h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(attendingPlayers.length / players.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0 players</span>
            <span className="font-medium text-[#D22237]">
              {Math.round((attendingPlayers.length / players.length) * 100)}%
              attending
            </span>
            <span>{players.length} players</span>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-4 sm:px-6 pb-4 sm:pb-6 transform transition-transform duration-500 ease-in-out ${
            isExpanded ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {players.map((player) => (
              <label
                key={player.name}
                className="group flex items-center space-x-3 cursor-pointer p-3 sm:p-4 rounded-lg border-2 border-white/30 hover:border-[#D22237]/60 transition-all duration-200 bg-white/40 backdrop-blur-sm hover:bg-red-50/60 shadow-md min-w-0"
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={attendingPlayers.includes(player.name)}
                    onChange={(e) =>
                      onAttendanceChange(player.name, e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      attendingPlayers.includes(player.name)
                        ? "bg-[#D22237] border-[#D22237]"
                        : "bg-white border-gray-300 group-hover:border-[#D22237]"
                    }`}
                  >
                    {attendingPlayers.includes(player.name) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {player.name}
                  </span>
                  <span className="text-xs text-gray-500 truncate block">
                    {player.gender === "MALE" ? "Male" : "Female"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
