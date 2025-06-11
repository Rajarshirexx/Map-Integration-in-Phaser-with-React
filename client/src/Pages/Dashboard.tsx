import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  const handleHost = () => {
    const sessionId = crypto.randomUUID(); // Generate unique session ID
    navigate(`/host?sessionId=${sessionId}`);
  };

  const handleJoin = () => {
    if (joinCode.trim() === "") return;
    navigate(`/join/${joinCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Metaverse</h1>

      <button
        onClick={handleHost}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Host Game
      </button>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter Session ID"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={handleJoin}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
