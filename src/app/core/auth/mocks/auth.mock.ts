import { User, UserRole } from '../models/user.model';

export const AUTH_MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'Ivan',
    lastName: 'Živković',
    email: 'admin@faculty.test',
    role: UserRole.ADMIN,
  },
  {
    id: 2,
    firstName: 'Maja',
    lastName: 'Kovačević',
    email: 'professor@faculty.test',
    role: UserRole.PROFESSOR,
  },
  {
    id: 3,
    firstName: 'Luka',
    lastName: 'Stefanović',
    email: 'student@faculty.test',
    role: UserRole.STUDENT,
  },
];

export const DEMO_PASSWORD = 'Password123!';
