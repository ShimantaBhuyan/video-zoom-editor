export interface ZoomBlock {
  id: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  scale: number;
}

export interface VideoState {
  url: string | null;
  duration: number;
  currentTime: number;
} 