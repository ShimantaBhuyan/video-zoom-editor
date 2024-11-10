import { useEffect, useState } from "react";
import type { ZoomBlock } from "../types";

interface ZoomBlockEditorProps {
  block: ZoomBlock;
  blockIndex: number;
  duration: number;
  onUpdate: (block: ZoomBlock) => void;
  onClose: () => void;
}

export function ZoomBlockEditor({
  block,
  blockIndex,
  duration,
  onUpdate,
  onClose,
}: ZoomBlockEditorProps) {
  const [values, setValues] = useState(block);

  useEffect(() => {
    setValues(block);
  }, [block.id, block]);

  const handleChange = (field: keyof ZoomBlock, value: string) => {
    if ((field === "x" || field === "y") && value === "") {
      setValues({ ...values, [field]: "" });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const updates: Partial<ZoomBlock> = {
      [field]: numValue,
    };

    // Ensure start time is not after end time and vice versa
    if (field === "startTime" && numValue >= values.endTime) {
      updates.endTime = Math.min(numValue + 0.1, duration);
    } else if (field === "endTime" && numValue <= values.startTime) {
      updates.startTime = Math.max(numValue - 0.1, 0);
    }

    const updatedValues = {
      ...values,
      ...updates,
    };
    setValues(updatedValues);
    onUpdate(updatedValues);
  };

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          Edit Block {String.fromCharCode(65 + blockIndex)}
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm text-gray-600">Start Time (s)</span>
            <input
              type="number"
              value={values.startTime.toFixed(1)}
              onChange={(e) => handleChange("startTime", e.target.value)}
              step="0.1"
              min="0"
              max={duration}
              className="w-full px-2 py-1 border rounded"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">End Time (s)</span>
            <input
              type="number"
              value={values.endTime.toFixed(1)}
              onChange={(e) => handleChange("endTime", e.target.value)}
              step="0.1"
              min="0"
              max={duration}
              className="w-full px-2 py-1 border rounded"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm text-gray-600">X Position (%)</span>
            <input
              type="number"
              value={values.x}
              onChange={(e) => handleChange("x", e.target.value)}
              step="1"
              min="0"
              max="100"
              className="w-full px-2 py-1 border rounded"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-gray-600">Y Position (%)</span>
            <input
              type="number"
              value={values.y}
              onChange={(e) => handleChange("y", e.target.value)}
              step="1"
              min="0"
              max="100"
              className="w-full px-2 py-1 border rounded"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm text-gray-600">Scale Factor</span>
          <input
            type="number"
            value={values.scale}
            onChange={(e) => handleChange("scale", e.target.value)}
            step="0.1"
            min="1"
            max="3"
            className="w-full px-2 py-1 border rounded"
          />
        </label>
      </div>
    </div>
  );
}
