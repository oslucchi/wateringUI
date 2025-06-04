import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

    protected executeCommand(command: CliCommand) {
        this.loading = true;
        this.error = null;
        this.response = null;

        this.cliService.executeCommand(command)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
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
            });
    }

    protected handleResponse(response: CliResponse): void {
        // Base implementation - can be overridden by child components
        // By default, just stores the response
        this.response = response;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
} 