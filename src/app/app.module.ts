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
import { ServerFormComponent } from './server-form/server-form.component';
import { TopologyBuilderComponent } from './topology-builder/topology-builder.component';
import { LoggedGuardGuard } from './guard/logged-guard.guard';
import { PubSubService } from './service/pub-sub.service';
import { RegistryManagementService } from './service/registry-management.service';
import { PolicyBuilderService } from './service/policy-builder.service';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ReplicationStatisticsComponent } from './replication-statistics/replication-statistics.component';
import { ReplicationRuleComponent } from './replication-rule/replication-rule.component';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        RegistryComponent,
        PolicyComponent,
        LoginComponent,
        ShellComponent,
        RegistryServerComponent,
        ServerFormComponent,
        TopologyBuilderComponent,
        ConfirmationModalComponent,
        ReplicationStatisticsComponent,
        ReplicationRuleComponent
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
        AuthGuard,
        LoggedGuardGuard,
        PubSubService,
        RegistryManagementService,
        PolicyBuilderService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
