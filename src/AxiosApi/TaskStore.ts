import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type TaskType =
  | "generate"
  | "controlnet"
  | "renderSketch"
  | "recolor"
  | "interior"
  | "logo"
  | "background"
  | "changeHuman"
  | "upscale";

interface Task {
  id: string;
  type: TaskType;
  createdAt: number; // Timestamp in milliseconds
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "createdAt">) => void;
  removeTask: (id: string) => void;
  cleanupOldTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set) => ({
        tasks: [],
        addTask: (task) =>
          set((state) => ({
            tasks: [...state.tasks, { ...task, createdAt: Date.now() }],
          })),
        removeTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          })),
        cleanupOldTasks: () =>
          set((state) => {
            const MAX_AGE = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
            return {
              tasks: state.tasks.filter((t) => Date.now() - t.createdAt < MAX_AGE),
            };
          }),
      }),
      {
        name: "task-store",
        partialize: (state) => ({ tasks: state.tasks }),
      }
    )
  )
);
