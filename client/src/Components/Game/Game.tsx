import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";
import Map1Scene from "./Scenes/Map1Scene";

type GameProps = {
  avatar: string;
};

const Game: React.FC<GameProps> = ({ avatar }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const scene = new Map1Scene(avatar);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current!,
      width: gameRef.current!.clientWidth,
      height: gameRef.current!.clientHeight,
      scene: scene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      backgroundColor: "#000000",
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    const handleResize = () => {
      if (game && game.scale) {
        game.scale.resize(gameRef.current!.clientWidth, gameRef.current!.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
    };
  }, [avatar]);

  const handleDisconnect = () => {
    gameInstanceRef.current?.destroy(true);
    navigate("/");
  };

  return (
    <div className="relative w-full h-full">
      <div ref={gameRef} className="w-full h-full" style={{ overflow: "hidden" }} />
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
