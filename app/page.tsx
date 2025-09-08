"use client";

import { useState } from "react";
import Image from "next/image";
import PositionsTable from "./PositionsTable";
import AttendanceForm from "./AttendanceForm";
import { players } from "./data/players";

export default function Home() {
  // Initialize with all players attending by default
  const [attendingPlayers, setAttendingPlayers] = useState<string[]>(
    players.map((player) => player.name)
  );

  const handleAttendanceChange = (playerName: string, isAttending: boolean) => {
    if (isAttending) {
      setAttendingPlayers((prev) => [...prev, playerName]);
    } else {
      setAttendingPlayers((prev) => prev.filter((name) => name !== playerName));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#D22237] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Ball Busters</h1>
          <p className="text-red-100 mt-1">Team Management System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AttendanceForm
          attendingPlayers={attendingPlayers}
          onAttendanceChange={handleAttendanceChange}
        />
        <PositionsTable attendingPlayers={attendingPlayers} />
      </div>
    </div>
  );
}
