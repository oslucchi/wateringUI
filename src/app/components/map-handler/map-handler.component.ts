import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  CliCommand,
  CliResponse,
  CommandType,
} from 'src/app/models/command.model';
import { Status } from 'src/app/models/status.model';
import { CliService } from 'src/app/services/cli.service';
import { StatusService } from 'src/app/services/status.service';

interface ZoneStatus {
  zoneId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-map-handler',
  template: `
    <div class="map-container">
      <img src="assets/images/struttura.png" class="base-map" alt="Map base" />

      <ng-container *ngFor="let zone of zones">
        <img
          [src]="getOverlayPath(zone)"
          class="overlay"
          [ngClass]="'zone-' + zone.zoneId"
          alt="Zone {{ zone.zoneId }} overlay"
          (click)="onZoneClick(zone.zoneId)"
          [style.pointerEvents]="isWatering ? 'none' : 'auto'"
          style="cursor: pointer"
        />
      </ng-container>

      <div
        class="moisture-box"
        *ngFor="let value of moisture; let i = index"
        [style.top.px]="moisturePositions[i].top"
        [style.left.px]="moisturePositions[i].left"
      >
        <div style="display: flex; gap: 4px;">
          <div style="width: 50px; font-weight: bold;">HU:</div>
          <div>{{ value.toFixed(2) }}%</div>
        </div>
      </div>

      <div *ngIf="isWatering" class="action-buttons">
        <button (click)="skipAction('zone')">Skip Zone</button>
        <button (click)="skipAction('cycle')">Skip Cycle</button>
      </div>

      <div *ngIf="isWatering" class="side-button">
        <button (click)="suspendAction(isSuspended ? 'resume' : 'suspend')">
          {{ isSuspended ? 'Resume' : 'Suspend' }}
        </button>
      </div>

      <div *ngIf="!isWatering" class="bottom-controls">
        <button (click)="switchToAuto()">Switch to Auto Mode</button>
        <button (click)="openConfiguration()">Configure</button>
      </div>
    </div>
  `,
  styles: [
    `
      .map-container {
        position: relative;
        width: 900px;
        height: auto;
      }
      .base-map {
        width: 100%;
      }
      .overlay {
        position: absolute;
        width: 100%;
        top: 0;
        left: 0;
      }
      .moisture-box {
        position: absolute;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
      }
      .action-buttons {
        position: absolute;
        top: 50%;
        left: 40%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1001;
      }
      .side-button {
        position: absolute;
        top: 50%;
        right: 10px;
        z-index: 1001;
      }
      .bottom-controls {
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1001;
      }
    `,
  ],
})

export class MapHandlerComponent implements OnInit, OnDestroy {
  command: CliCommand | null = null;
  status: Status | null = null;
  zones: ZoneStatus[] = 
        Array.from({ length: Status.MNGD_FLAGS }, (_, i) => ({
                zoneId: i,
                isActive: false,
            })
        );
  moisture: number[] = [0, 0, 0];
  moisturePositions = [
    { top: 260, left: 230 },
    { top: 65, left: 335 },
    { top: 30, left: 610 },
  ];
  watering: boolean[] = [];

  statusSub: Subscription | undefined;
  isWatering = false;
  isSuspended = false;

  constructor(
    private statusService: StatusService,
    private cliService: CliService
  ) {}

  ngOnInit(): void {
    this.statusSub = this.statusService.status$.subscribe((status) => {
      this.status = status;
      this.isWatering = status?.flags?.[0] || false;
      this.isSuspended = status?.flags?.[1] || false;
      for (let i = 0; i < (status?.watering?.length ?? 0); i++) {
        this.zones[i].isActive = status?.watering![i] ?? false;
      }
      this.moisture = status?.moisture || [0, 0, 0];
      this.watering = status?.watering || [];
    });
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }

  getOverlayPath(zone: ZoneStatus): string {
    return `assets/images/zona-${zone.zoneId}-${
      zone.isActive ? 'ACT' : 'INA'
    }.png`;
  }

  onZoneClick(zoneId: number): void {
    let currentlyWatering: number = this.watering.findIndex(
      (flag) => flag === true
    );
    let action: string = 'Attivare';
    if (currentlyWatering >= 0) {
      // a zone is currently set to watering. If it is the same where the click
      // happened, then the request is to stop it
      // otherwise the currently watered zone has to be stopped and the requested one
      // to be started
      if (currentlyWatering == zoneId) {
        action = 'Fermare';
      }
    }
    if (!confirm(`${action} la zona ${zoneId} manualmente?`)) return;

    if (currentlyWatering > 0) {
      this.command = CommandType.getStopAreaCommand(currentlyWatering);
      this.executeCommand(this.command);
    }
    this.command = CommandType.getStartAreaCommand(zoneId);
    this.executeCommand(this.command);
  }
  skipAction(skipWhat: 'zone' | 'cycle') {
    this.command = CommandType.getSkipCommand(skipWhat);
    this.executeCommand(this.command);
  }

  suspendAction(action: 'suspend' | 'resume') {
    this.command = CommandType.getSuspendResumeCommand(action);
    this.executeCommand(this.command);
  }

  executeCommand(command: CliCommand) {
    this.cliService.executeCommand(command).subscribe({
      next: (response: CliResponse) => {
        if (response.status === 'OK') {
        }
      },
      error: (err) => {},
    });
  }
  switchToAuto(): void {}

  openConfiguration(): void {}
}
