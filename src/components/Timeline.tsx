import { useRef, useState, useCallback } from "react";
import type { ZoomBlock } from "../types";

interface TimelineProps {
  duration: number;
  currentTime: number;
  zoomBlocks: ZoomBlock[];
  onZoomBlockChange: (blocks: ZoomBlock[]) => void;
  onBlockSelect: (id: string | null) => void;
  onTimeChange: (time: number) => void;
}

export function Timeline({
  duration,
  currentTime,
  zoomBlocks,
  onZoomBlockChange,
  onBlockSelect,
  onTimeChange,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  const timeToPosition = (time: number) => {
    return (time / duration) * 100;
  };

  const positionToTime = useCallback(
    (position: number) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      return Math.max(
        0,
        Math.min(duration, (position / rect.width) * duration)
      );
    },
    [duration]
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const time = positionToTime(e.clientX - rect.left);
    onTimeChange(time);
  };

  const handleTimelineDrag = useCallback(
    (e: MouseEvent) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const time = positionToTime(e.clientX - rect.left);
      onTimeChange(time);
    },
    [onTimeChange, positionToTime]
  );

  const handleTimelineHover = (e: React.MouseEvent) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverTime(positionToTime(e.clientX - rect.left));
  };

  const handleAddBlock = () => {
    const newBlock: ZoomBlock = {
      id: crypto.randomUUID(),
      startTime: currentTime,
      endTime: Math.min(currentTime + 2, duration),
      x: 0,
      y: 0,
      scale: 1.5,
    };
    onZoomBlockChange([...zoomBlocks, newBlock]);
  };

  const handleDeleteBlock = (id: string) => {
    onZoomBlockChange(zoomBlocks.filter((block) => block.id !== id));
    onBlockSelect(null);
  };

  const handleBlockResize = (
    id: string,
    edge: "start" | "end",
    clientX: number
  ) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const time = positionToTime(clientX - rect.left);
    onZoomBlockChange(
      zoomBlocks.map((block) => {
        if (block.id === id) {
          return {
            ...block,
            [edge === "start" ? "startTime" : "endTime"]: Math.max(
              0,
              Math.min(duration, time)
            ),
          };
        }
        return block;
      })
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-medium">Timeline</h3>
        <button
          onClick={handleAddBlock}
          className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-slate-600"
        >
          Add Zoom Block
        </button>
      </div>

      <div className="relative flex-1 px-4 pb-8">
        <div
          ref={timelineRef}
          className="relative h-full bg-gray-100 rounded border border-gray-200 cursor-pointer"
          onClick={handleTimelineClick}
          onMouseDown={(e) => {
            const handleMouseUp = () => {
              setIsDragging(false);
              window.removeEventListener("mousemove", handleTimelineDrag);
              window.removeEventListener("mouseup", handleMouseUp);
            };
            setIsDragging(true);
            window.addEventListener("mousemove", handleTimelineDrag);
            window.addEventListener("mouseup", handleMouseUp);
            handleTimelineClick(e);
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleTimelineHover}
        >
          {/* Time markers at bottom */}
          <div className="absolute bottom-[-24px] left-0 text-xs text-gray-500">
            {formatTime(0)}
          </div>
          <div className="absolute bottom-[-24px] right-0 text-xs text-gray-500">
            {formatTime(duration)}
          </div>
          {isHovering &&
            !isDragging &&
            Math.abs(timeToPosition(hoverTime) - timeToPosition(0)) > 5 &&
            Math.abs(timeToPosition(hoverTime) - timeToPosition(duration)) >
              5 && (
              <div
                className="absolute bottom-[-24px] text-xs text-gray-500 transform -translate-x-1/2"
                style={{ left: `${timeToPosition(hoverTime)}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${timeToPosition(currentTime)}%` }}
          />

          {/* Zoom blocks */}
          {zoomBlocks.map((block, index) => (
            <div
              key={block.id}
              className="absolute top-2 bottom-2 bg-gray-300 rounded cursor-pointer group"
              style={{
                left: `${timeToPosition(block.startTime)}%`,
                width: `${timeToPosition(block.endTime - block.startTime)}%`,
              }}
              onClick={() => onBlockSelect(block.id)}
            >
              {/* Add block label */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-800">
                Block {String.fromCharCode(65 + index)}
              </span>

              {/* Resize handles */}
              <div
                className="absolute top-0 bottom-0 w-1 left-0 hover:bg-blue-600 cursor-ew-resize"
                onMouseDown={() => {
                  const handleMouseMove = (e: MouseEvent) => {
                    handleBlockResize(block.id, "start", e.clientX);
                  };
                  const handleMouseUp = () => {
                    setIsDragging(false);
                    window.removeEventListener("mousemove", handleMouseMove);
                    window.removeEventListener("mouseup", handleMouseUp);
                  };
                  setIsDragging(true);
                  window.addEventListener("mousemove", handleMouseMove);
                  window.addEventListener("mouseup", handleMouseUp);
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 right-0 hover:bg-blue-600 cursor-ew-resize"
                onMouseDown={() => {
                  const handleMouseMove = (e: MouseEvent) => {
                    handleBlockResize(block.id, "end", e.clientX);
                  };
                  const handleMouseUp = () => {
                    setIsDragging(false);
                    window.removeEventListener("mousemove", handleMouseMove);
                    window.removeEventListener("mouseup", handleMouseUp);
                  };
                  setIsDragging(true);
                  window.addEventListener("mousemove", handleMouseMove);
                  window.addEventListener("mouseup", handleMouseUp);
                }}
              />

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBlock(block.id);
                }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
