import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatDate } from '../utils/date.utils';
import { Schedule } from '../models/schedule.model';

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
      <div class="fixed inset-0 bg-black bg-opacity-50 grid place-items-center" (click)="onBackdropClick($event)">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md grid gap-4">
        <div class="grid grid-cols-[1fr_auto] items-center">
          <h2 class="text-xl font-medium text-gray-900">
            {{ formatDate(selectedDate, 'yyyy年MM月dd日(E)') }}
          </h2>
          @if (editingSchedule) {
            <button
              type="button"
              (click)="onDelete()"
              class="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          }
        </div>
        <form (submit)="onSubmit($event)" class="grid gap-4">
          <div class="grid gap-1">
            <label class="text-sm font-medium text-gray-700">タイトル</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-1">
              <label class="text-sm font-medium text-gray-700">開始日時</label>
              <input
                type="datetime-local"
                [(ngModel)]="startDate"
                name="startDate"
                class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div class="grid gap-1">
              <label class="text-sm font-medium text-gray-700">終了日時</label>
              <input
                type="datetime-local"
                [(ngModel)]="endDate"
                name="endDate"
                class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div class="grid gap-1">
            <label class="text-sm font-medium text-gray-700">詳細</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {{ editingSchedule ? '更新' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ScheduleModalComponent {
  @Input({ required: true }) selectedDate!: Date;
  @Input() editingSchedule: Schedule | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ 
    title: string; 
    description: string;
    startDate: Date;
    endDate: Date;
  }>();
  @Output() delete = new EventEmitter<Schedule>();

  title = '';
  description = '';
  startDate = '';
  endDate = '';
  formatDate = formatDate;

  ngOnInit() {
    const defaultTime = new Date(this.selectedDate);
    
    if (this.editingSchedule) {
      this.title = this.editingSchedule.title;
      this.description = this.editingSchedule.description;
      this.startDate = this.formatDateTimeLocal(this.editingSchedule.startDate);
      this.endDate = this.formatDateTimeLocal(this.editingSchedule.endDate);
    } else {
      this.startDate = this.formatDateTimeLocal(defaultTime);
      defaultTime.setHours(defaultTime.getHours() + 1);
      this.endDate = this.formatDateTimeLocal(defaultTime);
    }
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.save.emit({
      title: this.title,
      description: this.description,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate)
    });
    this.title = '';
    this.description = '';
  }

  onDelete() {
    if (this.editingSchedule) {
      this.delete.emit();
      this.close.emit();
    }
  }
}