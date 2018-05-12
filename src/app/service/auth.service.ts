import { Injectable } from '@angular/core';
import { AppUser } from '../interface/app-user';
import { Credentials } from '../interface/credential';
import { Http } from '@angular/http';
import { HTTP_JSON_OPTIONS } from './options';
import { applySourceSpanToExpressionIfNeeded } from '@angular/compiler/src/output/output_ast';

const LOGIN_PATH: string = "/api/v1/login";
const LOGOUT_PATH: string = "/api/v1/logout";

@Injectable()
export class AuthService {
	ticker: any = null;

	constructor(private http: Http) { }

	logIn(cred: Credentials): Promise<any> {
		if (cred == null) {
			return Promise.reject("null login credentials")
		}

		let body: any = {
			username: cred.userName,
			password: cred.password
		};

		return this.http.post(LOGIN_PATH, JSON.stringify(body), HTTP_JSON_OPTIONS).toPromise()
			.then(response => {
				let currentUser: AppUser = {
					userID: cred.userName,
					userName: cred.userName,
					email: cred.userName + '@local.com',
					relaName: cred.userName
				};

				sessionStorage.setItem("session", btoa(JSON.stringify(currentUser)));

				if (this.ticker != null) {
					clearTimeout(this.ticker);
				}

				this.ticker = setTimeout(() => {
					sessionStorage.removeItem("session");
					console.log("session timeout")
				}, 3600000);
			})
			.catch(error => Promise.reject(error));
	}

	logOut(): Promise<any> {
		return this.http.post(LOGOUT_PATH, null, HTTP_JSON_OPTIONS).toPromise()
			.then(() => {
				sessionStorage.removeItem("session");
			})
			.catch(error => Promise.reject(error));
	}

	getCurrentUser(): AppUser {
		let data: string = sessionStorage.getItem("session");
		if (data && data !== "") {
			let currentUser:AppUser = JSON.parse(atob(data));
			return currentUser;
		}
		return null;
	}

}
