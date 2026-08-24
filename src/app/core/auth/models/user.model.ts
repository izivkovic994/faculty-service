export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  role: UserRole;
}
