import { Component, OnInit, ViewChild } from '@angular/core';
import { AboutComponent } from '../about/about.component';
import { ROUTES } from '../consts';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  @ViewChild(AboutComponent) aboutDlg: AboutComponent;

  constructor(
  	private authService: AuthService,
  	private router: Router
  	) { }

  ngOnInit() {
  }

  about(){
  	this.aboutDlg.open();
  }

  logOut(){
  	this.authService.logOut()
  	.then(()=>{
  		this.router.navigateByUrl(ROUTES.LOGIN);
  	})
  	.catch(error=>console.error(error));
  }

}
