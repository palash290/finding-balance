import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrl: './following.component.css'
})
export class FollowingComponent {

  data: any;
  searchQuery: string = '';
  isFollowing: { [key: number | string]: boolean } = {};
  avatar_url_fb: any;

  constructor(private service: SharedService) { }

  ngOnInit() {
    this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
    // this.getCategories();
    this.searchCategories();
  }

  getCategories() {
    this.service.getApi('user/coach/followedCoaches').subscribe({
      next: resp => {
        this.data = resp.data;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  searchCategories() {
    const url = `user/coach/followedCoaches?search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        this.data = resp.data || [];
        // Reset follow state for each category if needed
        this.data.forEach((category: { following: { id: string | number; }; isFollowing: any; }) => {
          this.isFollowing[category.following.id] = category.isFollowing;
        });
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  btnLoader: boolean = false;

  followId: any;

  unfollowCoach(postId: any) {
    //this.isLike = !this.isLike;
    this.followId = postId;
    this.btnLoader = true

    this.service.postAPI(`user/coach/unfollow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCategories();
        this.btnLoader = false;
      },
      error: error => {
        this.btnLoader = false
        console.log(error.message)
      }
    });
  }

}
