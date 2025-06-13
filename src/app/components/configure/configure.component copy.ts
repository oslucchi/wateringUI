import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import { CommandType, CliResponse, CliCommand } from '../../models/command.model';

@Component({
    selector: 'app-configure-copy',
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
                    <div id="form-container"></div>
                    <pre id="output"></pre>
                </div>
            </div>
        </div>

        <script>
            function parseINI(data) {
                const lines = data.split('\n');
                const result = {};
                let section = null;

                for (let line of lines) {
                    line = line.trim();
                    if (!line || line.startsWith('#')) continue;

                    if (line.startsWith('[') && line.endsWith(']')) {
                        section = line.slice(1, -1);
                        result[section] = {};
                    } else if (section && line.includes('=')) {
                        const [key, ...rest] = line.split('=');
                        result[section][key.trim()] = rest.join('=').trim();
                    } else if (section) {
                        if (!result[section]._raw) result[section]._raw = [];
                        result[section]._raw.push(line);
                    }
                }
                return result;
            }

            function createForm(data) {
                const container = document.getElementById('form-container');
                if (!container) return;
                container.innerHTML = ''; // Clear previous

                const parsed = parseINI(data);
                for (const section in parsed) {
                    const fieldset = document.createElement('fieldset');
                    const legend = document.createElement('legend');
                    legend.textContent = '[' + section + ']';
                    fieldset.appendChild(legend);

                    for (const key in parsed[section]) {
                        if (key === '_raw') continue;

                        const label = document.createElement('label');
                        label.textContent = key;
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.name = section + key;
                        input.value = parsed[section][key];
                        label.appendChild(input);
                        fieldset.appendChild(label);
                    }

                    container.appendChild(fieldset);
                }
            }

            function exportConfig() {
                const inputs = document.querySelectorAll('input[type="text"]');
                const output = {};
                for (const input of inputs) {
                    const [section, key] = input.name.split('.');
                    if (!output[section]) output[section] = {};
                    output[section][key] = input.value;
                }

                let ini = '';
                for (const section in output) {
                    ini += '[' + section + ']\n';
                    for (const key in output[section]) {
                        ini += key + ' = ' + output[section][key] + '\\n';
                    }
                    ini += '\n';
                }

                const pre = document.getElementById('output');
                if (pre) pre.textContent = ini.trim();
            }
        </script>
    `,
    styleUrls: ['./configure.component.css']
})
export class ConfigureComponentCopy extends BaseCommandComponent implements AfterViewInit{
    configForm: FormGroup;
    iniData: string | null = null;

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
        const command = CommandType.getConfigShow();
        console.log("Command ", JSON.stringify(command));

        this.loading = true;
        this.cliService.executeCommand(command).subscribe({
            next: (response: CliResponse) => {
                if (response.status === 'OK') {
                    this.response = response;
                    this.loading = false;
                }
            },
            error: (err) => {
                this.error = err;
                this.loading = false;
            }
        });
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
            this.iniData = response.data;

            // Run the dynamic form render each time response updates
            setTimeout(() => {
                (window as any).createForm?.(this.iniData);
            });
        }
    }

    ngAfterViewInit() {
        console.log("ngAfterViewInit: " +JSON.stringify(this.iniData));
         if (this.iniData) {
            (window as any).createForm(this.iniData);
        }
    }
} 