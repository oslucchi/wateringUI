import { Component, OnInit } from '@angular/core';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType } from '../../models/command.model';
import { Area, TOTAL_AREAS } from '../../models/area.model';
import { CliResponse, CliCommand } from '../../models/command.model';

@Component({
    selector: 'app-start-area',
    template: `
        <div class="command-container">
            <h2>Area Control</h2>
            <div class="command-content">
                <!-- Future image map will go here -->
                <!-- <div class="area-map">
                    <img src="assets/terrace-map.jpg" alt="Terrace Areas Map" usemap="#area-map">
                    <map name="area-map">
                    </map>
                </div> -->

                <div class="areas-grid">
                    <div *ngFor="let area of areas" class="area-button-container">
                        <button 
                            [class.watering]="area.isWatering"
                            [disabled]="loading || (isAnyAreaWatering && !area.isWatering)"
                            (click)="toggleArea(area)">
                            {{ area.name }}
                            <span class="status">{{ area.isWatering ? '(Watering)' : '' }}</span>
                        </button>
                    </div>
                </div>

                <div *ngIf="loading" class="status">
                    Processing command...
                </div>

                <div *ngIf="selectedArea && !loading" class="confirmation-dialog">
                    <p>Are you sure you want to {{ selectedArea.isWatering ? 'stop' : 'start' }} 
                       watering in Area {{ selectedArea.id }}?</p>
                    <div class="confirmation-buttons">
                        <button (click)="confirmAreaAction()" class="confirm">Yes</button>
                        <button (click)="cancelAreaAction()" class="cancel">No</button>
                    </div>
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
        .areas-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .area-button-container {
            text-align: center;
        }
        button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            position: relative;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        button.watering {
            background-color: #dc3545;
        }
        .status {
            display: block;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        }
        .confirmation-dialog {
            margin: 1rem 0;
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 4px;
            text-align: center;
        }
        .confirmation-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
        .confirmation-buttons button {
            width: auto;
            min-width: 100px;
        }
        .confirmation-buttons .confirm {
            background-color: #28a745;
        }
        .confirmation-buttons .cancel {
            background-color: #dc3545;
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
export class StartAreaComponent extends BaseCommandComponent implements OnInit {
    areas: Area[] = [];
    selectedArea: Area | null = null;
    
    get isAnyAreaWatering(): boolean {
        return this.areas.some(area => area.isWatering);
    }

    constructor(cliService: CliService) {
        super(cliService);
    }

    ngOnInit() {
        // Initialize areas
        this.areas = Array.from({ length: TOTAL_AREAS }, (_, i) => ({
            id: i,
            isWatering: false,
            name: `Area ${i}`
        }));
    }

    toggleArea(area: Area) {
        this.selectedArea = area;
    }

    cancelAreaAction() {
        this.selectedArea = null;
    }

    confirmAreaAction() {
        if (!this.selectedArea) return;

        const command = this.selectedArea.isWatering
            ? CommandType.getStopAreaCommand(this.selectedArea.id)
            : CommandType.getStartAreaCommand(this.selectedArea.id);

        const targetArea = this.selectedArea;
        const isStarting = !targetArea.isWatering;

        this.loading = true;
        this.cliService.executeCommand(command).subscribe({
            next: (response: CliResponse) => {
                if (response.status === 'OK') {
                    // If this was a start command, first reset all areas
                    if (isStarting) {
                        this.areas.forEach(area => area.isWatering = false);
                    }
                    // Then update the target area's state
                    targetArea.isWatering = isStarting;
                }
                this.response = response;
                this.loading = false;
                this.selectedArea = null;
            },
            error: (err) => {
                this.error = err;
                this.loading = false;
                this.selectedArea = null;
            }
        });
    }
} 