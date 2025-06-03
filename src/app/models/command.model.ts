export interface CliCommand {
    cmd: string;
}

export interface CliResponse {
    status: string;
    data: string;
}

export class CommandType {
    static STATUS = 'status';
    static MODE_AUTO = 'mode a';
    static MODE_MANUAL = 'mode m';
    static START_AREA = 'start';  // Will be concatenated with area number
    static STOP_AREA = 'stop';   // Will be concatenated with area number
    static START_CYCLE = 'START_CYCLE';
    static REVIEW_SCHEDULE = 'REVIEW_SCHEDULE';
    static CONFIGURE = 'CONFIGURE';
    static STARTMAN = 'startman'; // New manual start command

    static getStartAreaCommand(areaNumber: number): string {
        return `${this.START_AREA} ${areaNumber}`;
    }

    static getStopAreaCommand(areaNumber: number): string {
        return `${this.STOP_AREA} ${areaNumber}`;
    }

    static getStartManCommand(areaNumber: number): string {
        return `${this.STARTMAN} ${areaNumber}`;
    }
} 