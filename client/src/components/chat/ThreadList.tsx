import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Thread } from '@/shared/schema';
import { MessageCircle } from 'lucide-react';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId?: number;
  onSelectThread: (threadId: number) => void;
}

export function ThreadList({ threads, selectedThreadId, onSelectThread }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucune conversation</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const isSelected = thread.id === selectedThreadId;
        const timeAgo = formatDistanceToNow(new Date(thread.lastMessageAt), {
          addSuffix: true,
          locale: fr,
        });

        return (
          <Card
            key={thread.id}
            className={`p-4 cursor-pointer hover-elevate transition-all ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectThread(thread.id)}
            data-testid={`thread-${thread.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {thread.topicType === 'PRODUCT' ? 'Produit' : 'Commande'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{thread.topicId}</span>
                </div>
                <p className="text-sm text-muted-foreground">{timeAgo}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
