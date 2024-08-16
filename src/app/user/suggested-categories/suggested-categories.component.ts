import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-suggested-categories',
  templateUrl: './suggested-categories.component.html',
  styleUrl: './suggested-categories.component.css'
})
export class SuggestedCategoriesComponent {

  data: any;
  searchQuery = '';
  constructor(private service: SharedService) { }

  ngOnInit() {
    this.getCategories();
    this.gatSuggestedCoaches();
  }

  btnLoader1: boolean = false;
  btnLoader: boolean = false;
  
  followId: any;

  getCategories() {
    this.service.getApi('user/categories').subscribe({
      next: resp => {
        this.data = resp.data
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  
  followCatg(postId: any) {
    this.btnLoader1 = true
    this.followId = postId;
    //this.isLike = !this.isLike;
    this.service.postAPI(`user/follow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCategories();
        this.btnLoader1 = false
      },
      error: error => {
        console.log(error.message)
        this.btnLoader1 = false
      }
    });
  }

  coaches: any;

  gatSuggestedCoaches(){
    this.service.getApi('user/coach/suggestedCoaches').subscribe({
      next: resp => {
        this.coaches = resp.data
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  followCoach(postId: any) {
    this.btnLoader = true;
    this.followId = postId;
    //this.isLike = !this.isLike;
    this.service.postAPI(`user/coach/follow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.gatSuggestedCoaches();
        this.btnLoader = false
      },
      error: error => {
        console.log(error.message);
        this.btnLoader = false
      }
    });
  }


}
