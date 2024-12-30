import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { isSameDay, isWithinInterval } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private schedules = new BehaviorSubject<Schedule[]>([]);

  getSchedules(): Observable<Schedule[]> {
    return this.schedules.asObservable();
  }

  addSchedule(schedule: Omit<Schedule, 'id'>): void {
    const newSchedule = {
      ...schedule,
      id: crypto.randomUUID()
    };
    this.schedules.next([...this.schedules.value, newSchedule]);
  }

  updateSchedule(schedule: Schedule): void {
    const updatedSchedules = this.schedules.value.map(s => 
      s.id === schedule.id ? schedule : s
    );
    this.schedules.next(updatedSchedules);
  }

  deleteSchedule(id: string): void {
    const filteredSchedules = this.schedules.value.filter(s => s.id !== id);
    this.schedules.next(filteredSchedules);
  }

  // getSchedulesForDate(date: Date): Schedule[] {
  //   return this.schedules.value.filter(schedule => 
  //     schedule.date.toDateString() === date.toDateString()
  //   );
  // }
  getSchedulesForDate(date: Date): Schedule[] {
    return this.schedules.value.filter(schedule => 
      isWithinInterval(date, { 
        start: new Date(schedule.startDate), 
        end: new Date(schedule.endDate) 
      }) ||
      isSameDay(date, schedule.startDate) ||
      isSameDay(date, schedule.endDate)
    );
  }
}
