import { useRef, useEffect, useState } from "react";
import type { ZoomBlock } from "../types";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
  zoomBlocks: ZoomBlock[];
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

export function VideoPlayer({
  src,
  currentTime,
  zoomBlocks,
  onTimeUpdate,
  onDurationChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  //   const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (
      videoRef.current &&
      Math.abs(videoRef.current.currentTime - currentTime) > 0.5
    ) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const getCurrentZoomBlock = (time: number) => {
    return zoomBlocks.find(
      (block) => time >= block.startTime && time <= block.endTime
    );
  };

  const applyZoomEffect = (time: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const activeZoom = getCurrentZoomBlock(time);

    // if (activeZoom) {
    //   const { x, y, scale } = activeZoom;
    //   videoElement.style.transform = `scale(${scale})`;
    //   videoElement.style.transformOrigin = `${x}% ${y}%`;
    // } else {
    //   videoElement.style.transform = "none";
    //   videoElement.style.transformOrigin = "center";
    // }

    if (activeZoom) {
      const { x, y, scale } = activeZoom;
      // Adding transition property for smooth zoom
      videoElement.style.transition = "transform 0.8s ease";
      videoElement.style.transform = `scale(${scale})`;
      videoElement.style.transformOrigin = `${x}% ${y}%`;
    } else {
      videoElement.style.transition = "transform 0.8s ease";
      videoElement.style.transform = "none";
      videoElement.style.transformOrigin = "center";
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="relative aspect-[2/1] bg-black overflow-hidden h-720px max-h-[720px] rounded-t-lg"
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* <div
        // ref={wrapperRef}
        className="w-full h-full transition-transform duration-300"
      > */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-[720px] object-contain transition-transform duration-300 aspect-[2/1]"
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime;
          onTimeUpdate(time);
          applyZoomEffect(time);
        }}
        onDurationChange={(e) => {
          onDurationChange(e.currentTarget.duration);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlayPause}
      />
      {/* </div> */}

      {/* Play/Pause overlay */}
      {isHovering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 cursor-pointer"
          onClick={togglePlayPause}
        >
          <div className="p-4 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75">
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
