import { UserRole } from "../enums/user-role.enum";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number;
  projectId?: string;
  departmentId?: string;
}
