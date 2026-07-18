import { describe, expect, it } from 'vitest';

import { APP_BOOT_STATUS, APP_TITLE } from './main';

describe('application entry', () => {
  it('exports the boot contract rendered by the real entry module', () => {
    expect({ title: APP_TITLE, status: APP_BOOT_STATUS }).toEqual({
      title: 'Snake Game',
      status: 'Project scaffold ready',
    });
  });
});
