import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  newForm!: FormGroup;
  role: any;
  isCoach: boolean = true;
  UploadedProfile!: File;
  UploadedBg!: File;
  data: any;
  loading: boolean = false;

  imageChanged: boolean = false;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.initForm();
    this.getProfileData();
  }

  initForm() {
    this.newForm = new FormGroup({
      full_name: new FormControl('', Validators.required),
      about_me: new FormControl('', Validators.required),
      avatar: new FormControl(null),
      cover: new FormControl(null),
    })
  }

  getProfileData() {
    this.service.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.data = resp.data;
          this.newForm.patchValue({
            full_name: this.data.full_name,
            about_me: this.data.about_me,

          })
        } else {
          this.data = resp.user;
          this.newForm.patchValue({
            full_name: this.data.full_name,
            about_me: this.data.about_me,
          })
        }
        this.croppedImage = this.data.cover_photo_url

      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  handleFileInput2(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('blah2') as HTMLImageElement;

    if (img && file) {
      img.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files?.length > 0) {
      this.UploadedProfile = inputElement.files[0];
    }
  }

  handleFileInput1(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('blah1') as HTMLImageElement;

    if (img && file) {
      img.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files?.length > 0) {
      this.UploadedBg = inputElement.files[0];
    }
  }

  onUpdate() {
    this.newForm.markAllAsTouched();

    if (this.newForm.valid) {
      this.loading = true;
      const formURlData = new FormData();
      formURlData.set('full_name', this.newForm.value.full_name);
      if (this.newForm.value.about_me) {
        formURlData.set('about_me', this.newForm.value.about_me);
      }
      if (this.UploadedProfile) {
        formURlData.append('avatar', this.UploadedProfile);
      }
      // if (this.UploadedBg) {
      //   formURlData.append('cover', this.UploadedBg);
      // }
      // Append the cropped image if it has changed
      if (this.imageChanged && this.cropImgBlob) {
        const file = new File([this.cropImgBlob], 'profile_image.png', {
          type: 'image/png'
        });
        formURlData.append('cover', file);
      }
      // const file = new File([this.cropImgBlob], 'profile_image.png', {
      //   type: 'image/png'
      // })

      // if (file) {
      //   formURlData.append('cover', file);
      // }
      //formURlData.append('image', this.UploadedFile);
      this.service.postAPIFormData(this.isCoach ? 'coach/editProfile' : 'user/editProfile', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.toastr.success(resp.message);
            this.route.navigateByUrl('user/main/my-profile');
            this.loading = false;
            this.service.triggerRefresh();
            this.croppedImage = null;
            this.cropImgBlob = null;
            this.imageChanged = false;
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.loading = false;
          this.toastr.error('Something went wrong.');
          console.log(error.statusText)
        }
      })
    }
  }



  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | null = '';
  cropImgBlob: any

  @ViewChild('closeModal') closeModal!: ElementRef;

  fileChangeEvent(event: Event): void {
    if (!this.croppedImage) {
      this.closeModal.nativeElement.click();
    }
    this.imageChangedEvent = event;
  }
  imageCropped(event: any) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    this.cropImgBlob = event.blob;
    this.imageChanged = true;
    // event.blob can be used to upload the cropped image
  }




}
