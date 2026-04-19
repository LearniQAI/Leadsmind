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
    <div className="flex flex-col gap-6 h-full relative">
      {/* Professional Dashboard Actions */}
      <div className="flex justify-between items-end mb-4 px-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Pipeline Deals</h2>
            <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em]">Manage your sales opportunities</p>
          </div>
          <Button 
            onClick={() => openNewDeal()}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Deal</span>
          </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-white/5 min-h-[calc(100vh-320px)] px-2">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[320px] shrink-0 flex flex-col gap-4 group/column">
              {/* Column Header - Clean SaaS Style */}
              <div className="p-4 rounded-2xl bg-[#0c0c14] border border-white/5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20">
                      {opportunitiesByStage[stage.id]?.length || 0}
                    </div>
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">{stage.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-white/10 hover:text-white hover:bg-white/5 rounded-lg transition-all"
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
                      "flex-1 flex flex-col gap-3 p-1 rounded-2xl transition-all duration-300",
                      snapshot.isDraggingOver ? "bg-white/[0.02]" : "bg-transparent"
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
                              "relative bg-[#0c0c14] border border-white/5 rounded-2xl p-4 shadow-xl transition-all hover:border-blue-500/40 group",
                              snapshot.isDragging && "shadow-2xl border-blue-500/60 bg-[#0e0e1a] scale-[1.02]"
                            )}
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-[13px] font-bold text-white leading-tight tracking-tight">{opp.title}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 p-0 text-white/5 hover:text-white hover:bg-white/5 rounded-md transition-all shrink-0"
                                  onClick={() => openEditDeal(opp)}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* TAGS DISPLAY */}
                              {opp.tags && opp.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {opp.tags.map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 rounded-[4px] bg-blue-500/5 border border-blue-500/10 text-[9px] font-bold text-blue-400 capitalize whitespace-nowrap">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-1.5 text-emerald-400/80">
                                      <DollarSign className="h-3 w-3" />
                                      <span className="text-[12px] font-black tracking-tight">
                                        {opp.value.toLocaleString()}
                                      </span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {opp.contact?.total_invoiced ? (
                                    <div className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                                      opp.contact.outstanding_balance! > 0 
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_12px_-4px_rgba(245,158,11,0.3)]" 
                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_-4px_rgba(16,185,129,0.3)]"
                                    )}>
                                       {opp.contact.outstanding_balance! > 0 && <div className="h-1 w-1 rounded-full bg-amber-400 mr-0.5 animate-pulse" />}
                                       Invoiced
                                    </div>
                                  ) : null}
                                  <div className="h-6 w-6 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                     <User className="h-3 w-3 text-white/20" />
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
                        className="group flex flex-col items-center justify-center p-6 border border-dashed border-white/5 rounded-2xl hover:border-blue-500/20 hover:bg-white/[0.01] transition-all"
                      >
                         <Plus className="h-4 w-4 text-white/5 group-hover:text-blue-500/40 mb-2" />
                         <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Add Deal</span>
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
