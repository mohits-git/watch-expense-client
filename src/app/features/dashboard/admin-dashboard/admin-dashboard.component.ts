import { Component } from '@angular/core';
import { UsersSummaryComponent } from './users-summary/users-summary.component';
import { DepartmentsSummaryComponent } from './departments-summary/departments-summary.component';
import { ProjectsSummaryComponent } from './projects-summary/projects-summary.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    UsersSummaryComponent,
    DepartmentsSummaryComponent,
    ProjectsSummaryComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {}
