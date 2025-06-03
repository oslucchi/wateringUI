import { Component } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType } from '../../models/command.model';

@Component({
    selector: 'app-manual-start',
    template: `
        <div class="command-container">
            <h2>Manual Start Control</h2>
            <div class="command-content">
                <div class="area-selector">
                    <label for="areaSelect">Select Area:</label>
                    <select id="areaSelect" [(ngModel)]="selectedArea" [disabled]="loading">
                        <option value="">Choose an area...</option>
                        <option *ngFor="let area of areas" [value]="area">{{ area }}</option>
                    </select>
                </div>

                <button 
                    (click)="startManualWatering()" 
                    [disabled]="loading || !selectedArea"
                    class="start-button">
                    {{ loading ? 'Starting...' : 'Start Manual Watering' }}
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
        }
        .area-selector {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
        }
        select {
            width: 100%;
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
            margin-bottom: 1rem;
        }
        .start-button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
        }
        .start-button:disabled {
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
export class ManualStartComponent extends BaseCommandComponent {
    areas: number[] = Array.from({ length: 8 }, (_, i) => i);
    selectedArea: number | null = null;

    constructor(cliService: CliService) {
        super(cliService);
    }

    startManualWatering() {
        if (this.selectedArea === null) return;
        
        const command = CommandType.getStartManCommand(this.selectedArea);
        this.executeCommand({ cmd: command });
    }
} 