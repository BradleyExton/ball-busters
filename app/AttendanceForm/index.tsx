"use client";

import { players } from "../data/players";

interface AttendanceFormProps {
  attendingPlayers: string[];
  onAttendanceChange: (playerName: string, isAttending: boolean) => void;
}

export default function AttendanceForm({
  attendingPlayers,
  onAttendanceChange,
}: AttendanceFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Player Attendance
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((player) => (
          <label
            key={player.name}
            className="group flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-100 hover:border-[#D22237] transition-all duration-200 bg-gray-50 hover:bg-red-50"
          >
            <div className="relative">
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
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block">
                {player.name}
              </span>
              <span className="text-xs text-gray-500">
                {player.gender === "MALE" ? "Male" : "Female"}
              </span>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Players Attending
          </span>
          <span className="text-lg font-bold text-[#D22237]">
            {attendingPlayers.length} / {players.length}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#D22237] h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(attendingPlayers.length / players.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
