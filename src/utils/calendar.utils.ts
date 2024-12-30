import { Schedule } from '../models/schedule.model';
import { CalendarEventPosition } from '../models/calendar.model';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  addDays,
  differenceInDays,
  endOfMonth,
  startOfMonth
} from 'date-fns';

export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 })
  });
}

export function calculateEventPositions(
  events: Schedule[],
  startDate: Date,
  days: number
): CalendarEventPosition[] {
  const positions: CalendarEventPosition[] = [];
  const columns = new Array(days).fill(0);

  for (const event of events) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    // Calculate row and rowSpan
    const startIndex = Math.max(0, differenceInDays(start, startDate));
    const endIndex = Math.min(days - 1, differenceInDays(end, startDate));
    const rowSpan = endIndex - startIndex + 1;

    // Find available column
    let column = 0;
    while (columns[startIndex + column] > 0) {
      column++;
    }

    // Mark columns as used
    for (let i = startIndex; i <= endIndex; i++) {
      columns[i] = Math.max(columns[i], column + 1);
    }

    positions.push({
      event,
      column,
      columnSpan: 1,
      row: startIndex,
      rowSpan
    });
  }

  return positions;
}

export function getEventsForDay(
  date: Date,
  events: Schedule[],
  firstEventOnly: boolean = false
): Schedule[] {
  return events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    const isInDay = isWithinInterval(date, { start, end }) ||
                   isSameDay(date, start) ||
                   isSameDay(date, end);
                   
    if (!isInDay) return false;
    if (!firstEventOnly) return true;
    
    // For spanning events, only show on the first day
    return isSameDay(date, start);
  });
}

export function getDayViewHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );
}

export function getCalendarWeeksCount(date: Date): number {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  return Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

