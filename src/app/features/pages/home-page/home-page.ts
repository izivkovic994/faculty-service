import { Component } from '@angular/core';

import { APP_NAME } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  protected readonly appName = APP_NAME;
}
