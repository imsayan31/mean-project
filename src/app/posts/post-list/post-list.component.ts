import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = true;
  isAuthenticated = false;
  userId: string;
  private postSub: Subscription;
  private authStatus: Subscription;

  constructor(public postService: PostService, private authService: AuthService) { }

  ngOnInit() {
    this.postService.getPosts();
    this.postSub = this.postService.getPostUpdateListener().subscribe((posts: Post[]) => {
      this.isLoading = false;
      this.posts = posts;
    });
    this.isAuthenticated = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();
    this.authStatus = this.authService.getAuthStatus().subscribe((response) => {
      this.isAuthenticated = response;
      this.userId = this.authService.getUserId();
    });
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId);
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authStatus.unsubscribe();
  }

}
