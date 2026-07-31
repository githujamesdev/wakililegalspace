'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Plus } from 'lucide-react'

const mockChannels = [
  { id: '1', name: 'general', unread: 0 },
  { id: '2', name: 'smith-v-johnson', unread: 3 },
  { id: '3', name: 'corporate-merger', unread: 1 },
]

const mockMessages = [
  {
    id: '1',
    author: 'Sarah Johnson',
    avatar: 'SJ',
    content: 'I&apos;ve reviewed the motion brief and it looks good.',
    timestamp: '10:30 AM',
    isCurrentUser: false,
  },
  {
    id: '2',
    author: 'You',
    avatar: 'Y',
    content: 'Thanks! I made some revisions based on your suggestions.',
    timestamp: '10:45 AM',
    isCurrentUser: true,
  },
  {
    id: '3',
    author: 'Sarah Johnson',
    avatar: 'SJ',
    content: 'Perfect, let&apos;s schedule a meeting to discuss next steps.',
    timestamp: '11:00 AM',
    isCurrentUser: false,
  },
]

export default function MessagingPage() {
  const [selectedChannel, setSelectedChannel] = useState(mockChannels[0])
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('')
    }
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Team Communication
      </h1>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Channels Sidebar */}
        <Card className="w-64 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Channels</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {mockChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedChannel.id === channel.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">#{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium bg-destructive text-white">
                      {channel.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b">
              <CardTitle>#{selectedChannel.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!msg.isCurrentUser && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                      {msg.avatar}
                    </div>
                  )}
                  <div
                    className={`max-w-xs ${
                      msg.isCurrentUser ? 'text-right' : ''
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">
                      {msg.author} {msg.timestamp}
                    </p>
                    <div
                      className={`mt-1 px-3 py-2 rounded-lg ${
                        msg.isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
