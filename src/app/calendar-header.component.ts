import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDate } from '../utils/date.utils';
import { CalendarView } from '../models/calendar.model';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-[1fr_auto_auto] gap-4 items-center border-b pb-4 mb-4">
      <h1 class="text-xl font-semibold text-gray-900">
        {{ formatDate(currentDate, viewTitleFormat) }}
      </h1>
      
      <div class="grid grid-flow-col gap-1 bg-gray-100 p-1 rounded-lg">
        @for (v of views; track v) {
          <button
            (click)="viewChange.emit(v)"
            [class.bg-white]="view === v"
            [class.shadow]="view === v"
            class="px-3 py-1.5 text-sm font-medium rounded-md"
          >
            {{ v }}
          </button>
        }
      </div>

      <div class="grid grid-flow-col gap-1">
        <button 
          (click)="previous.emit()"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          ◀
        </button>
        <button
          (click)="today.emit()"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          今日
        </button>
        <button 
          (click)="next.emit()"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          ▶
        </button>
      </div>
    </div>
  `
})
export class CalendarHeaderComponent {
  @Input({ required: true }) currentDate!: Date;
  @Input({ required: true }) view!: CalendarView;
  @Output() viewChange = new EventEmitter<CalendarView>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() today = new EventEmitter<void>();

  views: CalendarView[] = ['Month', 'Week', 'Day'];
  formatDate = formatDate;

  get viewTitleFormat(): string {
    switch (this.view) {
      case 'Month':
        return 'yyyy年MM月';
      case 'Week':
        return 'yyyy年MM月dd日 週';
      case 'Day':
        return 'yyyy年MM月dd日(E)';
    }
  }
}