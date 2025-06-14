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
              hidden
              placeholder="Configuration will appear here..."
              rows="10"
              class="config-textarea"
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
  iniComments: string[] = []; // Add this line

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
      const parsed = this.parseINI(this.iniData);
      this.createForm(parsed.sections);
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
    const command = CommandType.getConfigSave(ini);
    console.log('Command ', JSON.stringify(command));

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
      },
    });
  }

  protected override handleResponse(response: CliResponse): void {
    super.handleResponse(response);
    if (response.status === 'OK' && response.data) {
      this.configForm.patchValue({ configData: response.data });
      this.iniData = response.data;
      const parsed = this.parseINI(response.data);
      this.iniComments = parsed.comments;
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this.createForm(parsed.sections));
      });
    }
  }

  private parseINI(data: string): {
    sections: Record<string, Record<string, string>>;
    comments: string[];
  } {
    const lines = data.split('\n');
    const result: Record<string, Record<string, string>> = {};
    const comments: string[] = [];
    let section: string | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('#')) {
        comments.push(line);
      } else if (line.startsWith('[') && line.endsWith(']')) {
        section = line.slice(1, -1);
        result[section] = {};
      } else if (section && line.includes('=')) {
        const [key, ...rest] = line.split('=');
        result[section][key.trim()] = rest.join('=').trim();
      }
    }

    return { sections: result, comments };
  }

  private createForm(
    parsedSections: Record<string, Record<string, string>>
  ): void {
    const container: HTMLElement = this.formContainerRef.nativeElement;
    container.innerHTML = '';

    const tabBar: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(tabBar, 'display', 'flex');
    this.renderer.setStyle(tabBar, 'gap', '8px');
    this.renderer.setStyle(tabBar, 'marginBottom', '16px');
    this.renderer.setStyle(tabBar, 'borderBottom', '1px solid #ccc');

    const sectionContentMap: Record<string, HTMLElement> = {};

    Object.keys(parsedSections).forEach((section: string, idx: number) => {
      const tabButton: HTMLButtonElement =
        this.renderer.createElement('button');
      tabButton.innerText = section;
      this.renderer.setStyle(tabButton, 'padding', '8px 16px');
      this.renderer.setStyle(tabButton, 'cursor', 'pointer');
      this.renderer.setStyle(
        tabButton,
        'backgroundColor',
        idx === 0 ? '#ddd' : '#f4f4f4'
      );
      this.renderer.setStyle(tabButton, 'border', 'none');
      this.renderer.setStyle(tabButton, 'fontWeight', 'bold');
      this.renderer.setStyle(tabButton, 'fontSize', '1em');

      tabButton.addEventListener('click', () => {
        Object.entries(sectionContentMap).forEach(([name, el]) => {
          el.style.display = name === section ? 'block' : 'none';
        });
        Array.from(tabBar.children).forEach((btn) => {
          (btn as HTMLElement).style.backgroundColor = '#f4f4f4';
        });
        tabButton.style.backgroundColor = '#ddd';
      });

      this.renderer.appendChild(tabBar, tabButton);
    });

    this.renderer.appendChild(container, tabBar);

    for (const section in parsedSections) {
      const fieldset: HTMLElement = this.renderer.createElement('fieldset');
      this.renderer.setStyle(fieldset, 'marginTop', '12px');
      this.renderer.setStyle(fieldset, 'maxWidth', '100%');
      this.renderer.setStyle(fieldset, 'overflow', 'auto');
      this.renderer.setStyle(
        fieldset,
        'display',
        section === Object.keys(parsedSections)[0] ? 'block' : 'none'
      );
      sectionContentMap[section] = fieldset;

      const legend: HTMLElement = this.renderer.createElement('legend');
      legend.innerText = `[${section}]`;
      this.renderer.setStyle(legend, 'color', '#0077cc');
      this.renderer.setStyle(legend, 'fontWeight', 'bold');
      this.renderer.setStyle(legend, 'fontSize', '1.2em');
      this.renderer.appendChild(fieldset, legend);

      if (section === 'timer') {
        const handled = new Set<string>();
        this.renderTimerSection(
          section,
          parsedSections[section],
          fieldset,
          handled
        );
        for (const key in parsedSections[section]) {
          if (!handled.has(key)) {
            this.renderGenericField(
              section,
              key,
              parsedSections[section][key],
              fieldset
            );
          }
        }
      } else {
        for (const key in parsedSections[section]) {
          this.renderGenericField(
            section,
            key,
            parsedSections[section][key],
            fieldset
          );
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
    // Handle activeSchedules and extendBy first
    ['activeSchedules', 'extendBy'].forEach((key) => {
      if (sectionData[key]) {
        this.renderGenericField(section, key, sectionData[key], fieldset);
        handledKeys.add(key);
      }
    });

    const schedule = sectionData['schedule']?.split('|') ?? [];
    handledKeys.add('schedule');

    // Render schedule inputs
    const scheduleRow = this.renderer.createElement('div');
    this.renderer.setStyle(scheduleRow, 'display', 'flex');
    this.renderer.setStyle(scheduleRow, 'alignItems', 'center');
    this.renderer.setStyle(scheduleRow, 'marginBottom', '16px');

    const scheduleLabel = this.renderer.createElement('label');
    scheduleLabel.innerText = 'Schedule Times';
    this.renderer.setStyle(scheduleLabel, 'minWidth', '150px');
    this.renderer.setStyle(scheduleLabel, 'marginRight', '8px');
    this.renderer.setStyle(scheduleLabel, 'fontWeight', 'bold');
    this.renderer.appendChild(scheduleRow, scheduleLabel);

    schedule.forEach((time, schedIdx) => {
      const input = this.renderer.createElement('input');
      this.renderer.setAttribute(input, 'type', 'time');
      this.renderer.setAttribute(
        input,
        'name',
        `${section}.schedule.${schedIdx}`
      );
      // Ensure time is in HH:MM format
      const formattedTime = time.length === 4 ? `0${time}` : time; // Handle times like "7:30" -> "07:30"
      this.renderer.setProperty(input, 'value', formattedTime);
      this.renderer.setStyle(input, 'width', '100px');
      this.renderer.setStyle(input, 'marginRight', '8px');
      this.renderer.appendChild(scheduleRow, input);
    });

    this.renderer.appendChild(fieldset, scheduleRow);

    // Rest of the timer section rendering...
    const autoZoneKeys = Object.keys(sectionData).filter((k) =>
      k.startsWith('durationZone_')
    );
    const manualZoneKeys = Object.keys(sectionData).filter((k) =>
      k.startsWith('manualZone_')
    );

    // Add all zone keys to handledKeys
    [...autoZoneKeys, ...manualZoneKeys].forEach((key) => handledKeys.add(key));

    // Render schedule headers and auto zones
    schedule.forEach((time, schedIdx) => {
      const header = this.renderer.createElement('div');

      header.innerText = `Schedule [${schedIdx}] - ${time}`;
      this.renderer.setStyle(header, 'fontWeight', 'bold');
      this.renderer.setStyle(header, 'marginTop', '12px');
      this.renderer.appendChild(fieldset, header);

      autoZoneKeys.forEach((zoneKey) => {
        const row = this.renderer.createElement('div');
        this.renderer.setStyle(row, 'display', 'flex');
        this.renderer.setStyle(row, 'alignItems', 'center');
        this.renderer.setStyle(row, 'marginBottom', '6px');

        const label = this.renderer.createElement('label');
        label.innerText = `${zoneKey}`;
        this.renderer.setStyle(label, 'minWidth', '150px');
        this.renderer.setStyle(label, 'marginRight', '8px');
        this.renderer.appendChild(row, label);

        const group = sectionData[zoneKey].split('|');
        const values = group[schedIdx]?.split(',') ?? [];

        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
          const val = values[dayIdx] || '0';
          const input = this.renderer.createElement('input');
          this.renderer.setAttribute(input, 'type', 'text');
          this.renderer.setAttribute(
            input,
            'name',
            `${section}.${zoneKey}.${schedIdx}.${dayIdx}`
          );
          this.renderer.setProperty(input, 'value', val);
          this.renderer.setStyle(input, 'width', '32px');
          this.renderer.setStyle(input, 'marginRight', '4px');
          this.renderer.appendChild(row, input);
        }

        this.renderer.appendChild(fieldset, row);
      });
    });

    // Render manual zones section
    if (manualZoneKeys.length > 0) {
      const manualHeader = this.renderer.createElement('div');
      manualHeader.innerText = 'Manual Zones';
      this.renderer.setStyle(manualHeader, 'fontWeight', 'bold');
      this.renderer.setStyle(manualHeader, 'marginTop', '24px');
      this.renderer.setStyle(manualHeader, 'marginBottom', '12px');
      this.renderer.appendChild(fieldset, manualHeader);

      manualZoneKeys.forEach((zoneKey) => {
        const row = this.renderer.createElement('div');
        this.renderer.setStyle(row, 'display', 'flex');
        this.renderer.setStyle(row, 'alignItems', 'center');
        this.renderer.setStyle(row, 'marginBottom', '6px');

        const label = this.renderer.createElement('label');
        label.innerText = `${zoneKey}`;
        this.renderer.setStyle(label, 'minWidth', '150px');
        this.renderer.setStyle(label, 'marginRight', '8px');
        this.renderer.appendChild(row, label);

        const values = sectionData[zoneKey].split(',');
        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
          const val = values[dayIdx] || '0';
          const input = this.renderer.createElement('input');
          this.renderer.setAttribute(input, 'type', 'text');
          this.renderer.setAttribute(
            input,
            'name',
            `${section}.${zoneKey}.${dayIdx}`
          );
          this.renderer.setProperty(input, 'value', val);
          this.renderer.setStyle(input, 'width', '32px');
          this.renderer.setStyle(input, 'marginRight', '4px');
          this.renderer.appendChild(row, input);
        }

        this.renderer.appendChild(fieldset, row);
      });
    }
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
    const isShortField =
      values.length > 1 && values.every((v) => v.length <= 4);

    const row = this.renderer.createElement('div');
    this.renderer.setStyle(row, 'display', 'flex');
    this.renderer.setStyle(row, 'alignItems', 'flex-start');
    this.renderer.setStyle(row, 'marginBottom', '8px');

    const label = this.renderer.createElement('label');
    label.innerText = key;
    this.renderer.setStyle(label, 'minWidth', '200px');
    this.renderer.setStyle(label, 'fontWeight', 'bold');
    this.renderer.setStyle(label, 'marginRight', '12px');
    this.renderer.appendChild(row, label);

    const inputWrap = this.renderer.createElement('div');
    this.renderer.setStyle(inputWrap, 'flexGrow', '1');
    this.renderer.setStyle(inputWrap, 'display', 'flex');
    this.renderer.setStyle(
      inputWrap,
      'flexDirection',
      isShortField ? 'row' : 'column'
    );
    this.renderer.setStyle(inputWrap, 'gap', isShortField ? '8px' : '4px');

    values.forEach((val: string, idx: number) => {
      if (val === 'true' || val === 'false') {
        const radioGroup = this.renderer.createElement('div');
        ['true', 'false'].forEach((opt) => {
          const radioLabel = this.renderer.createElement('label');
          this.renderer.setStyle(radioLabel, 'marginRight', '12px');

          const radio = this.renderer.createElement('input');
          this.renderer.setAttribute(radio, 'type', 'radio');
          this.renderer.setAttribute(radio, 'name', `${section}.${key}.${idx}`);
          this.renderer.setAttribute(radio, 'value', opt);
          if (opt === val) {
            this.renderer.setProperty(radio, 'checked', true);
          }

          radioLabel.appendChild(radio);
          radioLabel.appendChild(document.createTextNode(' ' + opt));
          this.renderer.appendChild(radioGroup, radioLabel);
        });
        this.renderer.appendChild(inputWrap, radioGroup);
      } else {
        const input = this.renderer.createElement('input');
        this.renderer.setAttribute(input, 'type', 'text');
        this.renderer.setAttribute(input, 'name', `${section}.${key}.${idx}`);
        this.renderer.setProperty(input, 'value', val);
        const pxWidth = Math.min(Math.max(val.length * 8, 80), 400);
        this.renderer.setStyle(input, 'width', `${pxWidth}px`);
        this.renderer.appendChild(inputWrap, input);
      }
    });

    this.renderer.appendChild(row, inputWrap);
    this.renderer.appendChild(fieldset, row);
  }

  private exportForm(): string {
    const container: HTMLElement = this.formContainerRef.nativeElement;
    const inputs: NodeListOf<HTMLInputElement> =
      container.querySelectorAll('input');
    const headers: NodeListOf<HTMLDivElement> =
      container.querySelectorAll('div'); // For schedule headers

    const output: Record<string, Record<string, string[]>> = {};
    const scheduleMap: Record<number, string> = {};
    const durationMap: Record<string, Record<number, string[]>> = {};
    const manualZoneMap: Record<string, string[]> = {};

    // First extract schedule times from headers
    headers.forEach((header: HTMLDivElement) => {
      if (header.innerText.startsWith('Schedule [')) {
        const match = header.innerText.match(
          /Schedule \[(\d+)\] - (\d{2}:\d{2})/
        );
        if (match) {
          const schedIndex = parseInt(match[1], 10);
          scheduleMap[schedIndex] = match[2];
        }
      }
    });

    // Collect all input values
    inputs.forEach((input: HTMLInputElement) => {
      const parts = input.name.split('.');
      if (parts.length < 2) return;

      const [section, key, ...rest] = parts;

      if (!output[section]) output[section] = {};

      // Handle schedule inputs
      if (section === 'timer' && key === 'schedule') {
        const schedIndex = parseInt(rest[0], 10);
        scheduleMap[schedIndex] = input.value;
        return;
      }

      // Handle durationZone_x
      if (section === 'timer' && key.startsWith('durationZone_')) {
        const schedIdx = parseInt(rest[0], 10);
        const dayIdx = parseInt(rest[1], 10);
        if (!durationMap[key]) durationMap[key] = {};
        if (!durationMap[key][schedIdx]) durationMap[key][schedIdx] = [];
        durationMap[key][schedIdx][dayIdx] = input.value;
        return;
      }

      // Handle manualZone_x
      if (section === 'timer' && key.startsWith('manualZone_')) {
        const dayIdx = parseInt(rest[0], 10);
        if (!manualZoneMap[key]) manualZoneMap[key] = [];
        manualZoneMap[key][dayIdx] = input.value;
        return;
      }

      const idx = parseInt(rest[0], 10);
      if (!output[section][key]) output[section][key] = [];

      if (input.type === 'radio') {
        if (input.checked) {
          output[section][key][idx] = input.value;
        }
      } else {
        output[section][key][idx] = input.value;
      }
    });

    let ini = '';

    // Add comments at the top
    if (this.iniComments.length > 0) {
      ini += this.iniComments.join('\n') + '\n\n';
    }

    // All sections except [timer]
    for (const section in output) {
      if (section === 'timer') continue;
      ini += `[${section}]\n`;
      for (const key in output[section]) {
        const values = output[section][key].filter((v) => v !== undefined);
        ini += `${key} = ${values.join('|')}\n`;
      }
      ini += '\n';
    }

    // [timer] section
    ini += `[timer]\n`;

    // schedule - from input values
    const schedIndices = Object.keys(scheduleMap)
      .map(Number)
      .sort((a, b) => a - b);
    const scheduleLine = schedIndices
      .map((i) => scheduleMap[i] || '07:30') // Default to 07:30 if empty
      .join('|');
    ini += `schedule = ${scheduleLine}\n`;

    // add activeSchedules and extendBy if present
    if (output['timer']) {
      ['activeSchedules', 'extendBy'].forEach((key) => {
        if (output['timer'][key]) {
          const values = output['timer'][key].filter((v) => v !== undefined);
          ini += `${key} = ${values.join('|')}\n`;
        }
      });
    }

    // durationZone_*
    const zoneKeys = Object.keys(durationMap).sort((a, b) => {
      const aNum = parseInt(a.replace('durationZone_', ''), 10);
      const bNum = parseInt(b.replace('durationZone_', ''), 10);
      return aNum - bNum;
    });

    for (const zoneKey of zoneKeys) {
      const perSchedule = durationMap[zoneKey];
      const schedLines: string[] = [];

      const maxSched = Math.max(...Object.keys(perSchedule).map(Number));
      for (let s = 0; s <= maxSched; s++) {
        const dayValues = perSchedule[s] || [];
        const filled = [...dayValues];
        while (filled.length < 7) filled.push('0');
        schedLines.push(filled.join(','));
      }

      ini += `${zoneKey} = ${schedLines.join('|')}\n`;
    }

    // manualZone_*
    const manualZoneKeys = Object.keys(manualZoneMap).sort((a, b) => {
      const aNum = parseInt(a.replace('manualZone_', ''), 10);
      const bNum = parseInt(b.replace('manualZone_', ''), 10);
      return aNum - bNum;
    });

    for (const zoneKey of manualZoneKeys) {
      const values = manualZoneMap[zoneKey];
      const filled = [...values];
      while (filled.length < 7) filled.push('0');
      ini += `${zoneKey} = ${filled.join(',')}\n`;
    }

    const pre = document.getElementById('output');
    if (pre) pre.textContent = ini.trim();

    return ini.trim();
  }
}
