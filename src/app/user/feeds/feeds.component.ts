import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrl: './feeds.component.css'
})
export class FeedsComponent {

  isCoach: boolean = true;
  role: any;
  data: any;
  userId: any;
  isActive: boolean = false;

  currentComponent: string = 'suggestedCategories';

  constructor(private visibilityService: SharedService) { }

  ngOnInit() {
    // this.visibilityService.toggleState$.subscribe(state => {
    //   this.isActive = state;
    // });

    this.userId = localStorage.getItem('fbId');
    this.role = this.visibilityService.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
      this.currentComponent = 'notification'
    }

    this.visibilityService.showComponent$.subscribe(component => {
      this.currentComponent = component;
    });
    this.getProfileData();
    this.visibilityService.triggerRefresh()

  }


  shortTextLength: number = 100;
  durationOrg: any;

  getProfileData() {
    this.visibilityService.getApi(this.isCoach ? 'coach/post' : 'user/allPosts').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false })).reverse();
        } else {
          this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        }

        // setTimeout(() => {
        //   const player: any = document.getElementById('audioPlayer');
        //   this.durationOrg = player.duration;
        //   const minutes = Math.floor(this.durationOrg / 60);
        //   const seconds = Math.floor(this.durationOrg % 60);
        //   const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        //   this.duration = formattedDuration
        // }, 1000);

      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  fileName = '';
  formattedTime: any = 0;
  duration: any = 0;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  isPlaying = false;

  bar: any = 0;

  togglePlayback() {
    const player = this.audioPlayer.nativeElement;
    setInterval(() => {
      if (player.readyState >= 1) {
        const current_time = player.currentTime;
        const minutesC = Math.floor(current_time / 60);
        const secondsC = Math.floor(current_time % 60);
        const formattedDurationCurrent = `${minutesC}:${secondsC < 10 ? '0' : ''}${secondsC}`;
        this.formattedTime = formattedDurationCurrent;
        this.bar = (current_time / this.durationOrg) * 100
        console.log('==>', this.bar)
      }
    }, 1000);

    if (this.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    this.isPlaying = !this.isPlaying;

  }


  testFun() {
    const player: any = document.getElementById('audioPlayer');
    player.currentTime = this.bar;
  }




  toggleContent(index: number): void {
    this.data[index].isExpanded = !this.data[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }

  isLike = false;

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
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
    const trimmedMessage = this.commentText?.trim();
    if (trimmedMessage === '') {
      return;
    }
    const formData = new URLSearchParams();
    formData.set('postId', id);
    formData.set('content', this.commentText);
    this.btnLoader = true;
    this.visibilityService.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
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
    this.visibilityService.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
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

  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    //this.isLike = !this.isLike;
    this.btnLoaderCmt = true;
    this.visibilityService.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
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


  likeComment(cmtId: any, postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(this.isCoach ? `coach/comment/react/${cmtId}` : `user/post/comment/react/${cmtId}`, null).subscribe({
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


  deletePost(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.visibilityService.deleteAcc(`coach/post/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your post has been deleted successfully.',
                'success'
              );
              this.getProfileData();
              //this.route.navigateByUrl('/home')
              //this.toastr.success(resp.message);
            } else {
              this.getProfileData();
              //this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getProfileData();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }





}
