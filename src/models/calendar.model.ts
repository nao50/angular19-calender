import { Schedule } from './schedule.model';

export type CalendarView = 'Month' | 'Week' | 'Day';

export interface CalendarEventPosition {
  event: Schedule;
  column: number;
  columnSpan: number;
  row: number;
  rowSpan: number;
}