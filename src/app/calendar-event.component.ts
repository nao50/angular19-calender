import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Schedule } from '../models/schedule.model';
import { formatDate } from '../utils/date.utils';

@Component({
  selector: 'app-calendar-event',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div
      class="group relative bg-blue-50 border-l-4 border-blue-500 px-2 py-1 rounded-r text-sm hover:bg-blue-100"
      (click)="edit.emit(event)"
    >
      <div class="grid gap-0.5">
        <div class="grid grid-cols-[auto_1fr] gap-1 items-center">
          <span class="text-xs text-gray-600">
            {{ formatDate(event.startDate, 'HH:mm') }}
          </span>
          <span class="truncate font-medium">{{ event.title }}</span>
        </div>
        @if (isMultiDay) {
          <span class="text-xs text-gray-500">
            {{ formatDate(event.endDate, 'M/d HH:mm') }}まで
          </span>
        }
      </div>
    </div>
  `
})
export class CalendarEventComponent {
  @Input({ required: true }) event!: Schedule;
  @Input() isFirstDay = true;
  @Output() edit = new EventEmitter<Schedule>();
  @Output() delete = new EventEmitter<Schedule>();

  formatDate = formatDate;

  get isMultiDay(): boolean {
    return !this.isSameDay(this.event.startDate, this.event.endDate);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}