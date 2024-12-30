import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleModalComponent } from './schedule-modal.component';
import { CalendarHeaderComponent } from './calendar-header.component';
import { CalendarGridComponent } from './calendar-grid.component';
import { CalendarEventComponent } from './calendar-event.component';
import { Schedule } from '../models/schedule.model';
import { CalendarView } from '../models/calendar.model';
import { 
  formatDate, 
  generateCalendarDays,
  getClickedDateTime 
} from '../utils/date.utils';
import { 
  getWeekDays,
  calculateEventPositions,
  getEventsForDay,
  getDayViewHours
} from '../utils/calendar.utils';
import { 
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  isSameDay,
  isToday
} from 'date-fns';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CalendarHeaderComponent,
    CalendarGridComponent,
    CalendarEventComponent,
    ScheduleModalComponent,
  ],
  template: `
    <div class="h-screen grid grid-rows-[auto_1fr] gap-4 p-4">
      <app-calendar-header
        [currentDate]="currentDate"
        [view]="currentView"
        (viewChange)="changeView($event)"
        (previous)="navigatePrevious()"
        (next)="navigateNext()"
        (today)="goToToday()"
      />

      <div class="overflow-auto">
        @switch (currentView) {
          @case ('Month') {
            <div class="h-full grid">
              <app-calendar-grid
                [dates]="calendarDays"
                [currentDate]="currentDate"
                [weekDays]="weekDays"
                [eventPositions]="eventPositions"
                (addEvent)="openModal($event)"
                (editEvent)="editSchedule($event)"
              />
            </div>
          }
          @case ('Week') {
            <div class="grid grid-cols-[auto_1fr] border-l border-t h-full">
              <!-- Time labels -->
              <div class="border-r border-b bg-gray-50 w-20">
                <div class="h-12 border-b"></div>
                @for (hour of hours; track hour) {
                  <div class="h-14 text-sm text-gray-500 p-2 border-b relative">
                    {{ hour }}
                    <div class="absolute -right-px top-0 w-px h-full bg-gray-200"></div>
                  </div>
                }
              </div>

              <!-- Week grid -->
              <div class="grid grid-cols-7">
                @for (date of calendarDays; track date) {
                  <div class="border-r">
                    <div class="h-12 p-2 text-center border-b bg-gray-50">
                      <div class="text-sm font-medium">
                        {{ formatDate(date, 'E') }}
                      </div>
                      <div 
                        [class.text-blue-600]="isToday(date)"
                        class="text-sm"
                      >
                        {{ formatDate(date, 'd') }}
                      </div>
                    </div>
                    @for (hour of hours; track hour) {
                      <div 
                        class="h-14 border-b border-r relative group"
                        (click)="openModalWithTime($event, date)"
                      >
                        <div class="absolute inset-0 grid">
                          <div class="border-t border-gray-200"></div>
                          <div class="border-t border-gray-200"></div>
                          <div class="border-t border-gray-200"></div>
                          <div class="border-t border-gray-200"></div>
                        </div>
                        @for (event of getEventsForHour(date, hour); track event.id) {
                          <app-calendar-event
                            [event]="event"
                            (edit)="editSchedule($event)"
                          />
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
          @case ('Day') {
            <div class="grid grid-cols-[auto_1fr] border-l border-t h-full">
              <div class="border-r border-b bg-gray-50 w-20">
                @for (hour of hours; track hour) {
                  <div class="h-14 text-sm text-gray-500 p-2 border-b relative">
                    {{ hour }}
                    <div class="absolute -right-px top-0 w-px h-full bg-gray-200"></div>
                  </div>
                }
              </div>

              <div class="border-r">
                @for (hour of hours; track hour) {
                  <div 
                    class="h-14 border-b relative group"
                    (click)="openModalWithTime($event, currentDate)"
                  >
                    <div class="absolute inset-0 grid">
                      <div class="border-t border-gray-200"></div>
                      <div class="border-t border-gray-200"></div>
                      <div class="border-t border-gray-200"></div>
                      <div class="border-t border-gray-200"></div>
                    </div>
                    @for (event of getEventsForHour(currentDate, hour); track event.id) {
                      <app-calendar-event
                        [event]="event"
                        (edit)="editSchedule($event)"
                      />
                    }
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      @if (showModal) {
        <app-schedule-modal
          [selectedDate]="selectedDate!"
          [editingSchedule]="editingSchedule"
          (close)="closeModal()"
          (save)="saveSchedule($event)"
          (delete)="deleteSchedule($event)"
        />
      }
    </div>
  `
})
export class AppComponent implements OnInit {
  private scheduleService = inject(ScheduleService);
  
  currentDate = new Date();
  currentView: CalendarView = 'Month';
  calendarDays: Date[] = [];
  weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  hours = getDayViewHours();
  showModal = false;
  selectedDate: Date | null = null;
  editingSchedule: Schedule | null = null;
  eventPositions = [];

  formatDate = formatDate;
  // isToday = isSameDay;
  isToday = isToday;

  ngOnInit() {
    this.generateDays();
  }

  openModalWithTime(event: MouseEvent, date: Date) {
    const clickedDateTime = getClickedDateTime(event, date);
    this.selectedDate = clickedDateTime;
    this.editingSchedule = null;
    this.showModal = true;
  }

  getEventsForHour(date: Date, hour: string): Schedule[] {
    const [hourStr] = hour.split(':');
    const startTime = new Date(date);
    startTime.setHours(parseInt(hourStr, 10), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    return this.scheduleService.getSchedulesForDate(date)
      .filter(event => {
        const start = new Date(event.startDate);
        return start >= startTime && start < endTime;
      });
  }

  
  generateDays() {
    switch (this.currentView) {
      case 'Month':
        this.calendarDays = generateCalendarDays(this.currentDate);
        break;
      case 'Week':
        this.calendarDays = getWeekDays(this.currentDate);
        break;
      case 'Day':
        this.calendarDays = [this.currentDate];
        break;
    }
  }

  changeView(view: CalendarView) {
    this.currentView = view;
    this.generateDays();
  }

  navigatePrevious() {
    switch (this.currentView) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, -1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, -1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, -1);
        break;
    }
    this.generateDays();
  }

  navigateNext() {
    switch (this.currentView) {
      case 'Month':
        this.currentDate = addMonths(this.currentDate, 1);
        break;
      case 'Week':
        this.currentDate = addWeeks(this.currentDate, 1);
        break;
      case 'Day':
        this.currentDate = addDays(this.currentDate, 1);
        break;
    }
    this.generateDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateDays();
  }

  openModal(date: Date) {
    this.selectedDate = date;
    this.editingSchedule = null;
    this.showModal = true;
  }

  editSchedule(schedule: Schedule) {
    this.selectedDate = new Date(schedule.startDate);
    this.editingSchedule = schedule;
    this.showModal = true;
  }

  deleteSchedule(schedule: Schedule) {
    this.scheduleService.deleteSchedule(schedule.id);
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.selectedDate = null;
    this.editingSchedule = null;
  }

  saveSchedule(schedule: { 
    title: string; 
    description: string;
    startDate: Date;
    endDate: Date;
  }) {
    if (this.editingSchedule) {
      this.scheduleService.updateSchedule({
        ...this.editingSchedule,
        ...schedule
      });
    } else if (this.selectedDate) {
      this.scheduleService.addSchedule(schedule);
    }
    this.closeModal();
  }

  getEventsForDay(date: Date): Schedule[] {
    return this.scheduleService.getSchedulesForDate(date);
  }
}