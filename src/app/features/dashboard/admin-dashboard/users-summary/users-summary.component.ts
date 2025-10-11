import { CardComponent } from '@/shared/components/card/card.component';
import { UserService } from '@/shared/services/user.service';
import { UsersSummary } from '@/shared/types';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DEFAULTS, TOAST_TYPES, TOAST_SUMMARIES } from '@/shared/constants';
import { SummaryCardSkeletonComponent } from '@/shared/components/card/summary-card-skeleton/summary-card-skeleton.component';

@Component({
  selector: 'app-users-summary',
  imports: [CardComponent, SummaryCardSkeletonComponent],
  templateUrl: './users-summary.component.html',
  styleUrl: './users-summary.component.scss',
})
export class UsersSummaryComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  summary = signal<UsersSummary>(DEFAULTS.ADMIN.USERS_SUMMARY);
  loading = signal(true);

  ngOnInit() {
    this.userService.getUsersSummary().subscribe({
      next: (summary: UsersSummary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: err.message,
        });
      },
    });
  }
}
