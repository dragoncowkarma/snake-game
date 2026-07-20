interface OrientationEventSource {
  readonly type?: string;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface LifecycleWindow {
  readonly screen: { readonly orientation?: OrientationEventSource };
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  matchMedia(query: string): { readonly matches: boolean };
}

export interface LifecycleDocument {
  readonly hidden: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface LifecycleControllerOptions {
  readonly window: LifecycleWindow;
  readonly document: LifecycleDocument;
  readonly pause: () => void;
  readonly relayout: () => void;
}

function orientationFamily(window: LifecycleWindow): 'portrait' | 'landscape' {
  const screenOrientation = window.screen.orientation?.type;

  if (screenOrientation?.startsWith('portrait')) {
    return 'portrait';
  }

  if (screenOrientation?.startsWith('landscape')) {
    return 'landscape';
  }

  return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
}

/** Separates real orientation changes from ordinary container or browser-chrome resize. */
export class LifecycleController {
  private orientation: 'portrait' | 'landscape';
  private readonly onVisibilityChange: EventListener;
  private readonly onBlur: EventListener;
  private readonly onResize: EventListener;
  private readonly onOrientationChange: EventListener;

  constructor(private readonly options: LifecycleControllerOptions) {
    this.orientation = orientationFamily(options.window);
    this.onVisibilityChange = () => {
      if (options.document.hidden) {
        options.pause();
      }
    };
    this.onBlur = () => options.pause();
    this.onResize = () => options.relayout();
    this.onOrientationChange = () => {
      const nextOrientation = orientationFamily(options.window);

      if (nextOrientation !== this.orientation) {
        this.orientation = nextOrientation;
        options.pause();
      }
    };

    options.document.addEventListener('visibilitychange', this.onVisibilityChange);
    options.window.addEventListener('blur', this.onBlur);
    options.window.addEventListener('resize', this.onResize);
    options.window.addEventListener('orientationchange', this.onOrientationChange);
    options.window.screen.orientation?.addEventListener('change', this.onOrientationChange);
  }

  destroy(): void {
    this.options.document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.options.window.removeEventListener('blur', this.onBlur);
    this.options.window.removeEventListener('resize', this.onResize);
    this.options.window.removeEventListener('orientationchange', this.onOrientationChange);
    this.options.window.screen.orientation?.removeEventListener('change', this.onOrientationChange);
  }
}
