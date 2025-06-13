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
        <div
            style="
                position: absolute;
                top: 260px;
                left: 230px;
                background: rgba(0, 0, 0, 0.6);
                color: #3de561;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
            "
        >
            <div style="display: flex; gap: 4px;">
                <div style="width: 50px; font-weight: bold;">HU:</div>
                <div>{{ moisture[0].toFixed(2) }}%</div>
            </div>
        </div>
        <div
            style="
                position: absolute;
                top: 65px;
                left: 335px;
                background: rgba(0, 0, 0, 0.6);
                color: #e5923d;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
            "
        >
            <div style="display: flex; gap: 4px;">
                <div style="width: 50px; font-weight: bold;">HU:</div>
                <div>{{ moisture[1].toFixed(2) }}%</div>
            </div>
        </div>
        <div
            style="
                position: absolute;
                top: 30px;
                left: 610px;
                background: rgba(0, 0, 0, 0.6);
                color: #3db7e5;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
            "
        >
            <div style="display: flex; gap: 4px;">
                <div style="width: 50px; font-weight: bold;">HU:</div>
                <div>{{ moisture[2].toFixed(2) }}%</div>
            </div>
        </div>
        <div
            *ngIf="isAnyWateringActive()"
            style="
                position: absolute;
                top: 180px;
                left: 330px;
                background: rgba(0, 0, 0, 0.6);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
            "
        >
            <div style="display: flex; gap: 4px;">
                <div style="width: 80px; font-weight: bold;">Zone:</div>
                <div>{{ wateringArea + 1 }}</div>
            </div>

            <div style="display: flex; gap: 4px;">
                <div style="width: 80px; font-weight: bold;">Current:</div>
                <div>{{ curWateringTime }}</div>
            </div>

            <div style="display: flex; gap: 4px;">
                <div style="width: 80px; font-weight: bold;">Expected:</div>
                <div>{{ expWateringTime }}</div>
            </div>
        </div>
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
    wateringArea: number = -1;
    curWateringTime: string = "";
    expWateringTime: string = "";
    moisture:number[] = [];

    constructor(private statusService: StatusService) {
        this.status = this.statusService.getCurrentStatus();
    }


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
            this.moisture = (this.status ? this.status.moisture : [0,0,0]);
            for(let i = 0; i < this.moisture.length; i++)
            {
                if (this.moisture[i] > 100)
                {
                    this.moisture[i] = 0;
                }
            }
        });
    }

    getOverlayPath(zone: ZoneStatus): string {
        const status = zone.isActive ? 'ACT' : 'INA';
        return `assets/images/zona-${zone.zoneId}-${status}.png`;
    }

    isAnyWateringActive(): boolean {
        this.wateringArea = -1;
        this.curWateringTime = "00:00";
        this.expWateringTime = "00:00";
        let retVal = false;
        let curWT = 0;
        let expWT = 0;

        if (this.status && this.status.watering)
        {
            this.wateringArea = this.status.watering.findIndex(w => w === true);

            if(this.wateringArea >= 0)
            {
                retVal = true;
                curWT = this.status.curWateringTime[this.wateringArea];
                expWT = this.status.expWateringTime[this.wateringArea];
                this.curWateringTime = `${(Math.floor(curWT / 60)).toString().padStart(2, '0')}:${(Math.floor(curWT % 60)).toString().padStart(2, '0')}`;
                this.expWateringTime = `${(Math.floor(expWT / 60)).toString().padStart(2, '0')}:${(Math.floor(expWT % 60)).toString().padStart(2, '0')}`;
            } 
        }
        return retVal;
    }
}
