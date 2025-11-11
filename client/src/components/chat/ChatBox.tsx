import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Message } from '@/shared/schema';
import { useAuthStore } from '@/lib/store';

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (body: string) => void;
  isLoading?: boolean;
}

export function ChatBox({ messages, onSendMessage, isLoading }: ChatBoxProps) {
  const [messageText, setMessageText] = useState('');
  const user = useAuthStore(state => state.user);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full" data-testid="card-chatbox">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Messages</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucun message
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: fr,
            });

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                  <p className={`text-xs mt-2 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {timeAgo}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="flex gap-2 w-full">
          <Textarea
            placeholder="Écrivez votre message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="resize-none"
            rows={2}
            data-testid="input-message"
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!messageText.trim() || isLoading}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled
              data-testid="button-attach"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
