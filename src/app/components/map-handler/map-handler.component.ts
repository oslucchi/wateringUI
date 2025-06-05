import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Status } from 'src/app/models/status.model';
import { StatusService } from 'src/app/services/status.service';

interface ZoneStatus {
  zoneId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-map-handler',
  template: `
    <div class="map-container">
        <img src="assets/images/struttura.png" class="base-map" alt="Map base">

        <ng-container *ngFor="let zone of zones">
            <img
                [src]="getOverlayPath(zone)"
                class="overlay"
                [ngClass]="'zone-' + zone.zoneId"
                alt="Zone {{ zone.zoneId }} overlay"
            />
        </ng-container>
    </div>
    `,
    styles: [`
        .map-container {
            position: relative;
            width: 100%;
            max-width: 1076px; 
        }

        .base-map {
            width: 100%;
            height: auto;
            display: block;
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            pointer-events: none;
        }

    `]
})

export class MapHandlerComponent implements OnInit, OnDestroy {
    status: Status | null = null;
    zones: ZoneStatus[] = 
        Array.from({ length: Status.MNGD_FLAGS }, (_, i) => ({
            zoneId: i,
            isActive: false,
        })
    );
    private sub: Subscription | null = null;

    constructor(private statusService: StatusService) {}


    ngOnDestroy() {
        this.sub?.unsubscribe();
    }

    ngOnInit(): void {
        this.sub = this.statusService.status$.subscribe((status) => {
            this.status = status;
            for (let i = 0; i < (status?.watering?.length ?? 0); i++)
            {
                this.zones[i].isActive = status?.watering![i] ?? false;
            }
        });
    }

    getOverlayPath(zone: ZoneStatus): string {
        const status = zone.isActive ? 'ACT' : 'INA';
        return `assets/images/zona-${zone.zoneId}-${status}.png`;
    }
}
