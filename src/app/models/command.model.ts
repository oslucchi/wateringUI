export interface CliCommand {
    command: string;
    parameters?: string[];
}

export interface CliResponse {
    status: string;
    data: string;
}

export class CommandType {
    static STATUS = 'status';
    static MODE = 'mode';
    static START = 'start';
    static STOP = 'stop';
    static STARTMAN = 'startman';
    static STOPMAN = 'stopman';
    static CONFIGSHOW = 'configshow';
    static CONFIGSAVE = 'configsave';

    static getStartAreaCommand(areaNumber: number): CliCommand {
        return {
            command: this.START,
            parameters: [areaNumber.toString()]
        };
    }

    static getStopAreaCommand(areaNumber: number): CliCommand {
        return {
            command: this.STOP,
            parameters: [areaNumber.toString()]
        };
    }

    static getStartManCommand(areaNumber: number): CliCommand {
        return {
            command: this.STARTMAN,
            parameters: [areaNumber.toString()]
        };
    }

    static getStopManCommand(): CliCommand {
        return {
            command: this.STOPMAN,
            parameters: []
        }
    }

    static getModeCommand(mode: 'auto' | 'manual'): CliCommand {
        return {
            command: this.MODE,
            parameters: [mode === 'auto' ? 'a' : 'm']
        };
    }
} 