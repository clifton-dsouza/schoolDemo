import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="schoolos-page-header"><div>{eyebrow && <p className="schoolos-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="schoolos-actions">{actions}</div>}</header>;
}

export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) { return <section className={`schoolos-surface ${className}`}>{children}</section>; }

export function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="schoolos-empty-state"><Inbox className="size-7" /><h2>{title}</h2><p>{detail}</p></div>; }
