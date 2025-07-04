import { Component, OnInit } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType, CliResponse } from '../../models/command.model';
import { StatusService } from 'src/app/services/status.service';
import { Status } from 'src/app/models/status.model';

@Component({
    selector: 'app-manual-start',
    template: `
        <div class="command-container">
            <h2>Manual Cycle Control</h2>
            <div class="command-content">
                <button 
                    (click)="toggleManualCycle()" 
                    [disabled]="loading"
                    [class.active]="isForceFlagSet"
                    class="cycle-button">
                    {{ loading ? 'Processing...' : 
                        (isForceFlagSet ? 'Stop Manual Cycle' : 'Start Manual Cycle') }}
                </button>

                <div *ngIf="loading" class="status">
                    Processing command...
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
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .cycle-button {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            min-width: 250px;
            transition: background-color 0.3s;
        }
        .cycle-button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .cycle-button.active {
            background-color: #dc3545;
        }
        .status {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #e9ecef;
            border-radius: 4px;
            width: 100%;
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
export class ManualStartComponent extends BaseCommandComponent implements OnInit {
    constructor(cliService: CliService, 
                private statusService: StatusService) {
        super(cliService);
    }

    ngOnInit() {
        ;
    }
    
    get isForceFlagSet(): boolean {
        const status = this.statusService.getCurrentStatus();
        return (status ? status?.flags[Status.FLG_FORCE] : false);
    }

    toggleManualCycle() {
        const command = !this.isForceFlagSet
            ? CommandType.getStartManCommand(0)
            : CommandType.getStopManCommand();
        console.log("Command ", JSON.stringify(command));

        this.loading = true;
        this.cliService.executeCommand(command).subscribe({
            next: (response: CliResponse) => {
                if (response.status === 'OK') {
                    this.response = response;
                    this.loading = false;
                }
            },
            error: (err) => {
                this.error = err;
                this.loading = false;
            }
        });
    }

    protected override handleResponse(response: CliResponse): void {
        super.handleResponse(response);
        if (response.status === 'OK') {
        }
    }
} 