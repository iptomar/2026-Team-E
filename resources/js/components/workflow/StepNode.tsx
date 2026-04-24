import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge'; // Ajustado ao seu caminho

export function StepNode({ data }: NodeProps) {
    const isApproval = data.type === 'aprovar';
    
    return (
        <div className="min-w-[220px] overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm">
            <div className={`px-3 py-1.5 text-[10px] font-bold uppercase text-white ${
                isApproval ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
                {isApproval ? '✅ Aprovação' : 'ℹ️ Informar'}
            </div>
            
            <div className="p-3">
                <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
                
                <div className="mb-2 text-sm font-semibold text-foreground">
                    {data.name || 'Sem nome'}
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {data.labels?.length > 0 ? (
                        data.labels.map((l: any) => (
                            <Badge key={l.id} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {l.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-[10px] italic text-muted-foreground">Arraste labels aqui</span>
                    )}
                </div>

                <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
            </div>
        </div>
    );
}