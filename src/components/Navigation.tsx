
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <span className="hidden sm:inline">RADIO PROGRAMMER</span>
                <span className="sm:hidden">RADIO</span>
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2 lg:space-x-4">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Radio className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule">
                <Button 
                  variant={isActive('/schedule') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Grille</span>
                </Button>
              </Link>
              
              <Link to="/programs">
                <Button 
                  variant={isActive('/programs') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Programmes</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground truncate max-w-32 lg:max-w-none">
              Bonjour, {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className="w-full justify-start space-x-2"
                  size="sm"
                >
                  <Radio className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/schedule" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/schedule') ? 'default' : 'ghost'}
                  className="w-full justify-start space-x-2"
                  size="sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Grille</span>
                </Button>
              </Link>
              
              <Link to="/programs" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/programs') ? 'default' : 'ghost'}
                  className="w-full justify-start space-x-2"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Programmes</span>
                </Button>
              </Link>

              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    Bonjour, {user?.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="w-full justify-start space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
