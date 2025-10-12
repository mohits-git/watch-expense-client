import { AuthService } from '@/shared/services/auth.serivce';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, UrlTree } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle.component';
import { getRouteSegments } from '@/shared/utils/routes.util';
import { APP_ROUTES } from '@/shared/constants';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    AvatarModule,
    ButtonModule,
    DarkModeToggleComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  isAuthenticated = this.authService.isAuthenticated;

  items = computed((): MenuItem[] => {
    const isAuthenticated = this.isAuthenticated();
    return [
      {
        label: 'Dashboard',
        visible: isAuthenticated,
        routerLink: getRouteSegments(APP_ROUTES.DASHBOARD),
      },
      {
        label: 'Expenses',
        visible: isAuthenticated,
        routerLink: getRouteSegments(APP_ROUTES.EXPENSES),
      },
      {
        label: 'Advance',
        visible: isAuthenticated,
        routerLink: getRouteSegments(APP_ROUTES.ADVANCES),
      },
    ];
  });

  onLogout() {
    this.authService.logout();
    this.router.navigate(getRouteSegments(APP_ROUTES.AUTH.LOGIN));
  }
}
