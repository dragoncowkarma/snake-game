import type { DomainEvent } from '../domain/index.ts';

export interface AudioContextLike {
  readonly currentTime: number;
  readonly destination: AudioNode;
  readonly state: AudioContextState;
  createGain(): GainNode;
  createOscillator(): OscillatorNode;
  resume(): Promise<void>;
}

export type AudioContextFactory = () => AudioContextLike;

export interface AudioFeedbackOptions {
  readonly contextFactory: AudioContextFactory | null;
  readonly initiallyMuted?: boolean;
}

type Tone = Readonly<{ frequency: number; durationSeconds: number }>;

const FOOD_TONE: Tone = { frequency: 660, durationSeconds: 0.06 };
const END_TONE: Tone = { frequency: 180, durationSeconds: 0.12 };
const WON_TONE: Tone = { frequency: 880, durationSeconds: 0.14 };

/**
 * Optional synthesized feedback. It owns no gameplay state and fails closed: any
 * unavailable or rejected Web Audio API becomes a permanent no-op for this session.
 */
export class AudioFeedback {
  private context: AudioContextLike | null = null;
  private activationStarted = false;
  private unavailable = false;
  private muted: boolean;

  constructor(private readonly options: AudioFeedbackOptions) {
    this.muted = options.initiallyMuted ?? false;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  toggleMuted(): boolean {
    this.muted = !this.muted;

    return this.muted;
  }

  /** Call synchronously from a semantic user-command handler, never on mount. */
  async activateFromUserGesture(): Promise<void> {
    if (
      this.context !== null ||
      this.activationStarted ||
      this.unavailable ||
      this.options.contextFactory === null
    ) {
      return;
    }

    this.activationStarted = true;

    try {
      const context = this.options.contextFactory();

      if (context.state === 'suspended') {
        await context.resume();
      }

      this.context = context;
    } catch {
      this.unavailable = true;
    }
  }

  handleEvents(events: readonly DomainEvent[]): void {
    if (this.muted || this.context === null || this.context.state !== 'running') {
      return;
    }

    for (const event of events) {
      switch (event.type) {
        case 'foodEaten':
          this.play(FOOD_TONE);
          break;
        case 'gameEnded':
          this.play(END_TONE);
          break;
        case 'gameWon':
          this.play(WON_TONE);
          break;
      }
    }
  }

  private play(tone: Tone): void {
    const context = this.context;

    if (context === null || this.unavailable) {
      return;
    }

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = context.currentTime;

      oscillator.frequency.setValueAtTime(tone.frequency, startTime);
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + tone.durationSeconds);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + tone.durationSeconds);
    } catch {
      this.unavailable = true;
    }
  }
}
