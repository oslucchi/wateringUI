import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  NgZone,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseCommandComponent } from '../base-command/base-command.component';
import { CliService } from '../../services/cli.service';
import {
  CommandType,
  CliResponse,
  CliCommand,
} from '../../models/command.model';

@Component({
  selector: 'app-configure',
  template: `
    <div class="configure-container">
      <div class="command-section">
        <h2>Configuration</h2>
        <div class="command-content">
          <div class="config-actions">
            <button
              (click)="onShowConfig()"
              [disabled]="loading"
              class="action-button"
            >
              Show Current Configuration
            </button>
            <button
              (click)="onSaveConfig()"
              [disabled]="loading || !configForm.get('configData')?.value"
              class="action-button save"
            >
              Save Configuration
            </button>
          </div>
          <form [formGroup]="configForm">
            <textarea
              formControlName="configData"
              placeholder="Configuration will appear here..."
              rows="10"
              class="config-textarea"
              hidden
            ></textarea>
          </form>
          <div #formContainer id="form-container"></div>
          <pre id="output"></pre>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./configure.component.css'],
})
export class ConfigureComponent
  extends BaseCommandComponent
  implements AfterViewInit
{
  configForm: FormGroup;
  iniData: string | null = null;

  @ViewChild('formContainer') formContainerRef!: ElementRef;

  constructor(
    protected override cliService: CliService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    super(cliService);
    this.configForm = this.formBuilder.group({
      configData: [''],
    });
  }

  ngAfterViewInit(): void {
    if (this.iniData) {
      this.createForm(this.iniData);
    }
  }

  onShowConfig(): void {
    const command = CommandType.getConfigShow();
    this.loading = true;
    this.cliService.executeCommand(command).subscribe({
      next: (response: CliResponse) => {
        if (response.status === 'OK') {
          this.response = response;
          this.loading = false;
          this.handleResponse(response);
        }
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      },
    });
  }

  onSaveConfig(): void {
    const ini = this.exportForm();
    const command: CliCommand = {
      command: 'configsave',
      parameters: [ini],
    };
    this.executeCommand(command);
  }

  protected override handleResponse(response: CliResponse): void {
    super.handleResponse(response);
    if (response.status === 'OK' && response.data) {
      this.configForm.patchValue({ configData: response.data });
      this.iniData = response.data;
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this.createForm(this.iniData!));
      });
    }
  }

  private parseINI(data: string): Record<string, Record<string, string>> {
    const lines = data.split('\n');
    const result: Record<string, Record<string, string>> = {};
    let section: string | null = null;
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;
      if (line.startsWith('[') && line.endsWith(']')) {
        section = line.slice(1, -1);
        result[section] = {};
      } else if (section && line.includes('=')) {
        const [key, ...rest] = line.split('=');
        result[section][key.trim()] = rest.join('=').trim();
      }
    }
    return result;
  }

  private createForm(data: string): void {
    const container: HTMLElement = this.formContainerRef.nativeElement;
    container.innerHTML = '';
    const parsed: Record<string, Record<string, string>> = this.parseINI(data);

    const tabBar: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(tabBar, 'display', 'flex');
    this.renderer.setStyle(tabBar, 'gap', '12px');
    this.renderer.setStyle(tabBar, 'marginBottom', '16px');
    this.renderer.setStyle(tabBar, 'borderBottom', '1px solid #ccc');

    const sectionContentMap: Record<string, HTMLElement> = {};

    Object.keys(parsed).forEach((section: string, idx: number) => {
      const tabButton: HTMLButtonElement =
        this.renderer.createElement('button');
      tabButton.innerText = section;
      this.renderer.setStyle(tabButton, 'padding', '8px 16px');
      this.renderer.setStyle(tabButton, 'cursor', 'pointer');
      this.renderer.setStyle(tabButton, 'border', 'none');
      this.renderer.setStyle(
        tabButton,
        'backgroundColor',
        idx === 0 ? '#ddd' : '#f4f4f4'
      );
      this.renderer.setStyle(
        tabButton,
        'borderBottom',
        '2px solid transparent'
      );
      this.renderer.setStyle(tabButton, 'fontWeight', 'normal');
      this.renderer.setStyle(tabButton, 'color', 'black');
      this.renderer.setStyle(tabButton, 'fontSize', '1em');

      tabButton.addEventListener('click', () => {
        Object.entries(sectionContentMap).forEach(([name, element]) => {
          element.style.display = name === section ? 'block' : 'none';
        });
        Array.from(tabBar.children).forEach((btn) => {
          (btn as HTMLElement).style.backgroundColor = '#f4f4f4';
        });
        (tabButton as HTMLElement).style.backgroundColor = '#ddd';
      });

      this.renderer.appendChild(tabBar, tabButton);
    });

    this.renderer.appendChild(container, tabBar);

    for (const section in parsed) {
      const fieldset: HTMLElement = this.renderer.createElement('fieldset');
      this.renderer.setStyle(fieldset, 'marginTop', '12px');
      this.renderer.setStyle(fieldset, 'maxWidth', '100%');
      this.renderer.setStyle(fieldset, 'overflow', 'auto');
      this.renderer.setStyle(
        fieldset,
        'display',
        section === Object.keys(parsed)[0] ? 'block' : 'none'
      );
      sectionContentMap[section] = fieldset;

      const legend: HTMLElement = this.renderer.createElement('legend');
      legend.innerText = `[${section}]`;
      this.renderer.setStyle(legend, 'color', '#0077cc');
      this.renderer.setStyle(legend, 'fontWeight', 'bold');
      this.renderer.appendChild(fieldset, legend);

      if (section === 'timer') {
        const handled = new Set<string>();
        this.renderTimerSection(section, parsed[section], fieldset, handled);
        for (const key in parsed[section]) {
          if (!handled.has(key)) {
            this.renderGenericField(
              section,
              key,
              parsed[section][key],
              fieldset
            );
          }
        }
      } else {
        for (const key in parsed[section]) {
          this.renderGenericField(section, key, parsed[section][key], fieldset);
        }
      }

      this.renderer.appendChild(container, fieldset);
    }
  }

  private renderTimerSection(
    section: string,
    sectionData: Record<string, string>,
    fieldset: HTMLElement,
    handledKeys: Set<string>
  ): void {
    const schedule = sectionData['schedule']?.split('|') ?? [];
    handledKeys.add('schedule');

    const zoneKeys = Object.keys(sectionData).filter((k) =>
      k.startsWith('durationZone_')
    );
    for (const key of zoneKeys) {
      handledKeys.add(key);
    }
    const zoneData: Record<string, string[][]> = {};
    for (const key of zoneKeys) {
      zoneData[key] = sectionData[key]
        .split('|')
        .map((group) => group.split(',').map((v) => v.trim()));
    }

    schedule.forEach((time: string, schedIdx: number) => {
      const schedLabel = this.renderer.createElement('div');
      this.renderer.setStyle(schedLabel, 'marginTop', '12px');
      this.renderer.setStyle(schedLabel, 'fontWeight', 'bold');
      this.renderer.setStyle(schedLabel, 'color', '#444');
      schedLabel.innerText = `Schedule [${schedIdx}] - ${time}`;
      this.renderer.appendChild(fieldset, schedLabel);

      zoneKeys.forEach((zoneKey: string) => {
        const zoneValues = zoneData[zoneKey][schedIdx] ?? [''];
        const value = zoneValues[0];

        const rowWrapper = this.renderer.createElement('div');
        this.renderer.setStyle(rowWrapper, 'display', 'flex');
        this.renderer.setStyle(rowWrapper, 'alignItems', 'center');
        this.renderer.setStyle(rowWrapper, 'marginBottom', '4px');

        const label = this.renderer.createElement('label');
        label.innerText = `${zoneKey}`;
        this.renderer.setStyle(label, 'minWidth', '200px');
        this.renderer.setStyle(label, 'marginRight', '12px');
        this.renderer.setStyle(label, 'fontWeight', 'normal');
        this.renderer.appendChild(rowWrapper, label);

        const input = this.renderer.createElement('input');
        this.renderer.setAttribute(input, 'type', 'text');
        this.renderer.setAttribute(
          input,
          'name',
          `${section}.${zoneKey}.${schedIdx}`
        );
        this.renderer.setProperty(input, 'value', value);
        const pxWidth = Math.min(Math.max(value.length * 8, 80), 400);
        this.renderer.setStyle(input, 'width', `${pxWidth}px`);
        this.renderer.setStyle(input, 'fontFamily', 'monospace');

        this.renderer.appendChild(rowWrapper, input);
        this.renderer.appendChild(fieldset, rowWrapper);
      });
    });
  }

  private renderGenericField(
    section: string,
    key: string,
    rawValue: string,
    fieldset: HTMLElement
  ): void {
    const values: string[] = rawValue.includes('|')
      ? rawValue.split('|')
      : [rawValue];
    const isShortField: boolean =
      values.length > 1 && values.every((v) => v.length <= 4);

    const rowWrapper: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(rowWrapper, 'display', 'flex');
    this.renderer.setStyle(rowWrapper, 'alignItems', 'flex-start');
    this.renderer.setStyle(rowWrapper, 'marginBottom', '8px');

    const label: HTMLElement = this.renderer.createElement('label');
    label.innerText = key;
    this.renderer.setStyle(label, 'minWidth', '200px');
    this.renderer.setStyle(label, 'fontWeight', 'bold');
    this.renderer.setStyle(label, 'marginRight', '12px');
    this.renderer.appendChild(rowWrapper, label);

    const inputContainer: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(inputContainer, 'flexGrow', '1');
    this.renderer.setStyle(inputContainer, 'display', 'flex');
    this.renderer.setStyle(
      inputContainer,
      'flexDirection',
      isShortField ? 'row' : 'column'
    );
    this.renderer.setStyle(inputContainer, 'gap', isShortField ? '8px' : '4px');

    values.forEach((val: string, idx: number) => {
      if (val === 'true' || val === 'false') {
        const radioWrapper: HTMLElement = this.renderer.createElement('div');
        ['true', 'false'].forEach((option: string) => {
          const radioLabel: HTMLElement = this.renderer.createElement('label');
          this.renderer.setStyle(radioLabel, 'marginRight', '16px');

          const radio: HTMLInputElement = this.renderer.createElement('input');
          this.renderer.setAttribute(radio, 'type', 'radio');
          this.renderer.setAttribute(radio, 'name', `${section}.${key}.${idx}`);
          this.renderer.setAttribute(radio, 'value', option);
          if (option === val) {
            this.renderer.setProperty(radio, 'checked', true);
          }

          radioLabel.appendChild(radio);
          radioLabel.appendChild(document.createTextNode(' ' + option));
          this.renderer.appendChild(radioWrapper, radioLabel);
        });
        this.renderer.appendChild(inputContainer, radioWrapper);
      } else {
        const input: HTMLInputElement = this.renderer.createElement('input');
        this.renderer.setAttribute(input, 'type', 'text');
        this.renderer.setAttribute(input, 'name', `${section}.${key}.${idx}`);
        this.renderer.setProperty(input, 'value', val);
        const pxWidth = Math.min(Math.max(val.length * 8, 80), 400);
        this.renderer.setStyle(input, 'width', `${pxWidth}px`);
        this.renderer.setStyle(input, 'fontFamily', 'monospace');
        this.renderer.appendChild(inputContainer, input);
      }
    });

    this.renderer.appendChild(rowWrapper, inputContainer);
    this.renderer.appendChild(fieldset, rowWrapper);
  }

  private exportForm(): string {
    const container: HTMLElement = this.formContainerRef.nativeElement;
    const inputs: NodeListOf<HTMLInputElement> =
      container.querySelectorAll('input');

    const output: Record<string, Record<string, string[]>> = {};
    const scheduleMap: Record<number, string> = {};
    const durationZoneMap: Record<string, string[][]> = {};

    inputs.forEach((input: HTMLInputElement) => {
      const [section, key, indexStr] = input.name.split('.');
      const index = parseInt(indexStr, 10);

      // Handle schedule entries
      if (section === 'timer' && key === 'schedule') {
        scheduleMap[index] = input.value;
        return;
      }

      // Handle durationZone_x
      if (section === 'timer' && key.startsWith('durationZone_')) {
        if (!durationZoneMap[key]) durationZoneMap[key] = [];
        if (!durationZoneMap[key][index]) durationZoneMap[key][index] = [];

        if (input.type === 'radio') {
          if (input.checked) {
            durationZoneMap[key][index].push(input.value);
          }
        } else {
          durationZoneMap[key][index].push(input.value);
        }
        return;
      }

      // Handle regular fields
      if (!output[section]) output[section] = {};
      if (!output[section][key]) output[section][key] = [];

      if (input.type === 'radio') {
        if (input.checked) {
          output[section][key][index] = input.value;
        }
      } else {
        output[section][key][index] = input.value;
      }
    });

    // Construct INI text
    let ini = '';

    for (const section in output) {
      if (section === 'timer') continue; // skip timer here; will handle it at the end
      ini += `[${section}]\n`;
      for (const key in output[section]) {
        const values = output[section][key].filter((v) => v !== undefined);
        ini += `${key} = ${values.join('|')}\n`;
      }
      ini += '\n';
    }

    // Now output the timer section separately
    ini += `[timer]\n`;

    // Output schedule line
    const sortedScheduleIndices = Object.keys(scheduleMap)
      .map(Number)
      .sort((a, b) => a - b);
    const scheduleValues = sortedScheduleIndices.map(
      (i) => scheduleMap[i] || ''
    );
    ini += `schedule = ${scheduleValues.join('|')}\n`;

    // Output all durationZone_x with full 7-comma-separated values per schedule
    for (const key in durationZoneMap) {
      const zoneLines: string[] = [];
      const maxScheduleIdx = Math.max(
        ...Object.keys(durationZoneMap[key]).map(Number)
      );

      for (let schedIdx = 0; schedIdx <= maxScheduleIdx; schedIdx++) {
        const values = durationZoneMap[key][schedIdx] || [];
        // Fill to 7 values
        const filled = [...values];
        while (filled.length < 7) filled.push('0');
        zoneLines.push(filled.join(','));
      }

      ini += `${key} = ${zoneLines.join('|')}\n`;
    }

    ini += '\n';

    const pre = document.getElementById('output');
    if (pre) pre.textContent = ini.trim();

    return ini.trim();
  }
}
