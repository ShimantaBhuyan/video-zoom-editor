import { useState } from "react";
import type { ZoomBlock, VideoState } from "./types";
import { VideoPlayer } from "./components/VideoPlayer";
import { Timeline } from "./components/Timeline";
import { ZoomBlockEditor } from "./components/ZoomBlockEditor";

function App() {
  const [video, setVideo] = useState<VideoState>({
    url: null,
    duration: 0,
    currentTime: 0,
  });
  const [zoomBlocks, setZoomBlocks] = useState<ZoomBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleTimeUpdate = (time: number) => {
    setVideo((prev) => ({ ...prev, currentTime: time }));
  };

  const handleDurationChange = (duration: number) => {
    setVideo((prev) => ({ ...prev, duration }));
  };

  const handleZoomBlockChange = (newBlocks: ZoomBlock[]) => {
    setZoomBlocks(newBlocks);
  };

  const handleZoomBlockUpdate = (updatedBlock: ZoomBlock) => {
    setZoomBlocks((blocks) =>
      blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };

  const handleTimeChange = (time: number) => {
    setVideo((prev) => ({ ...prev, currentTime: time }));
  };

  const handleEditorClose = () => {
    setSelectedBlock(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800">Video Zoom Editor</h1>
      </header>

      <main className="flex-1 flex h-full">
        {/* Left panel - Video and Timeline */}
        <div className="flex-1 flex flex-col h-full p-10">
          <div className="flex-1 h-full flex">
            {!video.url ? (
              <div className="h-full w-full flex gap-5 items-center justify-center bg-white rounded-t-lg shadow">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setVideo((prev) => ({ ...prev, url }));
                    }
                  }}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="px-4 py-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-slate-600"
                >
                  Upload Video
                </label>
                <button
                  onClick={() =>
                    setVideo((prev) => ({
                      ...prev,
                      url: "/NotionButtonCreation.mp4",
                    }))
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-slate-600"
                >
                  Use Example Video
                </button>
              </div>
            ) : (
              <div className="h-min bg-white rounded-t-lg shadow">
                <VideoPlayer
                  src={video.url}
                  currentTime={video.currentTime}
                  zoomBlocks={zoomBlocks}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={handleDurationChange}
                />
              </div>
            )}

            {selectedBlock && (
              <div className="bg-white border-l rounded-lg">
                <ZoomBlockEditor
                  block={
                    zoomBlocks.find((block) => block.id === selectedBlock)!
                  }
                  blockIndex={zoomBlocks.findIndex(
                    (block) => block.id === selectedBlock
                  )}
                  duration={video.duration}
                  onUpdate={handleZoomBlockUpdate}
                  onClose={handleEditorClose}
                />
              </div>
            )}
          </div>

          {/* Timeline fixed at bottom */}
          {video.url && (
            <div className="h-32 bg-white border-t rounded-lg">
              <Timeline
                duration={video.duration}
                currentTime={video.currentTime}
                zoomBlocks={zoomBlocks}
                onZoomBlockChange={handleZoomBlockChange}
                onBlockSelect={setSelectedBlock}
                onTimeChange={handleTimeChange}
              />
            </div>
          )}
        </div>

        {/* Right panel - Editor */}
        {/* {selectedBlock && (
          <div className="w-80 bg-white border-l">
            <ZoomBlockEditor
              block={zoomBlocks.find((block) => block.id === selectedBlock)!}
              duration={video.duration}
              onUpdate={handleZoomBlockUpdate}
              onClose={handleEditorClose}
            />
          </div>
        )} */}
      </main>
    </div>
  );
}

export default App;
