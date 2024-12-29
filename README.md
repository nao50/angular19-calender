# Angular19Calender

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



12/29 22:41
```ts
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
  generateCalendarDays 
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
    <div class="container mx-auto p-4">
      <app-calendar-header
        [currentDate]="currentDate"
        [view]="currentView"
        (viewChange)="changeView($event)"
        (previous)="navigatePrevious()"
        (next)="navigateNext()"
        (today)="goToToday()"
      />

      @switch (currentView) {
        @case ('Month') {
          <app-calendar-grid
            [dates]="calendarDays"
            [currentDate]="currentDate"
            [weekDays]="weekDays"
            [eventPositions]="eventPositions"
            (addEvent)="openModal($event)"
            (editEvent)="editSchedule($event)"
          />
        }
        @case ('Week') {
          <div class="grid grid-cols-[auto_1fr] border-l border-t">
            <!-- Time labels -->
            <div class="border-r border-b bg-gray-50 w-20">
              <div class="h-12 border-b"></div>
              @for (hour of hours; track hour) {
                <div class="h-12 text-sm text-gray-500 p-2 border-b">
                  {{ hour }}
                </div>
              }
            </div>

            <!-- Week grid -->
            <div class="grid grid-cols-7">
              <!-- @for (date of weekDays; track date) { -->
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
                  <div 
                    class="min-h-[3rem] border-b relative"
                    (click)="openModal(date)"
                  >
                    @for (event of getEventsForDay(date); track event.id) {
                      <app-calendar-event
                        [event]="event"
                        (edit)="editSchedule($event)"
                      />
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
        @case ('Day') {
          <div class="grid grid-cols-[auto_1fr] border-l border-t">
            <div class="border-r border-b bg-gray-50 w-20">
              @for (hour of hours; track hour) {
                <div class="h-12 text-sm text-gray-500 p-2 border-b">
                  {{ hour }}
                </div>
              }
            </div>

            <div class="border-r">
              @for (hour of hours; track hour) {
                <div 
                  class="h-12 border-b relative"
                  (click)="openModal(currentDate)"
                >
                  @for (event of getEventsForHour(hour); track event.id) {
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

  getEventsForHour(hour: string): Schedule[] {
    const [hourStr] = hour.split(':');
    const startTime = new Date(this.currentDate);
    startTime.setHours(parseInt(hourStr, 10), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    return this.scheduleService.getSchedulesForDate(this.currentDate)
      .filter(event => {
        const start = new Date(event.startDate);
        return start >= startTime && start < endTime;
      });
  }
}

// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { isSameMonth, isToday } from 'date-fns';
// import { ScheduleService } from '../services/schedule.service';
// import { ScheduleModalComponent } from './schedule-modal.component';
// import { CalendarDayComponent } from './calendar-day.component';
// import { formatDate, generateCalendarDays } from '../utils/date.utils';
// import { Schedule } from '../models/schedule.model';

// @Component({
//   selector: 'app-root',
//   imports: [CommonModule, ScheduleModalComponent, CalendarDayComponent],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent implements OnInit {
//   private scheduleService = inject(ScheduleService);
  
//   currentDate = new Date();
//   calendarDays: Date[] = [];
//   weekDays = ['日', '月', '火', '水', '木', '金', '土'];
//   showModal = false;
//   selectedDate: Date | null = null;
//   editingSchedule: Schedule | null = null;

//   formatDate = formatDate;
//   isSameMonth = isSameMonth;
//   isToday = isToday;

//   ngOnInit() {
//     this.generateCalendarDays();
//   }

//   generateCalendarDays() {
//     this.calendarDays = generateCalendarDays(this.currentDate);
//   }

//   previousMonth() {
//     this.currentDate = new Date(
//       this.currentDate.getFullYear(),
//       this.currentDate.getMonth() - 1
//     );
//     this.generateCalendarDays();
//   }

//   nextMonth() {
//     this.currentDate = new Date(
//       this.currentDate.getFullYear(),
//       this.currentDate.getMonth() + 1
//     );
//     this.generateCalendarDays();
//   }

//   openModal(date: Date) {
//     this.selectedDate = date;
//     this.showModal = true;
//   }

//   editSchedule(schedule: Schedule) {
//     this.editingSchedule = schedule;
//   }

//   deleteSchedule(schedule: Schedule) {
//     this.scheduleService.deleteSchedule(schedule.id);
//   }

//   closeModal() {
//     this.showModal = false;
//     this.selectedDate = null;
//     this.editingSchedule = null;
//   }

//   saveSchedule(schedule: { title: string; description: string, startDate: Date, endDate: Date }) {
//     if (this.selectedDate) {
//       if (this.editingSchedule) {
//         this.scheduleService.updateSchedule({
//           ...this.editingSchedule,
//           ...schedule
//         });
//       } else {
//         this.scheduleService.addSchedule({
//           ...schedule
//         });
//       }
//     }
//     this.closeModal();
//   }

//   getEventsForDate(date: Date): Schedule[] {
//     return this.scheduleService.getSchedulesForDate(date);
//   }
// }
```