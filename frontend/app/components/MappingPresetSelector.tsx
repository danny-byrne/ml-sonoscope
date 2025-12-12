"use client";

import { MAPPING_PRESETS, MappingPresetId } from "../constants";

type Props = {
  presetId: MappingPresetId;
  onChange: (preset: MappingPresetId) => void;
};

export default function MappingPresetSelector({ presetId, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      Mapping:
      <select
        value={presetId}
        onChange={(e) => onChange(e.target.value as MappingPresetId)}
        className="border rounded px-2 py-1 text-sm"
      >
        {MAPPING_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
}
