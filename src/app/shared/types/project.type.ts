export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: number;
  endDate: number;
  projectManagerId: string;
  departmentId: string;
  createdAt: number;
  updatedAt: number;
}
