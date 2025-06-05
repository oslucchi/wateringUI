import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType, CliCommand, CliResponse } from '../../models/command.model';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-status',
    template: `
        <div class="status-container">
            <h2>System Status</h2>
            <div class="status-content">
                <div *ngIf="loading" class="loading">
                    Loading status...
                </div>
                <div *ngIf="response" class="status-display">
                    <pre>{{ response.data }}</pre>
                </div>
                <div *ngIf="error" class="error">
                    {{ error }}
                </div>
            </div>
        </div>
    `,
    styles: [`
        .status-container {
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
        }
        .status-content {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .loading {
            color: #6c757d;
            font-style: italic;
        }
        .error {
            color: #dc3545;
            padding: 0.5rem;
            background-color: #f8d7da;
            border-radius: 4px;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    `]
})
export class StatusComponent extends BaseCommandComponent implements OnInit, OnDestroy {
    private refreshInterval: Subscription | null = null;
    private lastStatusJson: string | null = null;

    constructor(protected override cliService: CliService) {
        super(cliService);
    }

    ngOnInit() {
        this.refreshStatus();
        this.startStatusRefresh();
    }

    override ngOnDestroy() {
        this.stopStatusRefresh();
    }

    private handleStatusChange(response: CliResponse) {
        this.response = response;
        console.log(`handleStatusChange: triggered on response ${JSON.stringify(response)}`);
    }

    private refreshStatus() {
        const command: CliCommand = {
            command: CommandType.STATUS
        };
        // this.executeCommand(command);
        this.executeCommand(command).subscribe((response) => {
        const responseJson = JSON.stringify(response);
        if (responseJson !== this.lastStatusJson) {
            this.lastStatusJson = responseJson;
            this.handleStatusChange(response);
        } 
        else {
            // No change — skip update
        }
    });
    }

    private startStatusRefresh() {
        this.refreshInterval = interval(5000).subscribe(() => {
            this.refreshStatus();
        });
    }

    private stopStatusRefresh() {
        if (this.refreshInterval) {
            this.refreshInterval.unsubscribe();
            this.refreshInterval = null;
        }
    }
} 