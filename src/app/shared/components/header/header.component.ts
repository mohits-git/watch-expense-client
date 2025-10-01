import { AuthService } from '@/features/auth/services/auth.serivce';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MenubarModule, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  authService = inject(AuthService);
  router = inject(Router);

  items = computed((): MenuItem[] => {
    const isAuthenticated = this.authService.isAuthenticated();
    return [
      {
        label: 'Home',
        routerLink: ['dashboard'],
        visible: isAuthenticated,
      },
      {
        label: 'Home',
        routerLink: [''],
        visible: !isAuthenticated,
      },
      {
        label: 'Login',
        routerLink: ['auth', 'login'],
        visible: !isAuthenticated,
      },
      {
        label: 'Logout',
        visible: isAuthenticated,
        command: () => {
          this.authService.logout();
          this.router.navigate(['auth', 'login'])
        },
      },
    ];
  });
}
