import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { StatusComponent } from './components/status/status.component';
import { StartAreaComponent } from './components/start-area/start-area.component';
import { SwitchModeComponent } from './components/switch-mode/switch-mode.component';
import { ManualStartComponent } from './components/manual-start/manual-start.component';
import { ConfigureComponent } from './components/configure/configure.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    StatusComponent,
    StartAreaComponent,
    SwitchModeComponent,
    ManualStartComponent,
    ConfigureComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/status', pathMatch: 'full' },
      { path: 'status', component: StatusComponent },
      { path: 'start', component: StartAreaComponent },
      { path: 'switch', component: SwitchModeComponent },
      { path: 'manual', component: ManualStartComponent },
      { path: 'configure', component: ConfigureComponent }
    ]),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
