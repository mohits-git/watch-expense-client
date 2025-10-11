import { Component, input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { CardComponent } from '../card.component';
import { CardVariant } from '@/shared/types';

@Component({
  selector: 'app-summary-card-skeleton',
  imports: [CardComponent, Skeleton],
  templateUrl: './summary-card-skeleton.component.html',
  styleUrl: './summary-card-skeleton.component.scss',
})
export class SummaryCardSkeletonComponent {
  variant = input<CardVariant>('');
}
