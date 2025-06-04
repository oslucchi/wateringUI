import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CliCommand, CliResponse } from '../models/command.model';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root'
})
export class CliService {
    constructor(private socketService: SocketService) {}

    executeCommand(command: CliCommand): Observable<CliResponse> {
        return this.socketService.executeCommand(command);
    }
} 