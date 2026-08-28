import { Component } from '@angular/core';

import { APP_NAME } from '../../../../core/constants/app.constants';
import { MockAuthRepository } from '../../../../core/auth/services/auth.repository-mocked';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  authRepoMock = new MockAuthRepository();

  protected readonly appName = APP_NAME;
  protected readonly userDisplayName = this.authRepoMock.currentUser()?.displayName;
}
