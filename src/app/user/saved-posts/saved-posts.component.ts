import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-saved-posts',
  templateUrl: './saved-posts.component.html',
  styleUrl: './saved-posts.component.css'
})
export class SavedPostsComponent {

  role: any;
  data: any;
  userId: any;
  constructor(private visibilityService: SharedService) { }

  ngOnInit() {
    this.userId = localStorage.getItem('fbId');
    this.getProfileData();
  }


  shortTextLength: number = 100;

  getProfileData() {
    this.visibilityService.getApi('user/post/savedPosts').subscribe({
      next: resp => {
        this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  toggleContent(index: number): void {
    this.data[index].isExpanded = !this.data[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }


  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    //this.isLike = !this.isLike;
    this.btnLoaderCmt = true;
    this.visibilityService.deleteAcc(`user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
        this.btnLoaderCmt = false;
        this.getProfileData();
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmt = false;
      }
    });
  }

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(`user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getProfileData();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentText: any;
  btnLoader: boolean = false;

  addComment(id: any) {
    const trimmedMessage = this.commentText.trim();
    if (trimmedMessage === '') {
      return;
    }
    const formData = new URLSearchParams();
    formData.set('postId', id);
    formData.set('content', this.commentText);
    this.btnLoader = true;
    this.visibilityService.postAPI(`user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(id);
        this.btnLoader = false;
        this.getProfileData();
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoader = false;
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;
  // toggleCommentBox(postId: any) {
  //   this.showCmt[postId] = !this.showCmt[postId];
  //   this.getPostComments(postId);
  // }

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      // Toggle off if the same box is clicked again
      this.showCmt[id] = !this.showCmt[id];
      if (!this.showCmt[id]) {
        this.currentOpenCommentBoxId = null;
      }
    } else {
      // Close any previously open box and open the new one
      this.showCmt[this.currentOpenCommentBoxId || -1] = false;
      this.currentOpenCommentBoxId = id;
      this.showCmt[id] = true;
      this.getPostComments(id);
    }
  }

  getPostComments(postId: any) {
    this.visibilityService.getApi(`user/post/comment/${postId}`).subscribe({
      next: resp => {
        this.postComments = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
        //this.postComments = [...tempData, ...this.postComments]
        //console.log('========>', this.postComments)
        this.commentsToShow[postId] = this.defaultCommentsCount;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }

  likeComment(cmtId: any, postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(`user/post/comment/react/${cmtId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  bookmarkPost(postId: any) {
    //this.isBookmark = !this.isBookmark;
    this.visibilityService.postAPI(`user/post/saveOrUnsave/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getProfileData();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }


}
