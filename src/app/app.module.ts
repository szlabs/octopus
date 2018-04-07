import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ClarityModule } from '@clr/angular';
import { AppComponent } from './app.component';
import { ROUTING } from "./app.routing";
import { AboutComponent } from "./about/about.component";
import { RegistryComponent } from './registry/registry.component';
import { PolicyComponent } from './policy/policy.component';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './service/auth.service';
import { RegistryServerComponent } from './registry-server/registry-server.component';


@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        RegistryComponent,
        PolicyComponent,
        LoginComponent,
        ShellComponent,
        RegistryServerComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        ClarityModule,
        ROUTING
    ],
    providers: [
        AuthService,
        AuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
