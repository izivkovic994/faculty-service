import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PageFooterService } from './page-footer.service';

@Component({
  selector: 'app-page-footer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './page-footer.html',
  styleUrl: './page-footer.scss',
})
export class PageFooterComponent {
  private readonly pageFooterService = inject(PageFooterService);

  protected readonly actions = this.pageFooterService.actions;

  protected handleAction(action: { onClick?: () => void }): void {
    action.onClick?.();
  }
}
