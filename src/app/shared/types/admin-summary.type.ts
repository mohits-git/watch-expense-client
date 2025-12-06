export interface AdminSummaryCardData {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface AdminDashboardSummary {
  users: UsersSummary;
  departments: DepartmentsSummary;
  projects: ProjectsSummary;
}

export interface UsersSummary {
  totalUsers: number;
  adminUsers: number;
  employeeUsers: number;
}

export interface DepartmentsSummary {
  totalDepartments: number;
  totalBudget: number;
  averageBudget: number;
}

export interface ProjectsSummary {
  totalProjects: number;
  totalBudget: number;
  averageBudget: number;
  activeProjects: number;
}
