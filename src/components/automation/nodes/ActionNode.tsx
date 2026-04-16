"use client";

import { Play, Mail, MessageSquare, Tag, UserPlus } from "lucide-react";
import { BaseNode } from "./BaseNode";

const iconMap: Record<string, any> = {
  email: Mail,
  sms: MessageSquare,
  tag: Tag,
  crm: UserPlus,
  default: Play,
};

export function ActionNode({ data, selected }: any) {
  const Icon = iconMap[data.actionType] || iconMap.default;
  
  return (
    <BaseNode
      label={data.label || "Action"}
      icon={Icon}
      sublabel={data.actionType || "System Task"}
      color="#6c47ff" // Leadsmind Purple
      selected={selected}
      data={data}
    />
  );
}
