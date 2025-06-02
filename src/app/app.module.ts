import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { StatusComponent } from './components/status/status.component';
import { StartAreaComponent } from './components/start-area/start-area.component';
import { SwitchModeComponent } from './components/switch-mode/switch-mode.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    StatusComponent,
    StartAreaComponent,
    SwitchModeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
