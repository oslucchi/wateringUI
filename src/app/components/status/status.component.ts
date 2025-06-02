import { Component } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType } from '../../models/command.model';

@Component({
    selector: 'app-status',
    template: `
        <div class="command-container">
            <h2>System Status</h2>
            <div class="command-content">
                <button (click)="getStatus()" [disabled]="loading">
                    {{ loading ? 'Fetching Status...' : 'Get Status' }}
                </button>

                <div *ngIf="loading" class="status">
                    Connecting to watering server...
                </div>

                <div *ngIf="response" class="status" [class.error]="response.status === 'NOK'">
                    <h3>Server Response:</h3>
                    <pre>{{ response.data }}</pre>
                </div>

                <div *ngIf="error" class="status error">
                    <h3>Error:</h3>
                    <pre>{{ error }}</pre>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .command-container {
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
        }
        .command-content {
            margin-top: 1rem;
        }
        button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .status {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #e9ecef;
            border-radius: 4px;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin: 0.5rem 0;
        }
        h3 {
            margin: 0 0 0.5rem 0;
            color: #495057;
        }
    `]
})
export class StatusComponent extends BaseCommandComponent {
    constructor(cliService: CliService) {
        super(cliService);
    }

    getStatus() {
        this.executeCommand({ cmd: CommandType.STATUS });
    }
} 