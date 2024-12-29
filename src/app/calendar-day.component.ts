import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Schedule } from '../models/schedule.model';
import { CalendarEventComponent } from './calendar-event.component';
import { formatDate } from '../utils/date.utils';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [CommonModule, CalendarEventComponent],
  template: `
    <div 
      [class.text-gray-400]="isOutsideMonth"
      [class.bg-gray-50]="isToday"
      class="border-r border-b p-2 min-h-[100px] hover:bg-gray-50/50 grid grid-rows-[auto_1fr] gap-1"
      (click)="addEvent.emit(date)"
    >
      <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
        <span class="font-medium text-sm">{{ formatDate(date, 'd') }}</span>
        @if (isDesktop && !isOutsideMonth) {
          <button 
            class="opacity-0 hover:opacity-100 text-xs text-blue-600 justify-self-end"
            (click)="$event.stopPropagation(); addEvent.emit(date)"
          >
            ＋
          </button>
        }
      </div>
      <div class="grid gap-1">
        @for (event of events; track event.id) {
          <app-calendar-event
            [event]="event"
            (edit)="editEvent.emit($event)"
            (delete)="deleteEvent.emit($event)"
          />
        }
      </div>
    </div>
  `
})
export class CalendarDayComponent {
  @Input({ required: true }) date!: Date;
  @Input({ required: true }) events: Schedule[] = [];
  @Input() isOutsideMonth = false;
  @Input() isToday = false;
  @Input() isDesktop = true;

  @Output() addEvent = new EventEmitter<Date>();
  @Output() editEvent = new EventEmitter<Schedule>();
  @Output() deleteEvent = new EventEmitter<Schedule>();

  formatDate = formatDate;
}