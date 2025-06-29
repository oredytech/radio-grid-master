
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RADIO PROGRAMMER
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Radio className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button 
                  variant={isActive('/schedule') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Grille</span>
                </Button>
              </Link>
              
              <Link to="/programs">
                <Button 
                  variant={isActive('/programs') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Programmes</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Bonjour, {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
