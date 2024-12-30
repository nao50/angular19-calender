import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Schedule } from '../models/schedule.model';
import { CalendarEventComponent } from './calendar-event.component';
import { CalendarEventPosition } from '../models/calendar.model';
import { isSameMonth, isToday } from 'date-fns';
import { formatDate } from '../utils/date.utils';
import { getCalendarWeeksCount } from '../utils/calendar.utils';

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule, CalendarEventComponent],
  template: `
    <div class="h-full grid grid-rows-[auto_1fr]">
      <div class="grid grid-cols-7">
        @for (day of weekDays; track day) {
          <div class="text-sm font-medium text-gray-500 p-2 text-center border-b bg-gray-50">
            {{ day }}
          </div>
        }
      </div>
      
      <!-- <div class="grid grid-cols-7 grid-rows-6 auto-rows-fr"> -->
      <div [class]="gridRowsClass">
        @for (date of dates; track date) {
          <div 
            [class.bg-gray-50]="!isSameMonth(date, currentDate)"
            [class.text-gray-400]="!isSameMonth(date, currentDate)"
            [class.bg-blue-50]="isToday(date)"
            class="border-b border-r p-1 relative"
            (click)="$event.target === $event.currentTarget && addEvent.emit(date)"
          >
            <div class="text-sm font-medium mb-1">{{ formatDate(date, 'd') }}</div>
            
            <div class="grid gap-1">
              @for (pos of getPositionsForDay(date); track pos.event.id) {
                <div
                  [style.gridColumn]="pos.column + 1 + ' / span ' + pos.columnSpan"
                  [style.gridRow]="pos.row + 1 + ' / span ' + pos.rowSpan"
                >
                  <app-calendar-event
                    [event]="pos.event"
                    (edit)="editEvent.emit($event)"
                  />
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
    <!-- <div class="grid grid-cols-7 border-l border-t">
      @for (day of weekDays; track day) {
        <div class="text-sm font-medium text-gray-500 p-2 text-center border-r border-b bg-gray-50">
          {{ day }}
        </div>
      }
      
      @for (date of dates; track date) {
        <div 
          [class.bg-gray-50]="!isSameMonth(date, currentDate)"
          [class.text-gray-400]="!isSameMonth(date, currentDate)"
          [class.bg-blue-50]="isToday(date)"
          class="border-r border-b min-h-[8rem] p-2 relative"
          (click)="$event.target === $event.currentTarget && addEvent.emit(date)"
        >
          <div class="text-sm font-medium mb-1">{{ formatDate(date, 'd') }}</div>
          
          <div class="grid gap-1">
            @for (pos of getPositionsForDay(date); track pos.event.id) {
              <div
                [style.gridColumn]="pos.column + 1 + ' / span ' + pos.columnSpan"
                [style.gridRow]="pos.row + 1 + ' / span ' + pos.rowSpan"
              >
                <app-calendar-event
                  [event]="pos.event"
                  (edit)="editEvent.emit($event)"
                />
              </div>
            }
          </div>
        </div>
      }
    </div> -->
  `
})
export class CalendarGridComponent {
  @Input({ required: true }) dates: Date[] = [];
  @Input({ required: true }) currentDate!: Date;
  @Input({ required: true }) weekDays: string[] = [];
  @Input({ required: true }) eventPositions: CalendarEventPosition[] = [];
  @Output() addEvent = new EventEmitter<Date>();
  @Output() editEvent = new EventEmitter<Schedule>();

  formatDate = formatDate;
  isSameMonth = isSameMonth;
  isToday = isToday;

  get gridRowsClass(): string {
    const weeksCount = getCalendarWeeksCount(this.currentDate);
    return `grid grid-cols-7 grid-rows-${weeksCount - 1}`;
  }

  getPositionsForDay(date: Date): CalendarEventPosition[] {
    return this.eventPositions.filter(pos => 
      pos.row === this.dates.findIndex(d => 
        d.getTime() === date.getTime()
      )
    );
  }
}