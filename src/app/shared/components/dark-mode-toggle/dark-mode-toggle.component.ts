import { Component, DestroyRef, effect, inject, signal } from '@angular/core';

const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-dark-mode-toggle',
  imports: [],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.scss',
})
export class DarkModeToggleComponent {
  darkMode = signal(false);
  private destroyRef = inject(DestroyRef);

  constructor() {
    const effectRef = effect(() => {
      const html = document.querySelector('html');
      if (this.darkMode()) {
        html?.classList.add('dark');
      } else {
        html?.classList.remove('dark');
      }
    });
    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  ngOnInit() {
    const savedMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedMode !== null) {
      this.darkMode.set(savedMode === 'true');
    }
  }

  toggleDarkMode() {
    this.darkMode.update((v) => !v);
    localStorage.setItem('darkMode', this.darkMode() ? 'true' : 'false');
  }
}
