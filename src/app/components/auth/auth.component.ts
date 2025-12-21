import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  displayName = '';
  message = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  toggleMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.message = '';
  }

  submit(): void {
    this.message = '';
    this.isLoading = true;

    if (this.mode === 'login') {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.message = 'Logged in successfully.';
          this.isLoading = false;
        },
        error: () => {
          this.message = 'Login failed. Check your email and password.';
          this.isLoading = false;
        }
      });
      return;
    }

    this.authService.register({
      email: this.email,
      password: this.password,
      displayName: this.displayName || undefined
    }).subscribe({
      next: () => {
        this.message = 'Account created. You are logged in.';
        this.isLoading = false;
      },
      error: () => {
        this.message = 'Registration failed. Try a different email.';
        this.isLoading = false;
      }
    });
  }
}
