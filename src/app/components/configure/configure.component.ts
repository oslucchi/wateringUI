import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType, CliResponse, CliCommand } from '../../models/command.model';

@Component({
    selector: 'app-configure',
    template: `
        <div class="configure-container">
            <div class="command-section">
                <h2>Configuration</h2>
                <div class="command-content">
                    <div class="config-actions">
                        <button (click)="onShowConfig()" [disabled]="loading" class="action-button">
                            Show Current Configuration
                        </button>
                        <button (click)="onSaveConfig()" [disabled]="loading || !configForm.get('configData')?.value" class="action-button save">
                            Save Configuration
                        </button>
                    </div>
                    <form [formGroup]="configForm">
                        <textarea formControlName="configData" 
                                placeholder="Configuration will appear here..."
                                rows="10"
                                class="config-textarea">
                        </textarea>
                    </form>
                </div>
            </div>
            <div class="response-section" *ngIf="response">
                <h3>Response</h3>
                <pre>{{ response | json }}</pre>
            </div>
        </div>
    `,
    styleUrls: ['./configure.component.css']
})
export class ConfigureComponent extends BaseCommandComponent {
    configForm: FormGroup;

    constructor(
        protected override cliService: CliService,
        private formBuilder: FormBuilder
    ) {
        super(cliService);
        this.configForm = this.formBuilder.group({
            configData: ['']
        });
    }

    onShowConfig() {
        const command: CliCommand = {
            command: 'configshow'
        };
        this.executeCommand(command);
    }

    onSaveConfig() {
        if (this.configForm.valid && this.configForm.get('configData')?.value) {
            const command: CliCommand = {
                command: 'configsave',
                parameters: [this.configForm.get('configData')?.value]
            };
            this.executeCommand(command);
        }
    }

    protected override handleResponse(response: CliResponse): void {
        super.handleResponse(response);
        if (response.status === 'OK' && response.data) {
            this.configForm.patchValue({
                configData: response.data
            });
        }
    }
} 