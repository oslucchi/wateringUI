export class Status {
  // Static constants (readonly + static)
  static readonly FLG_WATERING = 0;
  static readonly FLG_DISABLE = 1;
  static readonly FLG_SUSPEND = 2;
  static readonly FLG_SKIP = 3;
  static readonly FLG_FORCE = 4;
  static readonly FLG_AUTOSKIP = 5;
  static readonly FLG_SENSOR_DUMP = 6;
  static readonly FLG_MODE = 7;

  static readonly MNGD_FLAGS = 8;

  // Instance fields
  nextStart: Date | null = null;
  moisture: number[] = [];
  watering: boolean[] = [];
  curWateringTime: number[] = [];
  expWateringTime: number[] = [];
  versionId: number = 0;
  flags: boolean[] = new Array(Status.MNGD_FLAGS).fill(false);

  constructor(init?: Partial<Status>, zoneCount: number = 8) {
    Object.assign(this, init);
        // Normalize arrays to default values with correct lengths
    this.moisture = this.fillOrTruncate(this.moisture, zoneCount, 0);
    this.watering = this.fillOrTruncate(this.watering, zoneCount, false);
    this.curWateringTime = this.fillOrTruncate(this.curWateringTime, zoneCount, 0);
    this.expWateringTime = this.fillOrTruncate(this.expWateringTime, zoneCount, 0);
    this.flags = this.fillOrTruncate(this.flags, Status.MNGD_FLAGS, false);

    if (typeof this.nextStart === 'string') {
      this.nextStart = new Date(this.nextStart);
    }
  }

    private fillOrTruncate<T>(arr: T[] | null | undefined, len: number, def: T): T[] {
    const base = Array.isArray(arr) ? arr.slice(0, len) : [];
    while (base.length < len) {
      base.push(def);
    }
    return base;
  }
}
