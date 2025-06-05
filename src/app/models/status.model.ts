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
  moisture: number[] | null = null;
  watering: boolean[] | null = null;
  curWateringTime: number[] | null = null;
  expWateringTime: number[] | null = null;
  versionId: number = 0;
  flags: boolean[] = new Array(Status.MNGD_FLAGS).fill(false);

  constructor(init?: Partial<Status>) {
    Object.assign(this, init);
  }
}
