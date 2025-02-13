// TaskManager.tsx
"use client";
import React from "react";
import { useTaskStore } from "@/AxiosApi/TaskStore";
import {
  GenerateTaskStatus,
  ControlNetTaskStatus,
  RenderSketchTaskStatus,
  RecolorTaskStatus,
  InteriorTaskStatus,
  LogoTaskStatus,
  BackgroundTaskStatus,
  ChangeHumanTaskStatus,
  UpscaleTaskStatus,
} from "./TaskStatusUpdaters";

export const TaskManager = () => {
  const { tasks } = useTaskStore();

  return (
    <>
      {tasks.map((task) => {
        switch (task.type) {
          case "generate":
            return <GenerateTaskStatus key={task.id} taskId={task.id} />;
          case "controlnet":
            return <ControlNetTaskStatus key={task.id} taskId={task.id} />;
          case "renderSketch":
            return <RenderSketchTaskStatus key={task.id} taskId={task.id} />;
          case "recolor":
            return <RecolorTaskStatus key={task.id} taskId={task.id} />;
          case "interior":
            return <InteriorTaskStatus key={task.id} taskId={task.id} />;
          case "logo":
            return <LogoTaskStatus key={task.id} taskId={task.id} />;
          case "background":
            return <BackgroundTaskStatus key={task.id} taskId={task.id} />;
          case "changeHuman":
            return <ChangeHumanTaskStatus key={task.id} taskId={task.id} />;
          case "upscale":
            return <UpscaleTaskStatus key={task.id} taskId={task.id} />;
          default:
            console.warn(`Unknown task type: ${task.type}`);
            return null;
        }
      })}
    </>
  );
};
