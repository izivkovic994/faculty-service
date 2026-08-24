import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { DEMO_PASSWORD } from '../../mocks/auth.mock';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);

  readonly isSubmitting = this.authService.isLoading;
  readonly loginError = this.authService.errorMessage;
  readonly demoUsers = this.authService.demoUsers;
  readonly demoPassword = DEMO_PASSWORD;

  emailCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  passwordCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  login(): void {
    if (this.emailCtrl.invalid || this.passwordCtrl.invalid) {
      return;
    }

    this.authService.login(this.emailCtrl.value, this.passwordCtrl.value);
  }
}
