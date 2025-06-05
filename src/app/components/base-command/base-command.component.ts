import { Component, OnDestroy } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { CliService } from '../../services/cli.service';
import { CliCommand, CliResponse } from '../../models/command.model';

@Component({
    template: ''
})
export abstract class BaseCommandComponent implements OnDestroy {
    protected destroy$ = new Subject<void>();
    protected loading = false;
    protected response: CliResponse | null = null;
    protected error: string | null = null;

    constructor(protected cliService: CliService) {}

    protected executeCommand(command: CliCommand): Observable<CliResponse> {
        const command$ = this.cliService.executeCommand(command).pipe(
            takeUntil(this.destroy$),
            tap({
                next: (response) => {
                    this.loading = false;
                    this.response = response;
                    this.handleResponse(response);
                },
                error: (err) => {
                    this.loading = false;
                    this.error = 'Failed to execute command. Please try again.';
                    console.error('Command execution error:', err);
                }
            }),
            catchError(() => EMPTY)
        );

        this.loading = true;
        this.error = null;
        this.response = null;

        return command$;
    }

    protected handleResponse(response: CliResponse): void {
        ;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
} 