import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, tap } from 'rxjs';
import { CliCommand, CliResponse } from '../models/command.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private readonly TIMEOUT_MS = 5000; // 5 second timeout

    constructor(private http: HttpClient) {}

    executeCommand(command: CliCommand): Observable<CliResponse> {
        console.log('Sending command object:', command);
        console.log('Sending JSON:', JSON.stringify(command));  // Show exact JSON being sent
        return this.http.post<CliResponse>(`${environment.apiBasePath}/command`, command)
            .pipe(
                tap(response => console.log('Received response:', response)),  // Log the response
                timeout(this.TIMEOUT_MS),
                catchError(error => {
                    console.error('Command error:', error);  // Log any errors
                    if (error.name === 'TimeoutError') {
                        throw new Error('Request timed out');
                    }
                    throw error;
                })
            );
    }
} 