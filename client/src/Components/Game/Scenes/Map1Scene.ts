import Phaser from "phaser";
import { createAvatarAnimations } from "../../Avatar/avatarAnimations";

export default class Map1Scene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  map!: Phaser.Tilemaps.Tilemap;
  lastDirection: string = "down";
  avatar: string;

  constructor(avatar: string) {
    super("Map1Scene");
    this.avatar = avatar;
  }

  preload() {
    this.load.image("Floors_only_48x48", "/assets/Floors_only_48x48.png");
    this.load.image("Room_Builder_48x48", "/assets/Room_Builder_48x48.png");
    this.load.tilemapTiledJSON("map", "/assets/example.tmj");
    this.load.spritesheet("player", `/assets/${this.avatar}`, {
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

    createAvatarAnimations(this, "player");

    this.cursors = this.input.keyboard.createCursorKeys();
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
