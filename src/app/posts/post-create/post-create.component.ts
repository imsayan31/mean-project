import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';

import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;

  constructor(public postService: PostService, private route: ActivatedRoute, private authService: AuthService) {}

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    /* const post: Post = {
      title: form.value.title,
      content: form.value.content
    };
    this.postCreated.emit(post); */

    /* this.isLoading = true; */
    if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required]
      }),
      content: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required], asyncValidators: mimeType
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {

          this.post = {
            id: postData.postData.id,
            title: postData.postData.title,
            content: postData.postData.content,
            imagePath: postData.postData.imagePath,
            creator: postData.postData.creator
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: (this.post.imagePath) ? this.post.imagePath : null
          });
          this.isLoading = false;
          this.imagePreview = this.post.imagePath;
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
}
