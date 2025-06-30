import React from 'react';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu.jsx';

const ChatterHeader = ({
  user,
  activeGirl,
  girlProfiles,
  onSwitchGirl,
  sidebarOpen,
  setSidebarOpen,
  onLogout
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Chatter Hub</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              Logged in as: <span className="font-medium">{user?.name}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={activeGirl?.avatar} />
                    <AvatarFallback>{activeGirl?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Chatting as: {activeGirl?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {girlProfiles.map((girl) => (
                  <DropdownMenuItem
                    key={girl.id}
                    onClick={() => onSwitchGirl(girl)}
                    className={`flex items-center space-x-2 ${activeGirl?.id === girl.id ? 'bg-pink-50' : ''}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={girl.avatar} />
                      <AvatarFallback>{girl.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>{girl.name}</span>
                    {activeGirl?.id === girl.id && <Badge className="ml-auto bg-pink-500">Active</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuItem disabled className="cursor-default focus:bg-white">
                    <div className="flex flex-col">
                        <span className="font-semibold">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatterHeader;