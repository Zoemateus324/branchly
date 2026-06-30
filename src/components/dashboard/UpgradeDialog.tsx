import { Crown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plans";

const FEATURE_LABELS: Record<string, string> = {
  locations: "adicionar mais localizações",
  competitors: "rastrear concorrentes",
  reports: "gerar mais relatórios",
  aiReplies: "gerar respostas com IA",
  capturePerDay: "capturar avaliações",
};

const PLAN_LABEL: Record<PlanTier, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  premium: "Premium",
};

export function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  currentPlan,
  suggestedPlan,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  feature: keyof typeof FEATURE_LABELS;
  currentPlan: PlanTier;
  suggestedPlan: PlanTier;
  onUpgrade: () => void;
}) {
  const limits = PLAN_LIMITS[suggestedPlan];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <DialogTitle>Faça upgrade para {PLAN_LABEL[suggestedPlan]}</DialogTitle>
          <DialogDescription>
            Seu plano atual ({PLAN_LABEL[currentPlan]}) não permite {FEATURE_LABELS[feature]}.
            Faça upgrade para liberar este recurso.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <Item ok>Até {limits.locations} localizações</Item>
          <Item ok={limits.competitors > 0}>{limits.competitors >= 9999 ? "Concorrentes ilimitados" : `${limits.competitors} concorrentes`}</Item>
          <Item ok={limits.aiReplies > 0}>{limits.aiReplies >= 9999 ? "Respostas IA ilimitadas" : `${limits.aiReplies} respostas IA/mês`}</Item>
          <Item ok={limits.reports > 0}>{limits.reports >= 9999 ? "Relatórios ilimitados" : `${limits.reports} relatórios/mês`}</Item>
        </ul>
        <div className="flex justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            Agora não
          </button>
          <button onClick={onUpgrade} className="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90">
            Ver planos
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Item({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-foreground" : "text-muted-foreground line-through"}`}>
      <Check className="h-3.5 w-3.5 text-emerald-500" /> {children}
    </li>
  );
}