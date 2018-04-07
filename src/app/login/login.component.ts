import { Component, OnInit, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Credentials } from '../interface/credential';
import { ROUTES } from '../consts';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewChecked {
  
  error: any = null;

  signInForm: NgForm;
  @ViewChild("signInForm") currentForm: NgForm;
  
  @Input() credentials: Credentials = {
  	userName: "",
  	password: ""
  };

  public get isValid(): boolean{
  	return this.credentials.userName !="" && 
  	this.credentials.password !="" &&
  	!this.isError;
  }

  public get isError(): boolean {
  	return this.error != null
  }

  constructor(
  	private authService: AuthService,
  	private router: Router
  	) { }

  ngOnInit() {
  }

  ngAfterViewChecked(){
  	if (this.isError){
  		this.formChanged();
  	}
  }

  formChanged(){
  	if (this.signInForm === this.currentForm){
  		return;
  	}

  	this.signInForm = this.currentForm;
  	if (this.signInForm){
  		this.signInForm.valueChanges.subscribe(data =>{
  			if (this.isError){
  				this.error = null;//reset
  			}
  		});
  	}
  }

  signIn(): void{
  	if (!this.isValid){
  		return;//do nothing
  	}

  	this.authService.logIn(this.credentials)
  	.then(()=>{
  		this.router.navigateByUrl(ROUTES.HOME)
  	})
  	.catch(error => {
  		this.error = error;
  		console.error(error);
  	});
  }

}
