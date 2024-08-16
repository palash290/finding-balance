import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { filter, interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-otp-reset',
  templateUrl: './otp-reset.component.html',
  styleUrl: './otp-reset.component.css'
})
export class OtpResetComponent {

  fullMobileNumber: any | undefined;
  role: string | undefined;
  isCoach: boolean = true;

  loginForm!: FormGroup
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private service: SharedService, private router: Router) { }

  ngOnInit(): void {
    this.startCountdown();
    this.route.paramMap.subscribe(params => {
      this.fullMobileNumber = params.get('fullMobileNumber') || '';
      this.role = params.get('role') || '';
    });

    if (this.role == 'user') {
      this.isCoach = false;
    }
    this.initForm();
  }

  initForm() {
    this.loginForm = new FormGroup({
      otp1: new FormControl('', Validators.required),
      otp2: new FormControl('', Validators.required),
      otp3: new FormControl('', Validators.required),
      otp4: new FormControl('', Validators.required),
    })
  }

  verifyOtp() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      const otpValues = Object.values(this.loginForm.value).join('');
      formURlData.set('phone_no', this.fullMobileNumber);
      formURlData.set('otp', otpValues);
      //formURlData.set('categoryId', this.loginForm.value.categoryId);
      this.service.loginUser(this.isCoach ? 'coach/verify' : 'user/verify', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.loading = false;
            this.router.navigateByUrl(`/reset-password/${this.fullMobileNumber}/${this.role}`);
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error.message);
        }
      });
    }
  }

  toggleUser() {
    this.isCoach = !this.isCoach
  }

  onInput(event: Event, nextControlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.value?.length >= input.maxLength) {
      const nextInput = document.querySelector(`[formControlName=${nextControlName}]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }



  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    localStorage.removeItem('countdown');
    localStorage.removeItem('countdownTimestamp');
  }

  formattedCountdown: string = '';

  countdown: number = 0; // Countdown time in seconds
  countdownSubscription!: Subscription;
  timer: boolean = false;

  startCountdown(): void {
    const savedCountdown = localStorage.getItem('countdown');
    const savedTimestamp = localStorage.getItem('countdownTimestamp');

    if (savedCountdown && savedTimestamp) {
      // Calculate elapsed time
      const elapsedTime = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      this.countdown = parseInt(savedCountdown) - elapsedTime;

      // Ensure countdown does not go below zero
      if (this.countdown < 0) {
        this.countdown = 0;
      }
    } else {
      this.countdown = 60; // Default countdown time in seconds
    }

    this.timer = true;
    this.updateFormattedCountdown();

    // Unsubscribe from any previous subscription
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      this.updateFormattedCountdown();

      if (this.countdown <= 0) {
        this.timer = false;
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
        // Clear stored countdown data when timer finishes
        localStorage.removeItem('countdown');
        localStorage.removeItem('countdownTimestamp');
      } else {
        // Update stored countdown data
        localStorage.setItem('countdown', this.countdown.toString());
        localStorage.setItem('countdownTimestamp', Date.now().toString());
      }
    });
  }


  updateFormattedCountdown(): void {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.formattedCountdown = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  resendCode() {
    const formURlData = new URLSearchParams();
    const jaonData: any = (localStorage.getItem('signupDet'));
    const data = JSON.parse(jaonData)
    formURlData.set('phone_no', this.fullMobileNumber);
    formURlData.set('email', data?.email);
    formURlData.set('full_name', data?.full_name);
    formURlData.set('password', data?.password);
    if(data?.categoryId){
      formURlData.set('categoryId', data?.categoryId);
    }
    this.service.loginUser(this.isCoach ? 'coach/signup' : 'user/signup', formURlData.toString()).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.loading = false;
          this.timer = true;
          this.startCountdown();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error.message);
      }
    });
  }

}
