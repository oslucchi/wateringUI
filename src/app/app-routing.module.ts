import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartAreaComponent } from './components/start-area/start-area.component';
import { SwitchModeComponent } from './components/switch-mode/switch-mode.component';
import { ManualStartComponent } from './components/manual-start/manual-start.component';
import { ConfigureComponent } from './components/configure/configure.component';
import { MapHandlerComponent } from './components/map-handler/map-handler.component';

const routes: Routes = [
    { path: '', redirectTo: '/terraceMap', pathMatch: 'full' },
    { path: 'terraceMap', component: MapHandlerComponent },
    { path: 'start-area', component: StartAreaComponent },
    { path: 'switch-mode', component: SwitchModeComponent },
    { path: 'manual-start', component: ManualStartComponent },
    { path: 'configure', component: ConfigureComponent },
    // Other routes will be added as we create their components
    { path: '**', redirectTo: '/terraceMap' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
