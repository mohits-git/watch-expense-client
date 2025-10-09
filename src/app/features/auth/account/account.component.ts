import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../services/auth.serivce';
import { User } from '@/shared/types/user.type';
import { CardComponent } from '@/shared/components/card/card.component';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-account',
  imports: [CardComponent, AvatarModule, SkeletonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  authService = inject(AuthService);
  userDetails = signal<User | null>(null);

  ngOnInit(): void {
    this.authService.authMe().subscribe({
      next: (user) => {
        this.userDetails.set({ ...user });
      },
    });
  }
}
