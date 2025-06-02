import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="app-container">
            <header>
                <h1>Watering System Control</h1>
                <app-nav-menu></app-nav-menu>
            </header>
            <main>
                <router-outlet></router-outlet>
            </main>
        </div>
    `,
    styles: [`
        .app-container {
            min-height: 100vh;
            background-color: #ffffff;
        }
        header {
            background-color: #f8f9fa;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            margin: 0 0 1rem 0;
            text-align: center;
            color: #333;
        }
        main {
            padding: 2rem;
        }
    `]
})
export class AppComponent {
    title = 'Watering System Control';
}
