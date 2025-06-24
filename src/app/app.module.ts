import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartAreaComponent } from './components/start-area/start-area.component';
import { SwitchModeComponent } from './components/switch-mode/switch-mode.component';
import { ManualStartComponent } from './components/manual-start/manual-start.component';
import { ConfigureComponent } from './components/configure/configure.component';
import { MapHandlerComponent } from './components/map-handler/map-handler.component'

@NgModule({
  declarations: [
    AppComponent,
    StartAreaComponent,
    SwitchModeComponent,
    ManualStartComponent,
    ConfigureComponent,
    MapHandlerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/mapHandler', pathMatch: 'full' },
      { path: 'start', component: StartAreaComponent },
      { path: 'switch', component: SwitchModeComponent },
      { path: 'manual', component: ManualStartComponent },
      { path: 'configure', component: ConfigureComponent },
      { path: 'mapHandler', component: MapHandlerComponent }
    ]),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
