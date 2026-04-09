'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, User, DollarSign } from 'lucide-react';
import { updateDealStage } from '@/app/actions/pipelines';
import { PipelineStage, Opportunity } from '@/types/crm.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DealModal } from './DealModal';

interface KanbanBoardProps {
  stages: PipelineStage[];
  opportunities: Opportunity[];
}

export function KanbanBoard({ stages, opportunities: initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    stageId?: string;
    deal?: Opportunity;
  }>({ isOpen: false });

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI
    const updatedDeals = [...deals];
    const dealIndex = updatedDeals.findIndex(d => d.id === draggableId);
    if (dealIndex === -1) return;

    const [removed] = updatedDeals.splice(dealIndex, 1);
    removed.stage_id = destination.droppableId;
    removed.position = destination.index;
    updatedDeals.splice(destination.index, 0, removed);
    
    setDeals(updatedDeals);

    try {
      const res = await updateDealStage(draggableId, destination.droppableId, destination.index);
      if (!res.success) {
        toast.error(res.error || 'Failed to move deal');
        setDeals(initialDeals); // Revert
      }
    } catch {
      toast.error('Network error moving deal');
      setDeals(initialDeals);
    }
  };

  const opportunitiesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((d) => d.stage_id === stage.id).sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  const openNewDeal = (stageId: string) => {
    setModalState({ isOpen: true, stageId });
  };

  const openEditDeal = (deal: Opportunity) => {
    setModalState({ isOpen: true, deal });
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide min-h-[calc(100vh-250px)]">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[320px] shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{stage.name}</h3>
                  <Badge variant="secondary" className="bg-white/5 text-white/40 border-none px-2 py-0 h-5 text-[10px]">
                    {opportunitiesByStage[stage.id]?.length || 0}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white/20 hover:text-white rounded-lg"
                  onClick={() => openNewDeal(stage.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 flex flex-col gap-3 p-2 rounded-2xl transition-colors min-h-[150px]",
                      snapshot.isDraggingOver ? "bg-white/3" : "bg-transparent"
                    )}
                  >
                    {opportunitiesByStage[stage.id]?.map((opp, index) => (
                      <Draggable key={opp.id} draggableId={opp.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "bg-[#0b0b10] border border-white/5 rounded-2xl p-4 shadow-sm transition-all hover:border-[#6c47ff]/30 group",
                              snapshot.isDragging && "shadow-2xl border-[#6c47ff]/50 bg-[#16161e] scale-105"
                            )}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between">
                                <span className="text-sm font-bold text-white leading-tight group-hover:text-[#6c47ff] transition-colors">{opp.title}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 p-0 text-white/10 hover:text-white rounded-md"
                                  onClick={() => openEditDeal(opp)}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-1.5 text-[#fdab3d]">
                                   <DollarSign className="h-3 w-3" />
                                   <span className="text-xs font-bold tracking-tight">
                                     {opp.value.toLocaleString()}
                                   </span>
                                </div>
                                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                   <User className="h-3 w-3 text-white/40" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <DealModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        stageId={modalState.stageId}
        initialData={modalState.deal}
      />
    </div>
  );
}
