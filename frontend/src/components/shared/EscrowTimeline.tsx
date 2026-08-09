import { CheckCircleIcon, ClockIcon, AlertCircleIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface EscrowTimelineProps {
  escrowStatus: "PENDING" | "COMPLETED" | "REFUNDED" | string;
  deadlineFormatted: string;
}

export function EscrowTimeline({ escrowStatus, deadlineFormatted }: EscrowTimelineProps) {
  const steps = [
    {
      id: "created",
      title: "Escrow Created",
      description: "Funds locked securely in contract.",
      icon: <ShieldCheckIcon size={16} />,
      status: "complete",
    },
    {
      id: "in-transit",
      title: "In Transit",
      description: "Waiting for goods to be delivered.",
      icon: <ClockIcon size={16} />,
      status: escrowStatus === "PENDING" ? "current" : "complete",
    },
    {
      id: "settled",
      title: escrowStatus === "REFUNDED" ? "Refunded" : "Settlement",
      description: escrowStatus === "REFUNDED" 
        ? "Deadline passed, funds returned." 
        : escrowStatus === "COMPLETED" 
        ? "Delivery confirmed, funds released." 
        : `Deadline: ${deadlineFormatted}`,
      icon: escrowStatus === "REFUNDED" ? <AlertCircleIcon size={16} /> : <CheckCircleIcon size={16} />,
      status: escrowStatus === "COMPLETED" || escrowStatus === "REFUNDED" ? "complete" : "upcoming",
    },
  ];

  return (
    <div className="relative pl-3 mt-4">
      {/* Vertical line connecting steps */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-[var(--color-border)]"></div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          
          return (
            <div key={step.id} className="relative flex gap-3 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <div 
                className={`relative z-10 flex shrink-0 items-center justify-center w-7 h-7 rounded-full border-2 
                  ${isComplete 
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" 
                    : isCurrent
                      ? "bg-white border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }
                `}
              >
                {step.icon}
              </div>
              <div className="pt-1">
                <h4 className={`text-xs font-semibold ${isComplete || isCurrent ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
