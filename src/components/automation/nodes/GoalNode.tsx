"use client";

import { Sparkles } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function GoalNode({ data, selected }: any) {
  return (
    <BaseNode
      label={data.label || "Goal"}
      icon={Sparkles}
      sublabel={data.goal_event_type || "Conversion Point"}
      color="#06b6d4" // Teal
      selected={selected}
      data={data}
    />
  );
}
