import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  isCoach: boolean = true;
  role: string | undefined;

  data: any;

  constructor(private service: SharedService, private route: ActivatedRoute, private socketService: SocketService) { }

  ngOnInit() {

    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.readAllNotification();
    this.getNotification();
  }

  getNotification() {
    this.service.getApi(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
      next: resp => {
        this.data = resp.data.notifications;
        
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  readAllNotification() {
    this.service.putApi(this.isCoach ? 'coach/notifications' : 'user/notifications/markAllRead', null).subscribe({
      next: resp => {
        this.getNotification();
        localStorage.setItem('unreadNotifications', '0');
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  deleteAllNotification() {
    this.service.deleteAcc(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
      next: resp => {
        this.getNotification();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  cleanNotificationContent(fullName: string, content: string): string {
    const name = fullName.trim();
    const contentTrimmed = content.trim();

    if (contentTrimmed.startsWith(name)) {
      return contentTrimmed.slice(name.length).trim();
    }

    return contentTrimmed;
  }

}
