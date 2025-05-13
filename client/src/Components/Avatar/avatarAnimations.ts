import Phaser from "phaser";

export const createAvatarAnimations = (
  scene: Phaser.Scene,
  textureKey: string = "player" // Default sprite sheet key
) => {
  // IDLE animations
  scene.anims.create({
    key: "idle-right",
    frames: [{ key: textureKey, frame: 2 }],
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "idle-down",
    frames: [{ key: textureKey, frame: 20 }],
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "idle-left",
    frames: [{ key: textureKey, frame: 14 }],
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "idle-up",
    frames: [{ key: textureKey, frame: 8 }],
    frameRate: 10,
    repeat: -1,
  });

  // WALK animations
  scene.anims.create({
    key: "walk-right",
    frames: scene.anims.generateFrameNumbers(textureKey, { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-down",
    frames: scene.anims.generateFrameNumbers(textureKey, { start: 18, end: 23 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-left",
    frames: scene.anims.generateFrameNumbers(textureKey, { start: 12, end: 17 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-up",
    frames: scene.anims.generateFrameNumbers(textureKey, { start: 6, end: 11 }),
    frameRate: 10,
    repeat: -1,
  });
};
