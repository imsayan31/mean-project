import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  authStatus = new Subscription();
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authStatus = this.authService.getAuthStatus().subscribe(authStatusRes => {
      this.isLoading = false;
    });
  }

  onLogIn(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatus.unsubscribe();
  }

}
