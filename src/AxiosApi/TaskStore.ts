import { create } from 'zustand';

type TaskType = 'background' | 'human' | 'upscale';

interface BackgroundTask {
  id: string;
  type: TaskType;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  download_urls?: string[];
  image_url?: string;
  init_image_id?: string;
  error?: string;
}

interface BackgroundTaskStore {
  tasks: Record<string, BackgroundTask>;
  addTask: (taskId: string, initImageId: string, type: TaskType) => void;
  updateTask: (taskId: string, update: Partial<BackgroundTask>) => void;
  removeTask: (taskId: string) => void;
}

export const useBackgroundTaskStore = create<BackgroundTaskStore>((set) => ({
  tasks: {},
  addTask: (taskId, initImageId, type) => set((state) => ({
    tasks: {
      ...state.tasks,
      [taskId]: {
        id: taskId,
        type,
        status: 'PENDING',
        init_image_id: initImageId
      }
    }
  })),
  updateTask: (taskId, update) => set((state) => ({
    tasks: {
      ...state.tasks,
      [taskId]: { ...state.tasks[taskId], ...update }
    }
  })),
  removeTask: (taskId) => set((state) => {
    const newTasks = { ...state.tasks };
    delete newTasks[taskId];
    return { tasks: newTasks };
  }),
}));
