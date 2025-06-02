import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError } from 'rxjs';
import { CliCommand, CliResponse } from '../models/command.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private readonly TIMEOUT_MS = 5000; // 5 second timeout

    constructor(private http: HttpClient) {}

    executeCommand(command: string): Observable<CliResponse> {
        return this.http.post<CliResponse>(`${environment.apiBasePath}/command`, { cmd: command })
            .pipe(
                timeout(this.TIMEOUT_MS),
                catchError(error => {
                    if (error.name === 'TimeoutError') {
                        throw new Error('Request timed out');
                    }
                    throw error;
                })
            );
    }
} 