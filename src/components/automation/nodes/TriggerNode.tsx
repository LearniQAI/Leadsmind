"use client";

import { Zap } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function TriggerNode({ data, selected }: any) {
  return (
    <BaseNode
      label={data.label || "Trigger"}
      icon={Zap}
      sublabel={data.type || "Event"}
      color="#10b981" // Emerald Green
      selected={selected}
      data={data}
    />
  );
}
