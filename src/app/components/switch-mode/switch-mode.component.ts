import { Component, OnInit } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CliResponse, CommandType } from '../../models/command.model';
import { StatusService } from 'src/app/services/status.service';
import { Status } from 'src/app/models/status.model';

@Component({
    selector: 'app-switch-mode',
    template: `
        <div class="command-container">
            <h2>Operation Mode Control</h2>
            <div class="command-content">
                <div class="mode-buttons">
                    <button 
                        (click)="setMode('auto')" 
                        [disabled]="isAutoMode" 
                        [class.active]="(isManualMode ? 'auto' : '')"
                    >
                        Automatic Mode
                    </button>
                    <button 
                        (click)="setMode('manual')" 
                        [disabled]="isManualMode" 
                        [class.active]="(isAutoMode ? 'manual' : '')"
                    >
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
export class SwitchModeComponent extends BaseCommandComponent implements OnInit{
    currentMode: 'auto' | 'manual' | null = null;
    status: StatusService | null = null;
    constructor(cliService: CliService,
                statusService: StatusService) {
        super(cliService);
        this.status = statusService
    }

    ngOnInit(): void {
        this.currentMode = (this.status?.getCurrentStatus()?.flags[Status.FLG_MODE] ? "manual" : "auto");
    }
    
    get isAutoMode(): boolean {
        const currentStatus = this.status?.getCurrentStatus?.();
        const flags = currentStatus?.flags;

        if (flags != null) {
            return !flags[Status.FLG_MODE];
        } else {
            return false;
        }
    }

    get isManualMode(): boolean {
        const currentStatus = this.status?.getCurrentStatus?.();
        const flags = currentStatus?.flags;

        if (flags != null) {
            return flags[Status.FLG_MODE];
        } else {
            return false;
        }
    }

    setMode(mode: 'auto' | 'manual') {
        const command = CommandType.getModeCommand(mode);

        this.loading = true;
        this.cliService.executeCommand(command).subscribe({
            next: (response: CliResponse) => {
                if (response.status === 'OK') {
                }
                this.response = response;
                this.loading = false;
            },
            error: (err) => {
                this.error = err;
                this.loading = false;
            }
        });
    }
} 