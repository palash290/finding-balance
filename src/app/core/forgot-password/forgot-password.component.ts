import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import * as countryCodes from 'country-codes-list';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isCoach: boolean = false;
  isPasswordVisible: boolean = false;
  loginForm!: FormGroup;
  countries: { name: string, dialCode: string }[] = [];
  selectedCountryCode: string = '91';
  loading: boolean = false;

  constructor(private route: Router, private srevice: SharedService, private toastr: ToastrService) { }

  ngOnInit(): void {
    const countryList: any = countryCodes.all();

    // Map the list to the format required for the dropdown
    this.countries = Object.keys(countryList).map(key => {
      const country = countryList[key];
      return {
        name: country.countryNameEn,
        dialCode: country.countryCallingCode
      };
    });
    this.initForm();
  }

  initForm() {
    const defaultCountry = this.countries[0];
    this.loginForm = new FormGroup({
      phone_no: new FormControl('', Validators.required),
      countryCode: new FormControl(defaultCountry.dialCode, Validators.required),
    })
  }


  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      const countryCode = this.loginForm.get('countryCode')?.value;
      const mobileNumber = this.loginForm.get('phone_no')?.value;
      const fullMobileNumber = `+${countryCode}${mobileNumber}`;
      formURlData.set('phone_no', fullMobileNumber);
      this.srevice.resetPassword(this.isCoach ? 'coach/forgetPassword' : 'user/forgetPassword', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            this.loading = false;
            const role = this.isCoach ? 'coach' : 'user'
            this.route.navigateByUrl(`/otp-reset/${fullMobileNumber}/${role}`);
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Something went wrong.');
          console.error('Login error:', error.message);
        }
      });
    }
  }


  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleUser(){
    this.isCoach = !this.isCoach
  }


}
