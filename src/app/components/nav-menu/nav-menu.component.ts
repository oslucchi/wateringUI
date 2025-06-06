import { Component } from '@angular/core';
import { CommandType } from '../../models/command.model';

@Component({
    selector: 'app-nav-menu',
    template: `
        <nav class="nav-menu">
            <ul>
                <li *ngFor="let item of menuItems">
                    <a [routerLink]="[item.route]" routerLinkActive="active">
                        {{ item.label }}
                    </a>
                </li>
            </ul>
        </nav>
    `,
    styles: [`
        .nav-menu {
            padding: 1rem;
            background-color: #f8f9fa;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            gap: 1rem;
        }
        a {
            text-decoration: none;
            color: #333;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        a:hover, a.active {
            background-color: #e9ecef;
        }
    `]
})
export class NavMenuComponent {
    menuItems = [
        { label: 'Manual/Auto Mode', route: '/switch-mode', command: CommandType.MODE },
        { label: 'Start Area', route: '/start-area', command: CommandType.START },
        { label: 'Manual Start', route: '/manual-start', command: CommandType.STARTMAN },
        { label: 'Configure', route: '/configure', command: CommandType.CONFIGSHOW }
    ];
} 