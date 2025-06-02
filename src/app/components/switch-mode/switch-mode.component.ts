import { Component } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType } from '../../models/command.model';

@Component({
    selector: 'app-switch-mode',
    template: `
        <div class="command-container">
            <h2>Operation Mode Control</h2>
            <div class="command-content">
                <div class="mode-buttons">
                    <button (click)="setMode('auto')" [disabled]="loading" [class.active]="currentMode === 'auto'">
                        Automatic Mode
                    </button>
                    <button (click)="setMode('manual')" [disabled]="loading" [class.active]="currentMode === 'manual'">
                        Manual Mode
                    </button>
                </div>

                <div *ngIf="loading" class="status">
                    Switching mode...
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
        .mode-buttons {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            flex: 1;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        button.active {
            background-color: #28a745;
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
export class SwitchModeComponent extends BaseCommandComponent {
    currentMode: 'auto' | 'manual' | null = null;

    constructor(cliService: CliService) {
        super(cliService);
    }

    setMode(mode: 'auto' | 'manual') {
        const command = mode === 'auto' ? CommandType.MODE_AUTO : CommandType.MODE_MANUAL;
        this.executeCommand({ cmd: command });
        this.currentMode = mode;
    }
} 