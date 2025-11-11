import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThreadList } from '@/components/chat/ThreadList';
import { ChatBox } from '@/components/chat/ChatBox';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useLocation } from 'wouter';

export default function Messaging() {
  const [, navigate] = useLocation();
  const { user } = useAuthStore();
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>();

  // Fetch threads from API
  const { data: threads = [] } = useQuery({
    queryKey: ['/api/v1/threads'],
    enabled: !!user,
  });

  // Fetch messages for selected thread
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/v1/threads', selectedThreadId, 'messages'],
    enabled: !!selectedThreadId,
  });

  const handleSendMessage = (body: string) => {
    // Would implement with mutation
    console.log('Sending message:', body);
  };

  // Auto-select first thread
  useEffect(() => {
    if (threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={MessageCircle}
          title="Connexion requise"
          description="Veuillez vous connecter pour accéder à vos messages"
          action={{
            label: 'Se connecter',
            onClick: () => navigate('/auth/login'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold" data-testid="text-messaging-title">
            Messagerie
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-1">
            <ThreadList
              threads={threads}
              selectedThreadId={selectedThreadId}
              onSelectThread={setSelectedThreadId}
            />
          </div>

          {/* Chat Box */}
          <div className="lg:col-span-2">
            {selectedThreadId ? (
              <div className="h-[600px]">
                <ChatBox messages={messages} onSendMessage={handleSendMessage} />
              </div>
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Sélectionnez une conversation"
                description="Choisissez une conversation dans la liste pour commencer à discuter"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
