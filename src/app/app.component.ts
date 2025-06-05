import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="app-container">
            <header>
                <h1>Watering System Control</h1>
                <app-nav-menu></app-nav-menu>
            </header>
            <main class="main-layout">
                    <app-map-handler class="left-panel"></app-map-handler>
                    <router-outlet class="right-panel"></router-outlet>
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

        .main-layout {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            align-items: flex-start;
        }

        .left-panel {
             /* flex: 1 1 auto; Grow as much as possible */
            width: 800px; 
            flex: 0 0 auto; /* Do NOT grow; use only its natural width */
            min-width: 0;

            display: flex;
            justify-content: center; /* Center content horizontally */
            align-items: center;     /* Center content vertically (optional) */
        }

        .right-panel {
            flex: 0 0 auto; /* Do NOT grow; use only its natural width */
            min-width: 300px; /* Optional: constrain minimum width */

            display: flex;
            justify-content: center;
            align-items: center;
        }

    `]
})
export class AppComponent {
    title = 'Watering System Control';
}
