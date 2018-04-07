import { Injectable } from '@angular/core';
import { AppUser } from '../interface/app-user'
import { Credentials } from '../interface/credential'

@Injectable()
export class AuthService {
  
  currentUser: AppUser = null;

  constructor() { }

  logIn(cred :Credentials): Promise<any>{
  	if (cred == null) {
  		return Promise.reject("null login credentials")
  	}

  	if (cred.userName == "admin" && cred.password=="admin"){
  		//keep it
  		let u: AppUser = {
  			userID: "uid_100000",
  			userName: cred.userName,
  			email: "admin@harbor.local",
  			relaName: "Administrator"
  		}
  		this.currentUser = u;

  		return Promise.resolve(true);
  	}

  	return Promise.reject("invalid username or password")
  }

  logOut(): Promise<any>{
  	this.currentUser = null;
  	return Promise.resolve(true);
  }

  getCurrentUser(): AppUser{
  	return this.currentUser;
  }

}
