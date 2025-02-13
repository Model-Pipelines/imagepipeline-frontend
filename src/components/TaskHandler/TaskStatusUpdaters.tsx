// TaskStatusUpdaters.tsx
import React from "react";
import {
  useGenerateImageStatus,
  useControlNetStatus,
  useRenderSketchStatus,
  useRecolorImageStatus,
  useInteriorDesignStatus,
  useGenerateLogoStatus,
  useBackgroundTaskStatus,
  useChangeHumanStatus,
  useUpscaleImageStatus,
} from "@/AxiosApi/GetTanstack";

interface TaskStatusProps {
  taskId: string;
}

export const GenerateTaskStatus = ({ taskId }: TaskStatusProps) => {
  // This hook subscribes to the status for a "generate" task.
  useGenerateImageStatus(taskId);
  return null;
};

export const ControlNetTaskStatus = ({ taskId }: TaskStatusProps) => {
  useControlNetStatus(taskId);
  return null;
};

export const RenderSketchTaskStatus = ({ taskId }: TaskStatusProps) => {
  useRenderSketchStatus(taskId);
  return null;
};

export const RecolorTaskStatus = ({ taskId }: TaskStatusProps) => {
  useRecolorImageStatus(taskId);
  return null;
};

export const InteriorTaskStatus = ({ taskId }: TaskStatusProps) => {
  useInteriorDesignStatus(taskId);
  return null;
};

export const LogoTaskStatus = ({ taskId }: TaskStatusProps) => {
  useGenerateLogoStatus(taskId);
  return null;
};

export const BackgroundTaskStatus = ({ taskId }: TaskStatusProps) => {
  useBackgroundTaskStatus(taskId);
  return null;
};

export const ChangeHumanTaskStatus = ({ taskId }: TaskStatusProps) => {
  useChangeHumanStatus(taskId);
  return null;
};

export const UpscaleTaskStatus = ({ taskId }: TaskStatusProps) => {
  useUpscaleImageStatus(taskId);
  return null;
};
