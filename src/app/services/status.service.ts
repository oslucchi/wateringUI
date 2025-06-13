import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { Status } from '../models/status.model'; // your TS class
import { CliService } from './cli.service';
import { CliCommand, CliResponse, CommandType } from '../models/command.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StatusService implements OnDestroy {
  private statusSubject = new BehaviorSubject<Status | null>(null);
  private refreshInterval: Subscription | null = null;
  private lastStatusJson: string | null = null;

  get status$(): Observable<Status | null> {
    return this.statusSubject.asObservable();
  }

  setStatus(status: Status) {
    this.statusSubject.next(status);
  }

  getCurrentStatus(): Status | null {
    return this.statusSubject.value;
  }

  constructor(private cliService: CliService) {
    this.startAutoRefresh();
  }

  private startAutoRefresh(refreshMs: number = environment.refreshInterval): void {
    console.log("Refresh interval is " + refreshMs);
    if (refreshMs == 0)
      return;
    this.refreshInterval = interval(refreshMs).subscribe(() => {
      this.fetchStatus();
    });

    // Initial fetch
    this.fetchStatus();
  }

  private fetchStatus(): void {
    const command: CliCommand = {
      command: CommandType.STATUS
    };

    this.cliService.executeCommand(command).subscribe({
      next: (response: CliResponse) => {
        const rawJson = response.data;

        if (rawJson !== this.lastStatusJson) {
          this.lastStatusJson = rawJson;

          try {
            const parsed = JSON.parse(rawJson);
            const statusObj = new Status(parsed, parsed.zones);
            this.statusSubject.next(statusObj);
          } catch (err) {
            console.error('Invalid status JSON from server:', err);
          }
        }
      },
      error: (err) => {
        console.error('Status fetch failed:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshInterval?.unsubscribe();
    this.refreshInterval = null;
  }
}
