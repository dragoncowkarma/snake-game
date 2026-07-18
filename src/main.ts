export const APP_TITLE = 'Snake Game';
export const APP_BOOT_STATUS = 'Project scaffold ready';

export function mountApp(root: HTMLElement): void {
  const document = root.ownerDocument;
  const heading = document.createElement('h1');
  const status = document.createElement('p');

  heading.textContent = APP_TITLE;
  status.textContent = APP_BOOT_STATUS;

  root.replaceChildren(heading, status);
  root.dataset['appState'] = 'ready';
}

export function findAppRoot(document: Document): HTMLElement {
  const root = document.querySelector<HTMLElement>('#app');

  if (root === null) {
    throw new Error('Missing #app root element');
  }

  return root;
}

if (typeof document !== 'undefined') {
  mountApp(findAppRoot(document));
}
