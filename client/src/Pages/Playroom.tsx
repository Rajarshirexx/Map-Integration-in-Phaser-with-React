import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import Game from "../Components/Game/Game";

type PlayRoomProps = {
  avatar: string;
};

const PlayRoom: React.FC<PlayRoomProps> = ({ avatar }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const newSocket = io("http://localhost:4000", {
      query: { roomId: sessionId },
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  if (!sessionId) {
    return <div>Invalid session. No session ID found.</div>;
  }

  if (!socket) {
    return <div>Connecting to game session...</div>;
  }

  return (
    <div className="w-screen h-screen relative">
      <Game avatar={avatar} socket={socket} sessionId={sessionId} />
      {/* UI overlay */}
      <div className="absolute bottom-0 left-0 w-full h-36 bg-white/90 border-t border-gray-300 p-4 overflow-y-auto z-50">
        <p className="text-gray-700">This is where player messages will show up.</p>
      </div>
    </div>
  );
};

export default PlayRoom;
