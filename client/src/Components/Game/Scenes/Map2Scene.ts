import Phaser from "phaser";
import { createAvatarAnimations } from "../../Avatar/avatarAnimations";

interface PlayerData {
  x: number;
  y: number;
  direction: string;
  avatar: string;
}

interface SceneData {
  avatar: string;
  socket: any;
  socketId: string;
}

export default class Map2Scene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private map!: Phaser.Tilemaps.Tilemap;
  private lastDirection: string = "down";
  private avatar!: string;
  private socket: any;
  private myId: string = "";
  private otherPlayers: { [id: string]: Phaser.Physics.Arcade.Sprite } = {};
  private loadedAvatars: Set<string> = new Set();

  private privateAreaText?: Phaser.GameObjects.Text;
  private receptionistText?: Phaser.GameObjects.Text;

  constructor() {
    super("Map2Scene");
  }

  init(data: SceneData) {
    this.avatar = data.avatar;
    this.socket = data.socket;
    this.myId = data.socketId;
  }

  preload() {
    this.load.image("Floors_only_48x48", "/assets/Floors_only_48x48.png");
    this.load.image("Room_Builder_48x48", "/assets/Room_Builder_48x48.png");
    this.load.image("Conference", "/assets/Conference.png");
    this.load.image("Generic", "/assets/Generic.png");
    this.load.image("basement", "/assets/basement.png");
    this.load.image("library", "/assets/library.png");

    this.load.tilemapTiledJSON("map", "/assets/auditorium.tmj");

    const avatarKey = this.getAvatarKey(this.avatar);
    this.load.spritesheet(avatarKey, `/assets/${this.avatar}`, {
      frameWidth: 48,
      frameHeight: 96,
    });

    this.load.spritesheet("receptionist", "/assets/receptionist.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    this.map = this.make.tilemap({ key: "map" });

    const tileset1 = this.map.addTilesetImage(
      "Floors_only_48x48",
      "Floors_only_48x48"
    );
    const tileset2 = this.map.addTilesetImage(
      "Room_Builder_48x48",
      "Room_Builder_48x48"
    );
    const tileset3 = this.map.addTilesetImage("Conference", "Conference");
    const tileset4 = this.map.addTilesetImage("Generic", "Generic");
    const tileset5 = this.map.addTilesetImage("basement", "basement");
    const tileset6 = this.map.addTilesetImage("library", "library");

    this.map.createLayer("Floor", [tileset1, tileset2], 0, 0);
    const stageLayer = this.map.createLayer("Stage", [tileset3], 0, 0);
    const wallLayer = this.map.createLayer("Wall", [tileset2], 0, 0);
    this.map.createLayer("Monitor", [tileset3], 0, 0);
    const DecorLayer = this.map.createLayer(
      "Decor",
      [tileset4, tileset5, tileset6],
      0,
      0
    );
    const wallLayer2 = this.map.createLayer("Wall2", [tileset2], 0, 0);
    const PrivateZoneLayer = this.map.createLayer("PrivateZone", [tileset4], 0, 0);
    const ReceptionLayer = this.map.createLayer("Reception", [tileset4, tileset5, tileset6], 0, 0);
    const Decor2Layer = this.map.createLayer(
      "Decor2",
      [tileset4, tileset5, tileset6],
      0,
      0
    );

    wallLayer.setCollisionFromCollisionGroup();
    wallLayer2.setCollisionFromCollisionGroup();
    stageLayer.setCollisionFromCollisionGroup();
    DecorLayer.setCollisionFromCollisionGroup();
    Decor2Layer.setCollisionFromCollisionGroup();
    ReceptionLayer.setCollisionFromCollisionGroup();
    PrivateZoneLayer.setCollisionFromCollisionGroup();

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setZoom(1);

    const spawnObject = this.map
      .getObjectLayer("Spawn")
      ?.objects.find((obj) => obj.name === "playerSpawn");
    const baseX = spawnObject?.x ?? this.map.widthInPixels / 2;
    const baseY = spawnObject?.y ?? this.map.heightInPixels / 2;
    const offsetX = Phaser.Math.Between(-20, 20);
    const offsetY = Phaser.Math.Between(-20, 20);
    const spawnX = baseX + offsetX;
    const spawnY = baseY + offsetY;

    const avatarKey = this.getAvatarKey(this.avatar);
    this.player = this.physics.add.sprite(spawnX, spawnY, avatarKey);
    this.player.setCollideWorldBounds(true).setDepth(3);

    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.collider(this.player, stageLayer);
    this.physics.add.collider(this.player, wallLayer2);
    this.physics.add.collider(this.player, DecorLayer);
    this.physics.add.collider(this.player, Decor2Layer);
    this.physics.add.collider(this.player, ReceptionLayer);
    this.physics.add.collider(this.player, PrivateZoneLayer);

    this.cameras.main.startFollow(this.player);

    if (!this.loadedAvatars.has(avatarKey)) {
      createAvatarAnimations(this, avatarKey);
      this.loadedAvatars.add(avatarKey);
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.socket) {
      this.socket.on("connect", () => {
        this.myId = this.socket.id;
      });

      this.socket.on(
        "playersUpdate",
        (players: { [id: string]: PlayerData }) => {
          this.updateOtherPlayers(players);
        }
      );

      this.socket.emit("move", {
        x: this.player.x,
        y: this.player.y,
        direction: this.lastDirection,
        avatar: this.avatar,
      });

      this.anims.create({
        key: "receptionist-idle",
        frames: this.anims.generateFrameNumbers("receptionist", {
          start: 0,
          end: 6,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    this.setupMonitorClick();
    this.setupPrivateZones();
    this.showReceptionistWelcome(); // 👈 Call welcome message once

    console.log("✅ Map2Scene created with:", {
      avatar: this.avatar,
      socketId: this.myId,
    });

    const receptionistObj = this.map
  .getObjectLayer("Receptionist")
  ?.objects.find((obj) => obj.name === "npcReceptionist");

if (receptionistObj) {
  const receptionist = this.add
    .sprite(receptionistObj.x! + 4, receptionistObj.y! +48 , "receptionist")
    .setOrigin(0, 1) // aligns with Tiled's bottom-left origin
    .setDepth(3);

  receptionist.play("receptionist-idle");
} else {
  console.warn("🚨 Receptionist object not found in Tiled map.");
}
  }

  update() {
    const speed = 250;
    let vx = 0,
      vy = 0;

    if (this.cursors.left?.isDown) {
      vx = -speed;
      this.lastDirection = "left";
    } else if (this.cursors.right?.isDown) {
      vx = speed;
      this.lastDirection = "right";
    }

    if (this.cursors.up?.isDown) {
      vy = -speed;
      this.lastDirection = "up";
    } else if (this.cursors.down?.isDown) {
      vy = speed;
      this.lastDirection = "down";
    }

    this.player.setVelocity(vx, vy);

    const avatarKey = this.getAvatarKey(this.avatar);
    const isMoving = vx !== 0 || vy !== 0;
    const animKey = isMoving
      ? `${avatarKey}-walk-${this.lastDirection}`
      : `${avatarKey}-idle-${this.lastDirection}`;

    this.player.anims.play(animKey, true);

    if (this.socket) {
      this.socket.emit("move", {
        x: this.player.x,
        y: this.player.y,
        direction: this.lastDirection,
        avatar: this.avatar,
      });
    }
  }

  updateOtherPlayers(players: { [id: string]: PlayerData }) {
    Object.keys(this.otherPlayers).forEach((id) => {
      if (!players[id]) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    Object.entries(players).forEach(([id, data]) => {
      if (id === this.myId) return;

      const avatarKey = this.getAvatarKey(data.avatar);

      if (this.otherPlayers[id]) {
        const sprite = this.otherPlayers[id];
        sprite.setPosition(data.x, data.y);

        const animKey = data.direction
          ? `${avatarKey}-walk-${data.direction}`
          : `${avatarKey}-idle-down`;

        if (sprite.anims.currentAnim?.key !== animKey) {
          sprite.anims.play(animKey, true);
        }

        return;
      }

      if (!this.loadedAvatars.has(avatarKey)) {
        if (!this.load.isLoading()) {
          this.load.spritesheet(avatarKey, `/assets/${data.avatar}`, {
            frameWidth: 48,
            frameHeight: 96,
          });

          this.load.once("complete", () => {
            createAvatarAnimations(this, avatarKey);
            this.loadedAvatars.add(avatarKey);
            this.createOtherPlayer(id, data, avatarKey);
          });

          this.load.start();
        }
        return;
      }

      this.createOtherPlayer(id, data, avatarKey);
    });
  }

  private createOtherPlayer(id: string, data: PlayerData, avatarKey: string) {
    const otherPlayer = this.physics.add.sprite(data.x, data.y, avatarKey);
    otherPlayer.setCollideWorldBounds(true);
    this.otherPlayers[id] = otherPlayer;
  }

  private getAvatarKey(filename: string): string {
    return filename.split(".")[0];
  }

  private setupMonitorClick() {
    const monitorObjects = this.map.getObjectLayer("Monitors")?.objects;

    monitorObjects?.forEach((obj) => {
      const type = obj.properties?.find((p: any) => p.name === "type")?.value;

      if (type === "monitor") {
        const monitorZone = this.add
          .zone(obj.x!, obj.y!, obj.width ?? 48, obj.height ?? 48)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true });

        monitorZone.on("pointerdown", () =>
          this.showVideo("/assets/video.mp4")
        );

        monitorZone.on("pointerover", (pointer: Phaser.Input.Pointer) => {
          const tooltip = document.createElement("div");
          tooltip.id = "monitor-tooltip";
          tooltip.innerText = "Click to play! 🧐";
          tooltip.style.position = "absolute";
          tooltip.style.top = `${pointer.y + 20}px`;
          tooltip.style.left = `${pointer.x + 20}px`;
          tooltip.style.padding = "4px 8px";
          tooltip.style.background = "white";
          tooltip.style.color = "black";
          tooltip.style.fontSize = "14px";
          tooltip.style.borderRadius = "4px";
          tooltip.style.pointerEvents = "none";
          tooltip.style.zIndex = "1002";
          document.body.appendChild(tooltip);
        });

        monitorZone.on("pointerout", () => {
          const tooltip = document.getElementById("monitor-tooltip");
          tooltip?.remove();
        });
      }
    });
  }

  private showVideo(src: string) {
    const videoElement = document.getElementById(
      "monitor-video"
    ) as HTMLVideoElement;
    const closeButton = document.getElementById(
      "monitor-close"
    ) as HTMLButtonElement;

    if (videoElement && closeButton) {
      videoElement.src = src;
      videoElement.style.display = "block";
      closeButton.style.display = "block";
      videoElement.play();

      closeButton.onclick = () => {
        videoElement.pause();
        videoElement.style.display = "none";
        closeButton.style.display = "none";
      };
    }
  }

  private setupPrivateZones() {
    const zones = this.map.getObjectLayer("PrivateAreas")?.objects;

    zones?.forEach((zone) => {
      const privateArea = this.add
        .zone(zone.x!, zone.y!, zone.width!, zone.height!)
        .setOrigin(0, 0);

      this.physics.world.enable(privateArea);
      (privateArea as any).playerInside = false;

      if (!this.privateAreaText) {
        this.privateAreaText = this.add
          .text(16, 16, "", {
            fontSize: "18px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 8, y: 4 },
          })
          .setScrollFactor(0)
          .setDepth(1000)
          .setVisible(false);
      }

      this.physics.add.overlap(this.player, privateArea, () => {
        if (!(privateArea as any).playerInside) {
          (privateArea as any).playerInside = true;
          this.privateAreaText!.setText(
            "🕵️ You entered a private area"
          ).setVisible(true);
        }
      });

      this.events.on("update", () => {
        if (!this.physics.overlap(this.player, privateArea)) {
          if ((privateArea as any).playerInside) {
            (privateArea as any).playerInside = false;
            this.privateAreaText!.setVisible(false);
          }
        }
      });
    });
  }

 private showReceptionistWelcome() {
  const receptionistObj = this.map
    .getObjectLayer("Receptionist")
    ?.objects.find((obj) => obj.name === "npcReceptionist");

  if (!receptionistObj) return;

  // Adjust as needed to position it above the receptionist's head
  const textX = receptionistObj.x! + 25;
  const textY = receptionistObj.y! - 20; // slightly above the sprite

  this.receptionistText = this.add
    .text(textX, textY, "👋 Welcome to Metaverse!", {
      fontSize: "16px",
      fill: "#fff",
      backgroundColor: "#333",
      padding: { x: 8, y: 4 },
    })
    .setOrigin(0.5, 1) // center align horizontally
    .setDepth(1000)
    .setVisible(true);

  this.time.delayedCall(3000, () => {
    this.receptionistText?.destroy();
  });
}

}
