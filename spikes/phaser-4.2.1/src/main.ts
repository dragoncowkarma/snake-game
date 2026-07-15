import Phaser from "phaser";

import "./styles.css";

const LOGICAL_SIZE = 480;
const GRID_CELLS = 20;
const CELL_SIZE = LOGICAL_SIZE / GRID_CELLS;

interface SpikeProbe {
  phaserVersion: string;
  renderer: "PENDING" | "WEBGL" | "CANVAS" | "UNKNOWN";
  sceneCreated: boolean;
  graphicsDrawn: boolean;
  renderedCells: number;
  keyCount: number;
  lastKey: string;
  resizeCount: number;
  blurCount: number;
  hiddenCount: number;
  visibleCount: number;
  logicalWidth: number;
  logicalHeight: number;
  displayWidth: number;
  displayHeight: number;
  scaleMode: number;
  autoCenter: number;
}

declare global {
  interface Window {
    __PHASER_SPIKE__: {
      game: Phaser.Game;
      readProbe: () => SpikeProbe;
    };
  }
}

function requireProbeOutput(): HTMLOutputElement {
  const element = document.querySelector<HTMLOutputElement>("#probe");

  if (element === null) {
    throw new Error("Spike probe output element is missing");
  }

  return element;
}

const probeOutput = requireProbeOutput();

const probe: SpikeProbe = {
  phaserVersion: Phaser.VERSION,
  renderer: "PENDING",
  sceneCreated: false,
  graphicsDrawn: false,
  renderedCells: 0,
  keyCount: 0,
  lastKey: "",
  resizeCount: 0,
  blurCount: 0,
  hiddenCount: 0,
  visibleCount: 0,
  logicalWidth: 0,
  logicalHeight: 0,
  displayWidth: 0,
  displayHeight: 0,
  scaleMode: -1,
  autoCenter: -1,
};

function publishProbe(): void {
  probeOutput.textContent = JSON.stringify(probe);
  document.body.dataset.ready = String(probe.sceneCreated && probe.graphicsDrawn);
}

class SpikeScene extends Phaser.Scene {
  constructor() {
    super("SpikeScene");
  }

  create(): void {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
    graphics.lineStyle(1, 0x334155, 1);

    for (let index = 0; index <= GRID_CELLS; index += 1) {
      const offset = index * CELL_SIZE;
      graphics.lineBetween(offset, 0, offset, LOGICAL_SIZE);
      graphics.lineBetween(0, offset, LOGICAL_SIZE, offset);
    }

    graphics.fillStyle(0x22c55e, 1);
    graphics.fillRect(CELL_SIZE * 2 + 2, CELL_SIZE * 2 + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    graphics.fillStyle(0xf97316, 1);
    graphics.fillRect(CELL_SIZE * 10 + 2, CELL_SIZE * 7 + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    const keyboard = this.input.keyboard;

    if (keyboard === null) {
      throw new Error("Phaser keyboard plugin is unavailable");
    }

    const onRightKey = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }

      probe.keyCount += 1;
      probe.lastKey = event.key;
      publishProbe();
    };

    const updateScaleProbe = (): void => {
      probe.logicalWidth = this.scale.width;
      probe.logicalHeight = this.scale.height;
      probe.displayWidth = this.scale.displaySize.width;
      probe.displayHeight = this.scale.displaySize.height;
      probe.scaleMode = this.scale.scaleMode;
      probe.autoCenter = this.scale.autoCenter;
    };

    const onResize = (): void => {
      probe.resizeCount += 1;
      updateScaleProbe();
      publishProbe();
    };

    const onBlur = (): void => {
      probe.blurCount += 1;
      publishProbe();
    };

    const onHidden = (): void => {
      probe.hiddenCount += 1;
      publishProbe();
    };

    const onVisible = (): void => {
      probe.visibleCount += 1;
      publishProbe();
    };

    keyboard.on("keydown-RIGHT", onRightKey);
    this.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.game.events.on(Phaser.Core.Events.HIDDEN, onHidden);
    this.game.events.on(Phaser.Core.Events.VISIBLE, onVisible);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keyboard.off("keydown-RIGHT", onRightKey);
      this.scale.off(Phaser.Scale.Events.RESIZE, onResize);
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
      this.game.events.off(Phaser.Core.Events.HIDDEN, onHidden);
      this.game.events.off(Phaser.Core.Events.VISIBLE, onVisible);
    });

    updateScaleProbe();
    probe.renderer =
      this.game.renderer.type === Phaser.WEBGL
        ? "WEBGL"
        : this.game.renderer.type === Phaser.CANVAS
          ? "CANVAS"
          : "UNKNOWN";
    probe.renderedCells = GRID_CELLS * GRID_CELLS;
    probe.graphicsDrawn = true;
    probe.sceneCreated = true;
    publishProbe();
  }
}

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  backgroundColor: "#0f172a",
  pixelArt: true,
  scale: {
    parent: "game-container",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LOGICAL_SIZE,
    height: LOGICAL_SIZE,
    expandParent: false,
  },
  scene: SpikeScene,
});

window.__PHASER_SPIKE__ = {
  game,
  readProbe: () => ({ ...probe }),
};
