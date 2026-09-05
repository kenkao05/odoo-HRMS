export interface Profile {
  id: string;
  employee_id: string | null;
  role: Role;
  roles: Role[];
  active: boolean;
}