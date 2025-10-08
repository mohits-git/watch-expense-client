import { AdvanceSummaryComponent } from '@/shared/components/advance-summary/advance-summary.component';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-advance',
  imports: [AdvanceSummaryComponent],
  templateUrl: './advance.component.html',
  styleUrl: './advance.component.scss'
})
export class AdvanceComponent {
  newAdvance = signal<boolean>(false);

  openAddAdvanceForm() {
    this.newAdvance.set(true);
  }
}
