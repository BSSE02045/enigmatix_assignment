const STATUS_STYLES = {
  todo: 'bg-line text-muted',
  in_progress: 'bg-accent/10 text-accent',
  review: 'bg-amber/15 text-amber',
  done: 'bg-good/10 text-good',
  planning: 'bg-line text-muted',
  on_hold: 'bg-amber/15 text-amber',
  completed: 'bg-good/10 text-good',
  cancelled: 'bg-warn/10 text-warn'
};

const STATUS_LABELS = {
  todo: 'TO-DO',
  in_progress: 'IN-PROG',
  review: 'REVIEW',
  done: 'DONE',
  planning: 'PLANNING',
  on_hold: 'ON-HOLD',
  completed: 'COMPLETE',
  cancelled: 'CANCELLED'
};

const PRIORITY_STYLES = {
  low: 'bg-line text-muted',
  medium: 'bg-accent/10 text-accent',
  high: 'bg-amber/15 text-amber',
  urgent: 'bg-warn/10 text-warn'
};

export function StatusBadge({ status }) {
  return (
    <span className={`status-chip ${STATUS_STYLES[status] || 'bg-line text-muted'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`status-chip ${PRIORITY_STYLES[priority] || 'bg-line text-muted'}`}>
      {priority?.toUpperCase()}
    </span>
  );
}
