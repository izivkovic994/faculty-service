import { Component } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { APP_NAME } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class ToolbarComponent {
  protected readonly appName = APP_NAME;
}
