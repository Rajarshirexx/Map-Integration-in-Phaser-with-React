export const createAvatarAnimations = (
  scene: Phaser.Scene,
  textureKey: string
) => {
  const prefix = textureKey;

  const staticFrames = [
    { key: `${prefix}-idle-right`, frame: 2 },
    { key: `${prefix}-idle-down`, frame: 20 },
    { key: `${prefix}-idle-left`, frame: 14 },
    { key: `${prefix}-idle-up`, frame: 8 },
  ];

  const walkFrames = [
    { key: `${prefix}-walk-right`, start: 0, end: 5 },
    { key: `${prefix}-walk-up`, start: 6, end: 11 },
    { key: `${prefix}-walk-left`, start: 12, end: 17 },
    { key: `${prefix}-walk-down`, start: 18, end: 23 },
  ];

  // Create idle animations
  staticFrames.forEach(({ key, frame }) => {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: [{ key: textureKey, frame }],
        frameRate: 10,
        repeat: 1,
      });
    }
  });

  // Create walk animations
  walkFrames.forEach(({ key, start, end }) => {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(textureKey, { start, end }),
        frameRate: 10,
        repeat: 1,
      });
    }
  });
};
