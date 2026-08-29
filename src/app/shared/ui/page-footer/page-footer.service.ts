import { Injectable, signal } from '@angular/core';

export type PageFooterActionVariant = 'button' | 'stroked' | 'flat' | 'fab';

export interface PageFooterAction {
  label?: string;
  icon?: string;
  type?: 'button' | 'submit';
  color?: 'primary' | 'accent' | 'warn';
  variant?: PageFooterActionVariant;
  disabled?: boolean;
  routerLink?: string | any[];
  onClick?: () => void;
  ariaLabel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PageFooterService {
  readonly actions = signal<PageFooterAction[]>([]);

  setActions(actions: PageFooterAction[]): void {
    this.actions.set(actions);
  }

  clear(): void {
    this.actions.set([]);
  }
}
