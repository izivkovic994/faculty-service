import { NavigationItem } from '../../models/navigation-item.model';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Home',
    icon: 'home',
    route: '/home',
  },
  {
    label: 'News',
    icon: 'feed',
    route: '/news',
  },
  {
    label: 'Exam Registration',
    icon: 'edit_calendar',
    route: '/exam-registration',
  },
  {
    label: 'My Exams',
    icon: 'school',
    route: '/my-exams',
  },
  {
    label: 'Financials',
    icon: 'payments',
    route: '/financials',
  },
  {
    label: 'Support',
    icon: 'help',
    route: '/support',
  },
  {
    label: 'Administration',
    icon: 'admin_panel_settings',
    route: '/administration',
  },
];
