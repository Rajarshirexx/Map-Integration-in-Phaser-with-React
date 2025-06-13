import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import Map1Scene from "./Scenes/Map1Scene";
import Map2Scene from "./Scenes/Map2Scene";
import { io, Socket } from "socket.io-client";

type GameProps = { avatar: string };

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
        socket.emit("newPlayer", { username: `Player_${Math.floor(Math.random()*1000)}`, avatar });

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: gameRef.current!,
          width: gameRef.current!.clientWidth,
          height: gameRef.current!.clientHeight,
          physics: { default: "arcade", arcade: { debug: false } },
          scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
          backgroundColor: "#000000",
          scene: [/* Map1Scene,  */Map2Scene],
        };

        gameInstanceRef.current = new Phaser.Game(config);

        // Start Map1 by default, switch later with scene.start
        gameInstanceRef.current.scene.start("Map2Scene", {
          avatar,
          socket,
          socketId: socket.id,
        });
      });
    }

    const handleResize = () => {
      gameInstanceRef.current?.scale.resize(
        gameRef.current!.clientWidth,
        gameRef.current!.clientHeight
      );
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
      <div ref={gameRef} className="w-full h-full" style={{ overflow: "hidden" }} />
      <button
        onClick={handleDisconnect}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md z-50 hover:bg-red-600"
      >
        Disconnect
      </button>
    </div>
  );
};

export default Game;
