const STORAGE_KEY = 'alpha-strike-fullscreen';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

function requestFS(): void {
  document.documentElement.requestFullscreen?.().catch(() => {});
}

function showModal(): void {
  const overlay = document.createElement('div');
  overlay.className = 'fs-modal-overlay';

  const box = document.createElement('div');
  box.className = 'fs-modal';

  const title = document.createElement('p');
  title.className = 'fs-modal__title';
  title.textContent = 'Fullscreen Mode';

  const desc = document.createElement('p');
  desc.className = 'fs-modal__desc';
  desc.textContent = 'Hide the status bar for a cleaner experience?';

  const btnFS = document.createElement('button');
  btnFS.className = 'fs-modal__btn fs-modal__btn--primary';
  btnFS.textContent = 'Go Fullscreen';

  const btnNo = document.createElement('button');
  btnNo.className = 'fs-modal__btn fs-modal__btn--secondary';
  btnNo.textContent = 'No Thanks';

  btnFS.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'fullscreen');
    requestFS();
    overlay.remove();
  });

  btnNo.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEY, 'normal');
    overlay.remove();
  });

  box.append(title, desc, btnFS, btnNo);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

export function initFullscreen(): void {
  if (!isStandalone()) return;

  const pref = localStorage.getItem(STORAGE_KEY);

  if (pref === 'fullscreen') {
    // Needs a user gesture — re-enter fullscreen on first tap
    const handler = () => {
      requestFS();
    };
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
  } else if (pref === null) {
    showModal();
  }
  // pref === 'normal': do nothing
}
