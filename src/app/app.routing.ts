/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { RegistryComponent } from './registry/registry.component'
import { PolicyComponent } from './policy/policy.component'
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';



export const ROUTES: Routes = [
    {path: '', redirectTo: 'harbor', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {
    	path: 'harbor', 
    	component: ShellComponent,
    	children:[
    	  {path: '', redirectTo: 'registries', pathMatch: 'full'},
    	  {path: 'registries', component: RegistryComponent},
          {path: 'policies', component: PolicyComponent},
          {path: 'about', component: AboutComponent}
    	]
    }
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);
