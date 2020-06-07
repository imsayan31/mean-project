import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { stringify } from 'querystring';

@Injectable({ providedIn: 'root'})
export class PostService {

  constructor(private httpClient: HttpClient, private route: Router) {

  }
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();

  getPosts() {
    this.httpClient
    .get<{ message: string, posts: any}>(
      'http://localhost:3000/api/posts'
      )
    .pipe(map((postData) => {
      return postData.posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath,
          creator: post.creator
        };
      });
    }))
    .subscribe((transformedPostData) => {
      this.posts = transformedPostData;
      this.postUpdated.next([...this.posts]);
    });
  }

  getPostUpdateListener() {
    return this.postUpdated.asObservable();
  }

  getPost(id: string) {
    /* return {...this.posts.find(p => p.id === id)}; */
    return this.httpClient.get<{message: string, postData: Post}>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    /* const post: Post = {id: null, title: title, content: content}; */
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.httpClient.post<{ message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      console.log(responseData);
      /* const id = responseData.postId;
      post.id = id; */
      const post = {
        id: responseData.post.id,
        title: title,
        content: content,
        imagePath: responseData.post.imagePath,
        creator: responseData.post.creator,
      };
      this.posts.push(post);
      this.postUpdated.next(this.posts);
      this.route.navigate(['/']);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    /* const post: Post = { id: id, title: title, content: content, imagePath: null}; */
    this.httpClient.put<{ message: string, post: Post }>('http://localhost:3000/api/posts/' + id, postData)
    .subscribe((responsedata) => {
      const post: Post = {
        id: responsedata.post.id,
        title: responsedata.post.title,
        content: responsedata.post.content,
        imagePath: responsedata.post.imagePath,
        creator: responsedata.post.creator
      };
      const oldIndexId = this.posts.findIndex(p => p.id === id);

      /* this.posts[oldIndexId].title = post.title;
      this.posts[oldIndexId].content = post.content;
      this.postUpdated.next([...this.posts]); */
      this.route.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    this.httpClient
    .delete('http://localhost:3000/api/posts/' + postId)
    .subscribe(() => {
      const updtaedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updtaedPosts;
      this.postUpdated.next([...this.posts]);
    });
  }

}
