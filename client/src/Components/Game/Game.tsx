import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import Map1Scene from "./Scenes/Map1Scene";
import { io, Socket } from "socket.io-client";

type GameProps = {
  avatar: string;
};

const Game: React.FC<GameProps> = ({ avatar }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io("http://localhost:4000", {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected with socket id:", socket.id);
        const username = `Player_${Math.floor(Math.random() * 1000)}`;
        socket.emit("newPlayer", { username, avatar });

        // Create Phaser scene after socket connection
        const scene = new Map1Scene(avatar, socket, socket.id);

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameRef.current!,
          width: gameRef.current!.clientWidth,
          height: gameRef.current!.clientHeight,
          scene,
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          physics: {
            default: "arcade",
            arcade: { debug: false },
          },
          backgroundColor: "#000000",
        };

        gameInstanceRef.current = new Phaser.Game(config);
      });
    }

    const handleResize = () => {
      if (gameInstanceRef.current && gameInstanceRef.current.scale) {
        gameInstanceRef.current.scale.resize(
          gameRef.current!.clientWidth,
          gameRef.current!.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      gameInstanceRef.current?.destroy(true);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [avatar]);

  const handleDisconnect = () => {
    gameInstanceRef.current?.destroy(true);
    socketRef.current?.disconnect();
    socketRef.current = null;
    navigate("/");
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={gameRef}
        className="w-full h-full"
        style={{ overflow: "hidden" }}
      />
      <button
        onClick={handleDisconnect}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md shadow-md z-50 hover:bg-red-600 cursor-pointer"
      >
        Disconnect
      </button>
    </div>
  );
};

export default Game;
