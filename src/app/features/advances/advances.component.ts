import { AdvanceSummaryComponent } from '@/shared/components/advance-summary/advance-summary.component';
import { NewAdvanceFormComponent } from '@/shared/components/new-advance-form/new-advance-form.component';
import { AdvancesService } from '@/shared/services/advances.service';
import { Advance, AdvanceStatusFilter, RequestStatus } from '@/shared/types';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '@/shared/components/spinner/spinner.component';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { getRouteSegments } from '@/shared/utils/routes.util';
import {
  ADVANCE,
  PRIMENG,
  API_MESSAGES,
  TOAST_SUMMARIES,
  TOAST_TYPES,
  APP_ROUTES,
  NAVIGATION_OPTIONS,
} from '@/shared/constants';

@Component({
  selector: 'app-advances',
  imports: [
    AdvanceSummaryComponent,
    NewAdvanceFormComponent,
    TableModule,
    TagModule,
    SelectButtonModule,
    DatePipe,
    FormsModule,
    SpinnerComponent,
    MessageModule,
    ButtonModule,
    PaginatorModule,
  ],
  templateUrl: './advances.component.html',
  styleUrl: './advances.component.scss',
})
export class AdvancesComponent implements OnInit {
  private advanceService = inject(AdvancesService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);

  totalRecords = signal<number>(0);
  advances = signal<Advance[] | null>(null);
  loading = signal(true);
  dataFetchingError = signal('');

  openNewAdvanceForm = signal(false);

  page = signal(0);
  limit = signal(5);
  status = signal<AdvanceStatusFilter>(ADVANCE.STATUS_FILTER.ALL);
  statusOptions = ADVANCE.STATUS_FILTER_OPTIONS;

  ngOnInit(): void {
    const paramsSub = this.activatedRoute.queryParams.subscribe({
      next: (value) => {
        const status = value[ADVANCE.QUERY_PARAMS.STATUS]
          ? (String(value[ADVANCE.QUERY_PARAMS.STATUS]) as RequestStatus)
          : undefined;
        const page = Number(value[ADVANCE.QUERY_PARAMS.PAGE] ?? 1);
        const limit = Number(value[ADVANCE.QUERY_PARAMS.LIMIT] ?? 10);

        this.status.set(status ?? ADVANCE.STATUS_FILTER.ALL);
        this.page.set(page);
        this.loading.set(true);
        this.advances.set(null);
        this.getAdvances(status, page, limit);
      },
    });

    this.destroyRef.onDestroy(() => {
      paramsSub.unsubscribe();
    });
  }

  getAdvances(status?: RequestStatus, page?: number, limit?: number) {
    this.advanceService.fetchAdvances(status, page, limit).subscribe({
      next: (val) => {
        this.advances.set(val.advances);
        this.totalRecords.set(val.totalAdvances);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: TOAST_TYPES.ERROR,
          summary: TOAST_SUMMARIES.ERROR,
          detail: err.message || API_MESSAGES.ADVANCE.FETCH_ERROR,
        });
        this.dataFetchingError.set(err.message);
      },
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case RequestStatus.Pending:
        return PRIMENG.SEVERITY.WARN;
      case RequestStatus.Approved:
        return PRIMENG.SEVERITY.SUCCESS;
      case RequestStatus.Rejected:
        return PRIMENG.SEVERITY.DANGER;
      case RequestStatus.Reviewed:
        return PRIMENG.SEVERITY.INFO;
      default:
        return PRIMENG.SEVERITY.PRIMARY;
    }
  }

  openAddAdvanceForm() {
    this.openNewAdvanceForm.set(true);
  }

  onPageChange(event: PaginatorState) {
    this.router.navigate(getRouteSegments(APP_ROUTES.ADVANCES), {
      queryParams: {
        page: `${(event.page ?? 0) + 1}`,
      },
      queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
    });
  }

  onStatusChange(status: AdvanceStatusFilter) {
    this.router.navigate(getRouteSegments(APP_ROUTES.ADVANCES), {
      queryParams: {
        status: status === ADVANCE.STATUS_FILTER.ALL ? null : status,
        page: `${1}`,
      },
      queryParamsHandling: NAVIGATION_OPTIONS.QUERY_PARAMS_HANDLING.MERGE,
    });
    this.page.set(0);
  }

  addNewAdvance(advance: Advance) {
    if (
      !this.status() ||
      this.status() === ADVANCE.STATUS_FILTER.ALL ||
      this.status() === ADVANCE.STATUS_FILTER.ALL
    ) {
      this.advances.update((advances) => [advance, ...(advances ?? [])]);
      this.totalRecords.update((total) => total + 1);
    }
  }
}
