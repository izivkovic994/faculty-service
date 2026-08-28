import { User, UserRole } from '../models/user.model';

export const AUTH_MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'Ivan',
    lastName: 'Živković',
    displayName: 'Ivan Živković',
    email: 'admin@faculty.test',
    role: UserRole.ADMIN,
  },
  {
    id: 2,
    firstName: 'Maja',
    lastName: 'Kovačević',
    displayName: 'Maja Kovačević',
    email: 'professor@faculty.test',
    role: UserRole.PROFESSOR,
  },
  {
    id: 3,
    firstName: 'Luka',
    lastName: 'Stefanović',
    displayName: 'Luka Stefanović',
    email: 'student@faculty.test',
    role: UserRole.STUDENT,
  },
  {
    id: 4,
    firstName: 'Ana',
    lastName: 'Jurić',
    displayName: 'Ana Jurić',
    email: 'math.professor@faculty.test',
    role: UserRole.PROFESSOR,
  },
];

export const DEMO_PASSWORD = 'Password123!';
