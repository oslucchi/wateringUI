import { Component, OnInit } from '@angular/core';

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
        // Optional: if you need to position individual overlays differently,
        // you can define per-zone styles here
        // .zone-1 {
        // Example custom styles for zone 1 if needed
        // }

        // .zone-2 {
        // etc.
        // }

        export class MapHandlerComponent implements OnInit {

  zones: ZoneStatus[] = [];

  ngOnInit(): void {
    // Replace with actual call to status service
    this.zones = [
      { zoneId: 0, isActive: false },
      { zoneId: 1, isActive: false },
      { zoneId: 2, isActive: false },
      { zoneId: 3, isActive: false },
      { zoneId: 4, isActive: false },
      { zoneId: 5, isActive: false },
      { zoneId: 6, isActive: false },
      { zoneId: 7, isActive: false },
      // Add more zones as needed
    ];
  }

  getOverlayPath(zone: ZoneStatus): string {
    const status = zone.isActive ? 'ACT' : 'INA';
    return `assets/images/zona-${zone.zoneId}-${status}.png`;
  }
}
