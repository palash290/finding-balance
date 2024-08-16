import { Component, ElementRef, ViewChild } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  searchQueryFilter = '';
  toSee: boolean = true
  seeGroupMembesr() {
    this.toSee = !this.toSee
  }

  isCoach: boolean = true;
  role: any;
  newMessage: any;
  messageList: any[] = [];
  private messageSubscription!: Subscription;

  constructor(private chatService: SocketService, private service: SharedService) { }


  ngOnInit() {
    this.chatService.connectSocket();
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }

    // this.messageSubscription = this.chatService.getMessage().subscribe((message: any) => {

    //   this.messageList.push(message);
    //   console.log('=====>', message);
    // });

    this.messageSubscription = this.chatService.getMessage().subscribe((message: any) => {
      // Check if the incoming message is for the current active chat
      if (message && message.chatId !== this.currentChatId) {
        // Find the chat in chatsList and update unread count
        const chat = this.chatsList.find((chat: { id: any; }) => chat.id === message.chatId);
        if (chat) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }

        // Update the view by triggering change detection if needed
        // this.changeDetectorRef.detectChanges(); // Uncomment if change detection is not automatic
        this.getAllChats();
      }

      // Add the message to the message list if it's for the current chat
      if (message.chatId === this.currentChatId) {
        this.messageList.push(message);
        this.messageList = this.messageList;
        this.getChatMessages(this.currentChatId);
        //this.getAllChats();
      }
    });


    this.getAllChats()
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  @ViewChild('closeModal') closeModal!: ElementRef;
  // @ViewChild('closeModal1') closeModal1!: ElementRef;
  searchQuery: string = '';
  coachesList: any;
  coachListVisible = false;
  searchCoachesList() {
    const url = `user/coach/followedCoaches?search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        //this.coachListVisible = !this.coachListVisible;

        this.coachesList = resp.data || [];
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  followersList: any;
  followersVisible = false;
  searchFollowUsersList() {
    const url = `coach/myFollowers?search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        //this.followersVisible = !this.followersVisible;
        this.followersList = resp.data || [];
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  openChatId: boolean = false;
  createChat(coachId: any) {
    this.service.postAPI(this.isCoach ? `coach/chat/${coachId}` : `user/chat/${coachId}`, null).subscribe({
      next: (resp) => {
        this.getAllChats();
        this.searchQuery = ''
        this.closeModal.nativeElement.click();
        this.openChatId = true;
        if (this.openChatId) {
          this.getChatMessages(resp.data?.id);
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  chatsList: any;
  participantAvatarUrl: string | undefined;
  participantFullName: string | undefined;

  getAllChats() {
    // Fetch all chats to find the one with the currentChatId
    this.service.getApi(this.isCoach ? `coach/chat` : `user/chat`).subscribe({
      next: resp => {
        this.chatsList = resp.data;



        // Find the chat with the currentChatId
        const currentChat = resp.data.find((chat: { id: any; }) => chat.id === this.currentChatId);

        if (currentChat) {
          // Extract participant details
          const participant = currentChat.participants[0]; // Adjust if necessary

          if (participant) {
            this.participantAvatarUrl = participant.User?.avatar_url ? participant.User?.avatar_url : participant.Coach?.avatar_url; // Adjust if the role is 'COACH'
            this.participantFullName = participant.User?.full_name ? participant.User?.full_name : participant.Coach?.full_name; // Adjust if the role is 'COACH'
          }
        }
        // console.log('Participant Avatar URL:', this.participantAvatarUrl);
        // console.log('Participant Full Name:', this.participantFullName);
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  currentChatId: any;

  getChatMessages(chatId: any) {
    this.currentChatId = chatId;
    this.service.getApi(this.isCoach ? `coach/message/${chatId}` : `user/message/${chatId}`).subscribe({
      next: (resp) => {
        this.activeChat(chatId)
        this.messageList = resp.data.reverse();
        this.getAllChats();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  activeChat(chatId: any) {
    const formURlData = new URLSearchParams();
    formURlData.set('chatId', chatId);
    this.service.postAPI(this.isCoach ? `coach/chat/chatStatus` : `user/chat/chatStatus`, formURlData.toString()).subscribe({
      next: (resp) => {
        // this.getChatMessages(this.currentChatId);
        // this.newMessage = '';
        // this.isDisabled = false;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  isDisabled: boolean = false;

  sendMessage() {
    this.isDisabled = true;
    if (this.newMessage.trim()) {
      //this.chatService.sendMessage(this.newMessage, this.currentChatId);
      const formURlData = new URLSearchParams();
      formURlData.set('content', this.newMessage);
      this.service.postAPI(this.isCoach ? `coach/message/${this.currentChatId}` : `user/message/${this.currentChatId}`, formURlData.toString()).subscribe({
        next: (resp) => {
          this.getChatMessages(this.currentChatId);
          this.newMessage = '';
          this.isDisabled = false;
        },
        error: error => {
          console.log(error.message)
        }
      });
    }
  }


  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  formatTimestamp1(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // return `${hours}:${minutes} - ${day}-${month}-${year}`;
    return `${hours}:${minutes}`;
  }

  isChatActive = false;

  //responsive hide/show
  openChat() {
    this.isChatActive = true;
  }
  closeChat() {
    this.isChatActive = false;
  }

  getLimitedText(text: string, limit: number): string {
    if (!text) return '';

    const words = text.split(' ');
    if (words.length <= limit) {
      return text;
    }

    const limitedWords = words.slice(0, limit).join(' ');
    return `${limitedWords}...`;  // Add ellipsis to indicate more text
  }

  teamName: string = '';
  selectedFollowerIds: number[] = [];
  @ViewChild('closeModal1') closeModal1!: ElementRef;

  toggleSelection(followerId: number) {
    const index = this.selectedFollowerIds.indexOf(followerId);
    if (index === -1) {
      this.selectedFollowerIds.push(followerId);
    } else {
      this.selectedFollowerIds.splice(index, 1);
    }
  }

  isSelected(followerId: number): boolean {
    return this.selectedFollowerIds.includes(followerId);
  }

  createTeam() {
    const payload = {
      receiverIds: this.selectedFollowerIds,
      chatName: this.teamName
    }
    this.service.postAPIJson(`coach/chat`, payload).subscribe({
      next: (resp) => {
        this.getAllChats();
        this.closeModal1.nativeElement.click();
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


}
