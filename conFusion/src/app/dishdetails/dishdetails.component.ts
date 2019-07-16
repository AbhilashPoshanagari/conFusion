import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from "../shared/comment";
import { DISHES } from "../shared/dishes";
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.3)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailsComponent implements OnInit {
  dish: Dish;
  dishcopy: Dish;
  comments: Comment;
  errMess: string;
  dishIds: string[];
 prev: string;
 next: string;
 visibility = 'shown';
 commentSection: FormGroup;
 formErrors = {
 'author': '',
 'rating': '',
 'comment': ''
 };

 validationMessages = {
   'author': {
     'required': 'Author Name is required.',
     'minlength': 'Author Name must be at least 2 characters long.',
     'maxlength': 'Author tName cannot be more than 25 characters long.'
   },
   'rating': {
     'required': 'rating is required.'
   },
   'comment': {
     'required': 'Comment is required.',
     'minlength': 'Comment must be at least 5 characters long.',
     'maxlength': 'Comment cannot be more than 50 characters long.'
   }
 };

  @ViewChild('cform') commentSectionDirective;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
     private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
     this.createForm();
    }

  ngOnInit() {
    this.createForm();
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds, errMess => this.errMess = <any>errMess);
    this.route.params.pipe(switchMap((params: Params) =>  { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish;
      this.setPrevNext(dish.id); this.visibility = 'shown';
    },
    errmess => this.errMess = <any>errmess);
  }
  createForm() {
    this.commentSection = this.fb.group({
      author: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: ['5',[Validators.required, Validators.pattern]],
      comment: ['',[Validators.required, Validators.minLength(5), Validators.maxLength(25)]]
    });
    this.commentSection.valueChanges
    .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onSubmit() {
    this.comments = this.commentSection.value;
    this.comments.date = new Date().toISOString();
    this.dishcopy.comments.push(this.comments);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errMess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errMess; });
    console.log(this.comments);
    this.commentSection.reset({
      author: '',
      rating: '',
      comment: ''
    });
    this.commentSectionDirective.resetForm();

  }

  onValueChanged(data?: any) {
      if (!this.commentSection) { return; }
      const form = this.commentSection;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void{
    this.location.back();
  }

}
