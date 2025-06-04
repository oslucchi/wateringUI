import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatusComponent } from './components/status/status.component';
import { StartAreaComponent } from './components/start-area/start-area.component';
import { SwitchModeComponent } from './components/switch-mode/switch-mode.component';
import { ManualStartComponent } from './components/manual-start/manual-start.component';
import { ConfigureComponent } from './components/configure/configure.component';

const routes: Routes = [
    { path: '', redirectTo: '/status', pathMatch: 'full' },
    { path: 'status', component: StatusComponent },
    { path: 'start-area', component: StartAreaComponent },
    { path: 'switch-mode', component: SwitchModeComponent },
    { path: 'manual-start', component: ManualStartComponent },
    { path: 'configure', component: ConfigureComponent },
    // Other routes will be added as we create their components
    { path: '**', redirectTo: '/status' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
