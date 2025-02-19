import { create } from 'zustand';

type TaskType = 'controlnet' | 'face' | 'style' | 'logo' | 'interior' | 'sketch' | 'recolor';

interface GenerativeTask {
  id: string;
  type: TaskType;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  download_urls?: string[];
  image_url?: string;
  error?: string;
}

interface GenerativeTaskStore {
  tasks: Record<string, GenerativeTask>;
  addTask: (taskId: string, type: TaskType) => void;
  updateTask: (taskId: string, update: Partial<GenerativeTask>) => void;
  removeTask: (taskId: string) => void;
}

export const useGenerativeTaskStore = create<GenerativeTaskStore>((set) => ({
  tasks: {},
  addTask: (taskId, type) => set((state) => ({
    tasks: {
      ...state.tasks,
      [taskId]: { id: taskId, type, status: 'PENDING' }
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
