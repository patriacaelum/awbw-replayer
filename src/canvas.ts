import { error } from "@tauri-apps/plugin-log";

export function requireContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if (!context) {
    error("Failed to get 2d canvas context");
    throw new Error("Failed to get 2d canvas context");
  }

  return context;
}
