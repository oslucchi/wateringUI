import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="app-container">
            <app-map-handler></app-map-handler>
        </div>
    `,
    styles: [`
        .app-container {
            min-height: 100vh;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    `]
})
export class AppComponent {
    title = 'Watering System Control';
}
