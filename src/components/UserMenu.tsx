
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Heart, Settings } from 'lucide-react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/auth')}
        className="font-normal"
      >
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User size={18} />
          <span className="hidden md:inline">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 font-medium">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/favorites" className="flex items-center cursor-pointer w-full">
            <Heart size={16} className="mr-2" />
            My Favorites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center cursor-pointer w-full">
            <Settings size={16} className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
          <LogOut size={16} className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
