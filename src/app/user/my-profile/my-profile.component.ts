import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {

  isCoach: boolean = true;
  role: any;

  constructor(private service: SharedService) { 
    this.role = this.service.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }
  }

  profileForm!: FormGroup;
  userDet: any;
  userEmail: any;
  name: any;
  cover_photo_url: any;
  avatar_url: any
  category: any;

  ngOnInit() {
    this.loadUserProfile();
  }


  loadUserProfile() {
    this.service.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: (resp) => {
        if(this.isCoach){
          this.userEmail = resp.data.about_me;
          this.name = resp.data.full_name;
          this.avatar_url = resp.data.avatar_url;
          this.cover_photo_url = resp.data.cover_photo_url;
          this.category = resp.data.category.name;
        } else {
          this.userEmail = resp.user.about_me;
          this.name = resp.user.full_name;
          this.avatar_url = resp.user.avatar_url;
          this.cover_photo_url = resp.user.cover_photo_url;
        }
      
      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


}
