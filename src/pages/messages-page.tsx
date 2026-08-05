import { motion } from 'framer-motion';
import { MessageSquare, Send, Search, Phone, Video } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';

const conversations = [
  { id: '1', name: 'Ananya Sharma', avatar: 'AS', last: 'Looking forward to the wedding shoot!', time: '2m', unread: true },
  { id: '2', name: 'Rohan Mehta', avatar: 'RM', last: 'Can we discuss the corporate event details?', time: '1h', unread: true },
  { id: '3', name: 'Priya Iyer', avatar: 'PI', last: 'Thank you for the amazing photos!', time: '3h', unread: false },
  { id: '4', name: 'Karthik Reddy', avatar: 'KR', last: 'What time will you arrive?', time: '5h', unread: false },
  { id: '5', name: 'Meera Nair', avatar: 'MN', last: 'Sent the decor requirements', time: '1d', unread: false },
];

const messages = [
  { id: '1', sender: 'them', text: 'Hi! I saw your portfolio and loved your work.', time: '10:30 AM' },
  { id: '2', sender: 'me', text: 'Thank you so much! I would love to cover your event.', time: '10:32 AM' },
  { id: '3', sender: 'them', text: 'Looking forward to the wedding shoot!', time: '10:35 AM' },
];

export function MessagesPage() {
  const [activeChat, setActiveChat] = useState('1');
  const active = conversations.find((c) => c.id === activeChat)!;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Chat with your clients" icon={MessageSquare} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversation list */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-premium">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search conversations..."
              className="h-10 w-full rounded-xl border border-border bg-cream-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            {conversations.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveChat(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                  activeChat === c.id ? 'bg-sage-50' : 'hover:bg-cream-50',
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {c.avatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-dark-900">{c.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.last}</p>
                </div>
                {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card shadow-premium">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
              {active.avatar}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-dark-900">{active.name}</p>
              <p className="text-xs text-sage-600">Online</p>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 hover:bg-muted">
              <Phone className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 hover:bg-muted">
              <Video className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn('flex', m.sender === 'me' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  m.sender === 'me' ? 'bg-gradient-brand text-white' : 'bg-cream-100 text-dark-900',
                )}>
                  <p>{m.text}</p>
                  <p className={cn('mt-1 text-[10px]', m.sender === 'me' ? 'text-white/70' : 'text-muted-foreground')}>
                    {m.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-4">
            <input
              placeholder="Type a message..."
              className="h-11 flex-1 rounded-xl border border-border bg-cream-50 px-4 text-sm focus:border-primary focus:outline-none"
            />
            <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-600 text-white transition-colors hover:bg-sage-700">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
