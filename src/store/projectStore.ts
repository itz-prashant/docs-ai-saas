import { create } from "zustand";

type Project = {
  id: string;
  title: string;
  url:string
};

type Store = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
};

export const useProjectStore = create<Store>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
}));