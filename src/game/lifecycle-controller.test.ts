import { describe, expect, it } from 'vitest';

import { LifecycleController } from './lifecycle-controller.ts';

class FakeEventTarget {
  private readonly listeners = new Map<string, Set<EventListener>>();

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();

    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new Event(type));
    }
  }
}

class FakeLifecycleWindow extends FakeEventTarget {
  readonly orientation = new FakeEventTarget();
  readonly screen = {
    orientation: this.orientation as { readonly type?: string } & FakeEventTarget,
  };
  portrait = true;

  matchMedia(): { readonly matches: boolean } {
    return { matches: this.portrait };
  }

  setOrientation(type: 'portrait-primary' | 'landscape-primary'): void {
    Object.defineProperty(this.orientation, 'type', { configurable: true, value: type });
    this.portrait = type.startsWith('portrait');
  }
}

class FakeLifecycleDocument extends FakeEventTarget {
  hidden = false;
}

describe('LifecycleController', () => {
  it('pauses for blur, hidden, and real orientation changes but only relayouts ordinary resize', () => {
    const window = new FakeLifecycleWindow();
    const document = new FakeLifecycleDocument();
    let pauses = 0;
    let relayouts = 0;
    const lifecycle = new LifecycleController({
      window,
      document,
      pause: () => {
        pauses += 1;
      },
      relayout: () => {
        relayouts += 1;
      },
    });

    window.emit('resize');
    window.emit('resize');
    expect({ pauses, relayouts }).toEqual({ pauses: 0, relayouts: 2 });

    window.emit('blur');
    document.hidden = true;
    document.emit('visibilitychange');
    document.hidden = false;
    document.emit('visibilitychange');
    expect(pauses).toBe(2);

    window.setOrientation('landscape-primary');
    window.emit('orientationchange');
    window.orientation.emit('change');
    expect(pauses).toBe(3);

    lifecycle.destroy();
    window.emit('blur');
    window.emit('resize');
    expect({ pauses, relayouts }).toEqual({ pauses: 3, relayouts: 2 });
  });
});
