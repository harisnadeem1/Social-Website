import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

const StartNewChatModal = ({ children, onStartNewChat, allUsers, activeGirl }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');

  const handleStartChat = () => {
    onStartNewChat(selectedUser, newChatMessage);
    setOpen(false);
    setSelectedUser('');
    setNewChatMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat as {activeGirl.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a user...</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">First Message</label>
            <Input
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Hey! How are you doing? 😊"
            />
          </div>
          <Button
            onClick={handleStartChat}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            disabled={!selectedUser || !newChatMessage.trim()}
          >
            Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartNewChatModal;