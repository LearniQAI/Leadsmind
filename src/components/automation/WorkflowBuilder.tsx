"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TriggerNode } from "./nodes/TriggerNode";
import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { DelayNode } from "./nodes/DelayNode";
import { NodesPanel } from "./NodesPanel";
import { ExecutionLogs } from "./ExecutionLogs";
import { NodeSettings } from "./NodeSettings";
import { WorkflowGuide } from "./WorkflowGuide";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save, Play, BarChart2, Shield, Plus, Loader2, History, Zap, HelpCircle } from "lucide-react";
import { updateWorkflow } from "@/app/actions/automation";
import { toast } from "sonner";

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

interface WorkflowBuilderProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialStatus?: string;
}

export function WorkflowBuilder({ 
  workflowId, 
  initialNodes = [], 
  initialEdges = [],
  initialStatus = 'draft'
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [status, setStatus] = useState(initialStatus);
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedNode = nodes.find((n: Node) => n.id === selectedNodeId);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === nodeId) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Auto-save logic
  useEffect(() => {
    if (!workflowId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await updateWorkflow(workflowId, { nodes, edges });
      } catch (error) {
        console.error("Failed to auto-save:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, workflowId]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: 'smoothstep',
            interactionWidth: 20,
            style: { 
              stroke: "#6c47ff", 
              strokeWidth: 3,
              opacity: 0.6
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6c47ff",
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onAddNode = useCallback((type: string, item: any) => {
    const { icon, ...serializableData } = item;
    
    // Find the current bottom-most node to append below it
    const lastNode = nodes.length > 0 
      ? nodes.reduce((prev, curr) => (prev.position.y > curr.position.y ? prev : curr))
      : null;

    const newNodeId = `${type}-${Date.now()}`;
    const position = lastNode 
      ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
      : { x: 250, y: 50 };

    const newNode: Node = {
      id: newNodeId,
      type,
      position,
      data: { 
        ...serializableData,
        analytics: isAnalyticsMode ? { count: 0, status: 'idle' } : undefined
      },
    };

    setNodes((nds) => nds.concat(newNode));

    // Automatically connect to the last node if it exists
    if (lastNode) {
      setEdges((eds) => addEdge({
        id: `e-${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
        type: 'smoothstep',
        animated: true,
      }, eds));
    }

    if (type === 'trigger' && workflowId && item.triggerType) {
       updateWorkflow(workflowId, { trigger_type: item.triggerType });
    }

    setShowPanel(false);
    toast.success(`${item.label} added to workflow`);
  }, [setNodes, setEdges, isAnalyticsMode, nodes, workflowId]);

  const handleManualSave = async () => {
    if (!workflowId) return;
    try {
      setIsSaving(true);
      await updateWorkflow(workflowId, { nodes, edges });
      toast.success("Workflow saved successfully");
    } catch (error) {
      toast.error("Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full w-full relative bg-[#050510]">
      {/* Overlay Header */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Button 
            className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white gap-2 shadow-lg shadow-[#6c47ff]/20 rounded-2xl h-11 px-6 transition-all"
            onClick={() => setShowPanel(!showPanel)}
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Add Action</span>
          </Button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />

          <Button 
            variant="secondary" 
            className="bg-[#1a1a24] border-white/5 text-white gap-2 hover:bg-white/10 rounded-2xl"
            onClick={() => setIsAnalyticsMode(!isAnalyticsMode)}
          >
            <BarChart2 className={isAnalyticsMode ? "text-emerald-400" : "text-white/40"} size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isAnalyticsMode ? "Live Data" : "Insights"}
            </span>
          </Button>

          <Button 
            variant="secondary" 
            className="bg-[#1a1a24] border-white/5 text-white gap-2 hover:bg-white/10 rounded-2xl"
            onClick={() => setShowLogs(!showLogs)}
          >
            <History className={showLogs ? "text-blue-400" : "text-white/40"} size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {showLogs ? "Active Runs" : "History"}
            </span>
          </Button>

          <Button 
            className="bg-amber-500/10 border border-amber-500/20 text-amber-500 gap-2 hover:bg-amber-500/20 rounded-2xl animate-pulse"
            onClick={() => setShowGuide(true)}
          >
            <HelpCircle size={16} />
            <span className="text-xs font-black uppercase tracking-wider">
              How-To Guide
            </span>
          </Button>

          {isSaving && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Loader2 className="animate-spin text-white/40" size={12} />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Saving...</span>
            </div>
          )}
        </div>

          <Button 
            className={cn(
              "h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[9px] pointer-events-auto transition-all transition-all duration-300",
              status === 'active' 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
            )}
            onClick={async () => {
              const newStatus = status === 'active' ? 'draft' : 'active';
              if (workflowId) {
                await updateWorkflow(workflowId, { status: newStatus });
                setStatus(newStatus);
                toast.success(`Workflow is now ${newStatus}`);
              }
            }}
          >
            <Zap size={14} className={cn("mr-2", status === 'active' ? "fill-emerald-400 animate-pulse" : "")} />
            {status === 'active' ? 'LIVE' : 'PUBLISH'}
          </Button>

          <div className="h-4 w-px bg-white/10 mx-1" />

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mr-4">
            <Shield className="text-blue-400" size={14} />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Automation Secure</span>
          </div>
          
          <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 gap-2 h-10 px-4 rounded-2xl">
            <Play size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Simulate</span>
          </Button>
          
          <Button 
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 h-10 px-4 rounded-2xl"
            onClick={handleManualSave}
          >
            <Save size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Push Changes</span>
          </Button>
        </div>
      </div>

      {showPanel && <NodesPanel onAddNode={onAddNode} />}
      {showLogs && workflowId && <ExecutionLogs workflowId={workflowId} />}
      {showGuide && <WorkflowGuide onClose={() => setShowGuide(false)} />}
      {selectedNode && (
        <NodeSettings 
          node={selectedNode} 
          onUpdate={(newData) => updateNodeData(selectedNode.id, newData)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      <div className="h-full w-full relative overflow-hidden">
        {/* Subtle Depth Layers */}
        <div className="absolute inset-0 bg-[#020205]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,71,255,0.05),transparent_70%)]" />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.5 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: "#6c47ff", 
              strokeWidth: 3,
              opacity: 0.4
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6c47ff",
              width: 20,
              height: 20
            },
          }}
        >
          <Background 
            variant={BackgroundVariant.Lines} 
            className="opacity-[0.02]"
            color="#ffffff"
            gap={60}
          />
          <Controls className="!bg-[#0a0a1a]/80 !backdrop-blur-xl !border-white/10 !fill-white !shadow-2xl !rounded-2xl !overflow-hidden !m-6 !border" />
        </ReactFlow>

        {/* Empty State / Welcome */}
        {nodes.length <= 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="text-center space-y-4">
              <Zap className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Start Building</h2>
              <p className="text-sm text-white/40 font-medium">Add your first action step below the trigger</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
