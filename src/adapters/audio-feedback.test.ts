import { describe, expect, it } from 'vitest';

import type { DomainEvent } from '../domain/index.ts';

import { AudioFeedback, type AudioContextLike } from './audio-feedback.ts';

function foodEvent(): DomainEvent {
  return { type: 'foodEaten', cell: { x: 1, y: 1 }, score: 10 };
}

function runningContext(counters: { oscillatorStarts: number }): AudioContextLike {
  const oscillator = {
    frequency: { setValueAtTime: () => undefined },
    connect: () => undefined,
    start: () => {
      counters.oscillatorStarts += 1;
    },
    stop: () => undefined,
  } as unknown as OscillatorNode;
  const gain = {
    gain: {
      setValueAtTime: () => undefined,
      exponentialRampToValueAtTime: () => undefined,
    },
    connect: () => undefined,
  } as unknown as GainNode;

  return {
    currentTime: 1,
    destination: {} as AudioNode,
    state: 'running',
    createGain: () => gain,
    createOscillator: () => oscillator,
    resume: () => Promise.resolve(),
  };
}

describe('AudioFeedback', () => {
  it('does not initialize or play audio before a user-gesture activation', async () => {
    const counters = { factoryCalls: 0, oscillatorStarts: 0 };
    const audio = new AudioFeedback({
      contextFactory: () => {
        counters.factoryCalls += 1;

        return runningContext(counters);
      },
    });

    audio.handleEvents([foodEvent()]);
    expect(counters).toEqual({ factoryCalls: 0, oscillatorStarts: 0 });

    await audio.activateFromUserGesture();
    audio.handleEvents([foodEvent()]);
    expect(counters).toEqual({ factoryCalls: 1, oscillatorStarts: 1 });
  });

  it('creates at most one context while a gesture-triggered resume is pending', async () => {
    const counters = { factoryCalls: 0, oscillatorStarts: 0 };
    const resumeCallbacks: Array<() => void> = [];
    const audio = new AudioFeedback({
      contextFactory: () => {
        counters.factoryCalls += 1;
        const context = runningContext(counters);

        return {
          ...context,
          state: 'suspended',
          resume: () =>
            new Promise<void>((resolve) => {
              resumeCallbacks.push(resolve);
            }),
        };
      },
    });

    const firstActivation = audio.activateFromUserGesture();
    const secondActivation = audio.activateFromUserGesture();

    expect(counters.factoryCalls).toBe(1);
    expect(resumeCallbacks).toHaveLength(1);
    resumeCallbacks[0]!();
    await Promise.all([firstActivation, secondActivation]);
  });

  it('respects mute and turns unavailable, throwing, or rejected audio into a no-op', async () => {
    const counters = { factoryCalls: 0, oscillatorStarts: 0 };
    const mutedAudio = new AudioFeedback({
      contextFactory: () => runningContext(counters),
      initiallyMuted: true,
    });

    await mutedAudio.activateFromUserGesture();
    mutedAudio.handleEvents([foodEvent()]);
    expect(counters.oscillatorStarts).toBe(0);
    expect(mutedAudio.toggleMuted()).toBe(false);
    mutedAudio.handleEvents([foodEvent()]);
    expect(counters.oscillatorStarts).toBe(1);

    const constructorFailure = new AudioFeedback({
      contextFactory: () => {
        throw new DOMException('unsupported', 'NotSupportedError');
      },
    });
    await constructorFailure.activateFromUserGesture();
    constructorFailure.handleEvents([foodEvent()]);

    const resumeFailure = new AudioFeedback({
      contextFactory: () => ({
        ...runningContext(counters),
        state: 'suspended',
        resume: async () => Promise.reject(new DOMException('blocked', 'NotAllowedError')),
      }),
    });
    await resumeFailure.activateFromUserGesture();
    resumeFailure.handleEvents([foodEvent()]);

    expect(counters.oscillatorStarts).toBe(1);
  });
});
