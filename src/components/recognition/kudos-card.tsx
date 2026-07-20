import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BADGES } from "@/components/recognition/give-kudos-dialog";

type KudosCardProps = {
  recognition: {
    id: string;
    message: string;
    badge: string;
    createdAt: Date;
    fromUser: {
      email: string;
      employee?: { firstName: string; lastName: string; avatarUrl: string | null } | null;
    };
    toEmployee: {
      firstName: string;
      lastName: string;
      jobTitle: string;
      avatarUrl: string | null;
    };
  };
};

export function KudosCard({ recognition }: KudosCardProps) {
  const badgeConfig = BADGES.find((b) => b.id === recognition.badge) || BADGES[0];
  const Icon = badgeConfig.icon;

  const fromName = recognition.fromUser.employee
    ? `${recognition.fromUser.employee.firstName} ${recognition.fromUser.employee.lastName}`
    : recognition.fromUser.email;

  const toName = `${recognition.toEmployee.firstName} ${recognition.toEmployee.lastName}`;

  return (
    <div className="flex gap-4 rounded-xl border border-hairline bg-surface p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-hover border border-hairline">
        <Icon className={`size-6 ${badgeConfig.color}`} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-powder-100">{toName}</span>
            <span className="text-muted text-sm mx-1.5">received a</span>
            <span className={`font-semibold ${badgeConfig.color}`}>{badgeConfig.label}</span>
          </div>
          <span className="text-xs text-muted">
            {formatDistanceToNow(recognition.createdAt, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted/90 italic">&ldquo;{recognition.message}&rdquo;</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-muted">From</span>
          <Avatar className="size-6">
            <AvatarImage src={recognition.fromUser.employee?.avatarUrl || undefined} />
            <AvatarFallback>{fromName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-muted">{fromName}</span>
        </div>
      </div>
    </div>
  );
}
