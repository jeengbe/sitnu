export interface Untis {
  data: UntisData;
  date?: number;
  offline?: true;
}

export interface UntisData {
  result: Result;
}

export interface Result {
  data:                ResultData;
  lastImportTimestamp: number;
}

export interface ResultData {
  noDetails:      boolean;
  elementIds:     number[];
  elementPeriods: Record<string, ElementPeriod[]>;
  elements:       DataElement[];
}

export interface ElementPeriod {
  id:                number;
  lessonId:          number;
  lessonNumber:      number;
  lessonCode:        LessonCode;
  lessonText:        LessonText;
  periodText:        string;
  hasPeriodText:     boolean;
  periodInfo:        string;
  periodAttachments: any[];
  staffText:         string;
  staffAttachments:  any[];
  substText:         string;
  date:              number;
  startTime:         number;
  endTime:           number;
  elements:          ElementPeriod_Element[];
  studentGroup:      string;
  hasInfo:           boolean;
  code:              number;
  cellState:         CellState;
  priority:          number;
  is:                Is;
  roomCapacity:      number;
  studentCount:      number;
}

export enum CellState {
  Cancel = "CANCEL",
  Roomsubstitution = "ROOMSUBSTITUTION",
  Standard = "STANDARD",
  Substitution = "SUBSTITUTION",
}

export interface ElementPeriod_Element {
  type:    number;
  id:      number;
  orgId:   number;
  missing: boolean;
  state:   State;
}

export enum State {
  Regular = "REGULAR",
  Substituted = "SUBSTITUTED",
}

export interface Is {
  standard?:         boolean;
  event:             boolean;
  cancelled?:        boolean;
  substitution?:     boolean;
  roomSubstitution?: boolean;
}

export enum LessonCode {
  UntisLesson = "UNTIS_LESSON",
}

export enum LessonText {
  Empty = "",
  The14TägigWocheA = "14-tägig Woche A",
  The1HalbjahrEk = "1. Halbjahr (ek)",
}

export interface DataElement {
  type:             number;
  id:               number;
  name:             string;
  longName?:        string;
  displayname?:     string;
  alternatename?:   string;
  canViewTimetable: boolean;
  roomCapacity:     number;
  externKey?:       string;
}
