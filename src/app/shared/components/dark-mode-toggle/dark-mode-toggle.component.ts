import { Component, DestroyRef, effect, inject, signal } from '@angular/core';

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

  toggleDarkMode() {
    this.darkMode.update((v) => !v);
  }
}
