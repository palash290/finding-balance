import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  currentMessage = new BehaviorSubject<any>(null);

  constructor(private afMessaging: AngularFireMessaging) {
    this.afMessaging.messages.subscribe((message) => {
      console.log('Message received: ', message);
      this.currentMessage.next(message);
    });
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token: any) => {
        localStorage.setItem('fcmFbToken', token)
        console.log('FCM Token:', token);
      },
      (error) => {
        console.error('Error getting permission or token: ', error);
      }
    );
  }
 

}
