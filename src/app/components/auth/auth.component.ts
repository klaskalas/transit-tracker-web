import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

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
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  displayName = '';
  message = '';
  isLoading = false;
  private returnUrl = '/map';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.returnUrl = returnUrl;
    }
    if (this.authService.getToken()) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

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
          void this.router.navigateByUrl(this.returnUrl);
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
        void this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.message = 'Registration failed. Try a different email.';
        this.isLoading = false;
      }
    });
  }
}
