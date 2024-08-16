import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { ForgotPasswordComponent } from './core/forgot-password/forgot-password.component';
import { HomeComponent } from './core/home/home.component';
import { VideoComponent } from './core/video/video.component';
import { SignupComponent } from './core/signup/signup.component';
import { OtpVarifyComponent } from './core/otp-varify/otp-varify.component';
import { SignupUserComponent } from './core/signup-user/signup-user.component';
import { ResetPasswordComponent } from './core/reset-password/reset-password.component';
import { OtpResetComponent } from './core/otp-reset/otp-reset.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "video",
    component: VideoComponent,
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "signup-user",
    component: SignupUserComponent,
  },
  {
    path: "reset-password/:fullMobileNumber/:role",
    component: ResetPasswordComponent,
  },
  {
    path: "otp/:fullMobileNumber/:role",
    component: OtpVarifyComponent,
  },
  {
    path: "otp-reset/:fullMobileNumber/:role",
    component: OtpResetComponent,
  },
  {
    path: 'user', canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
