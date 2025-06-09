import Phaser from "phaser";
import { createAvatarAnimations } from "../../Avatar/avatarAnimations";

interface PlayerData {
  x: number;
  y: number;
  direction: string;
  avatar: string;
}

export default class Map1Scene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  map!: Phaser.Tilemaps.Tilemap;
  lastDirection: string = "down";
  avatar: string;
  private socket: any;
  private myId: string = "";
  private otherPlayers: { [id: string]: Phaser.Physics.Arcade.Sprite } = {};
  private loadedAvatars: Set<string> = new Set();

  constructor(avatar: string, socket: any, socketId: string) {
    super("Map1Scene");
    this.avatar = avatar;
    this.socket = socket;
    this.myId = socketId; 
  }

  preload() {
    this.load.image("Floors_only_48x48", "/assets/Floors_only_48x48.png");
    this.load.image("Room_Builder_48x48", "/assets/Room_Builder_48x48.png");
    this.load.tilemapTiledJSON("map", "/assets/example.tmj");

    const avatarKey = this.getAvatarKey(this.avatar);
    this.load.spritesheet(avatarKey, `/assets/${this.avatar}`, {
      frameWidth: 48,
      frameHeight: 96,
    });
  }

  create() {
  this.map = this.make.tilemap({ key: "map" });
  const tileset = this.map.addTilesetImage("Floors_only_48x48", "Floors_only_48x48");
  const groundLayer = this.map.createLayer("Ground", [tileset!], 0, 0);
  const wallLayer = this.map.createLayer("Collision", [tileset!], 0, 0);
  wallLayer.setCollisionByProperty({ collides: true });

  this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  this.cameras.main.setZoom(1);

  
  const offset = Phaser.Math.Between(-100, 100);
  const spawnX = this.map.widthInPixels / 2 + offset;
  const spawnY = this.map.heightInPixels / 2 + offset;
  const avatarKey = this.getAvatarKey(this.avatar);

  this.player = this.physics.add.sprite(spawnX, spawnY, avatarKey);
  this.player.setCollideWorldBounds(true);
  this.physics.add.collider(this.player, wallLayer);
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

    this.socket.on("playersUpdate", (players: { [id: string]: PlayerData }) => {
      this.updateOtherPlayers(players);
    });

    
    this.socket.emit("move", {
      x: this.player.x,
      y: this.player.y,
      direction: this.lastDirection,
      avatar: this.avatar,
    });
  }
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

    const avatarKey = this.getAvatarKey(this.avatar);
    if (vx === 0 && vy === 0) {
      this.player.anims.play(`${avatarKey}-idle-${this.lastDirection}`, true);
    } else {
      this.player.anims.play(`${avatarKey}-walk-${this.lastDirection}`, true);
    }

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
  // Remove disconnected players
  Object.keys(this.otherPlayers).forEach((id) => {
    if (!players[id]) {
      this.otherPlayers[id].destroy();
      delete this.otherPlayers[id];
    }
  });

  // Add or update other players
  Object.entries(players).forEach(([id, data]) => {
    if (id === this.myId) return; // Don't update yourself

    const avatarKey = this.getAvatarKey(data.avatar);

    // If sprite already exists, update position & animation
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

    //  Don't create sprite if avatar not loaded yet
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

    // Safe to create other player now
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
}
