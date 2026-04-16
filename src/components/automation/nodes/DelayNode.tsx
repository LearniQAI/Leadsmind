"use client";

import { Clock } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function DelayNode({ data, selected }: any) {
  return (
    <BaseNode
      label={data.label || "Wait"}
      icon={Clock}
      sublabel={data.durationValue ? `${data.durationValue} ${data.durationUnit || 'hours'}` : (data.duration || "Wait Step")}
      color="#0ea5e9" // Sky Blue
      selected={selected}
      data={data}
    />
  );
}
