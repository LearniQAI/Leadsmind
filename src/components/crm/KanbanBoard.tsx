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

  const openNewDeal = (stageId?: string) => {
    setModalState({ isOpen: true, stageId: stageId || stages[0]?.id });
  };

  const openEditDeal = (deal: Opportunity) => {
    setModalState({ isOpen: true, deal });
  };

  return (
    <div className="flex flex-col gap-10 h-full relative">
      {/* Integrated Global Actions */}
      <div className="flex justify-end mb-4">
          <Button 
            onClick={() => openNewDeal()}
            className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-[#6c47ff]/20 animate-in fade-in slide-in-from-right-4"
          >
            <Plus className="h-5 w-5" />
            <span>New Deal</span>
          </Button>
      </div>

      {/* Visual Depth Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,#6c47ff0a_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 -z-10 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide min-h-[calc(100vh-320px)] px-2">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[300px] shrink-0 flex flex-col gap-5 group/column">
              {/* Column Header - Premium Style */}
              <div className="relative p-5 rounded-[24px] bg-[#0b0b15]/40 border border-white/5 backdrop-blur-xl shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#6c47ff] shadow-[0_0_15px_#6c47ff]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#6c47ff]/10 text-[#6c47ff] text-[10px] font-black border border-[#6c47ff]/20">
                      {opportunitiesByStage[stage.id]?.length || 0}
                    </div>
                    <h3 className="text-xs font-black text-white/90 uppercase tracking-[0.2em]">{stage.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => openNewDeal(stage.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Column Body */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 flex flex-col gap-4 p-2 rounded-[32px] transition-all duration-300",
                      snapshot.isDraggingOver ? "bg-[#6c47ff]/5 ring-1 ring-[#6c47ff]/20" : "bg-transparent"
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
                              "relative bg-gradient-to-br from-[#11111d] to-[#080810] border border-white/5 rounded-[22px] p-5 shadow-lg transition-all hover:border-[#6c47ff]/40 hover:-translate-y-1 hover:shadow-2xl group",
                              snapshot.isDragging && "shadow-[0_20px_50px_rgba(108,71,255,0.3)] border-[#6c47ff]/60 bg-[#161622] scale-[1.02] rotate-1"
                            )}
                          >
                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#6c47ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex flex-col gap-5">
                              <div className="flex items-start justify-between gap-4">
                                <span className="text-[13px] font-bold text-white/90 leading-snug tracking-tight group-hover:text-white transition-colors">{opp.title}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 p-0 text-white/10 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                  onClick={() => openEditDeal(opp)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Value</span>
                                   <div className="flex items-center gap-1.5 text-[#fdab3d]">
                                      <DollarSign className="h-3 w-3" />
                                      <span className="text-[13px] font-black tracking-tight">
                                        {opp.value.toLocaleString()}
                                      </span>
                                   </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                     <User className="h-4 w-4 text-white/60" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Placeholder "Quick Add" for empty columns */}
                    {opportunitiesByStage[stage.id]?.length === 0 && (
                      <button 
                        onClick={() => openNewDeal(stage.id)}
                        className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-[22px] hover:border-[#6c47ff]/30 hover:bg-[#6c47ff]/5 transition-all animate-in fade-in zoom-in duration-500"
                      >
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#6c47ff]/10 group-hover:scale-110 transition-all">
                          <Plus className="h-5 w-5 text-white/10 group-hover:text-[#6c47ff]" />
                        </div>
                        <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest group-hover:text-white/40">New Deal</span>
                      </button>
                    )}
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
