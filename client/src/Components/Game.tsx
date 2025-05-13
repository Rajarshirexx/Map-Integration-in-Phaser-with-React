import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useNavigate } from "react-router-dom";

type GameProps = {
  avatar: string;
};

const Game: React.FC<GameProps> = ({ avatar }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    class MyScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Sprite;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      map!: Phaser.Tilemaps.Tilemap;
      lastDirection: string = "down";

      constructor() {
        super("MyScene");
      }

      preload() {
        this.load.image("Floors_only_48x48", "/assets/Floors_only_48x48.png");
        this.load.image("Room_Builder_48x48", "/assets/Room_Builder_48x48.png");
        this.load.tilemapTiledJSON("map", "/assets/example.tmj");
        this.load.spritesheet("player", `/assets/${avatar}`, {
          frameWidth: 48,
          frameHeight: 96,
        });
      }

      create() {
        this.map = this.make.tilemap({ key: "map" });
        const tileset1 = this.map.addTilesetImage("Floors_only_48x48", "Floors_only_48x48");

        const groundLayer = this.map.createLayer("Ground", [tileset1!], 0, 0);
        const wallLayer = this.map.createLayer("Collision", [tileset1!], 0, 0);
        wallLayer.setCollisionByProperty({ collides: true });

        const spawnX = this.map.widthInPixels / 2;
        const spawnY = this.map.heightInPixels / 2;
        this.player = this.physics.add.sprite(spawnX, spawnY, "player");
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, wallLayer);

        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        this.createAnimations();
        this.cursors = this.input.keyboard.createCursorKeys();
      }

      createAnimations() {
        this.anims.create({ key: "idle-right", frames: [{ key: "player", frame: 2 }], frameRate: 10, repeat: -1 });
        this.anims.create({ key: "idle-down", frames: [{ key: "player", frame: 20 }], frameRate: 10, repeat: -1 });
        this.anims.create({ key: "idle-left", frames: [{ key: "player", frame: 14 }], frameRate: 10, repeat: -1 });
        this.anims.create({ key: "idle-up", frames: [{ key: "player", frame: 8 }], frameRate: 10, repeat: -1 });

        this.anims.create({ key: "walk-right", frames: this.anims.generateFrameNumbers("player", { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("player", { start: 18, end: 23 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: "walk-left", frames: this.anims.generateFrameNumbers("player", { start: 12, end: 17 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("player", { start: 6, end: 11 }), frameRate: 10, repeat: -1 });
      }

      update() {
        const speed = 250;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown) {
          vx = -speed;
          this.lastDirection = "left";
        } else if (this.cursors.right.isDown) {
          vx = speed;
          this.lastDirection = "right";
        }

        if (this.cursors.up.isDown) {
          vy = -speed;
          this.lastDirection = "up";
        } else if (this.cursors.down.isDown) {
          vy = speed;
          this.lastDirection = "down";
        }

        this.player.setVelocity(vx, vy);

        if (vx === 0 && vy === 0) {
          this.player.anims.play(`idle-${this.lastDirection}`, true);
        } else {
          this.player.anims.play(`walk-${this.lastDirection}`, true);
        }
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current!,
      width: gameRef.current!.clientWidth,
      height: gameRef.current!.clientHeight,
      scene: MyScene,
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
