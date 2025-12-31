import { StateCreator } from "zustand";
import { AppStore } from "../types";
import { Event, Task } from "../../components/types";

/**
 * Calendar (캘린더) 슬라이스
 * 캘린더 관련 상태 관리
 */
export interface CalendarState {
  selectedDate: Date;
  currentMonth: Date;
  events: Event[];
  todayTasks: Task[];
}

export interface CalendarActions {
  setSelectedDate: (date: Date) => void;
  setCurrentMonth: (month: Date) => void;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, event: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  setTodayTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  resetCalendar: () => void;
}

export interface CalendarSlice extends CalendarState, CalendarActions {}

export const createCalendarSlice: StateCreator<
  AppStore,
  [],
  [],
  CalendarSlice
> = (set) => ({
  // 초기 상태
  selectedDate: new Date(),
  currentMonth: new Date(),
  events: [],
  todayTasks: [],

  // 액션
  setSelectedDate: (date) => {
    set((state) => ({
      calendar: { ...(state as any).calendar, selectedDate: date }
    } as Partial<AppStore>));
  },

  setCurrentMonth: (month) => {
    set((state) => ({
      calendar: { ...(state as any).calendar, currentMonth: month }
    } as Partial<AppStore>));
  },

  setEvents: (events) => {
    set((state) => ({
      calendar: { ...(state as any).calendar, events }
    } as Partial<AppStore>));
  },

  addEvent: (event) => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        events: [...(state as any).calendar.events, event]
      }
    } as Partial<AppStore>));
  },

  updateEvent: (eventId, updatedEvent) => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        events: (state as any).calendar.events.map((e: Event) =>
          e.id === eventId ? { ...e, ...updatedEvent } : e
        )
      }
    } as Partial<AppStore>));
  },

  deleteEvent: (eventId) => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        events: (state as any).calendar.events.filter((e: Event) => e.id !== eventId)
      }
    } as Partial<AppStore>));
  },

  setTodayTasks: (tasks) => {
    set((state) => ({
      calendar: { ...(state as any).calendar, todayTasks: tasks }
    } as Partial<AppStore>));
  },

  addTask: (task) => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        todayTasks: [...(state as any).calendar.todayTasks, task]
      }
    } as Partial<AppStore>));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        todayTasks: (state as any).calendar.todayTasks.filter((t: Task) => t.id !== taskId)
      }
    } as Partial<AppStore>));
  },

  resetCalendar: () => {
    set((state) => ({
      calendar: {
        ...(state as any).calendar,
        selectedDate: new Date(),
        currentMonth: new Date(),
        events: [],
        todayTasks: []
      }
    } as Partial<AppStore>));
  },
});

