
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  LayoutDashboard, 
  Calendar, 
  Tv, 
  Users, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/schedule', label: 'Grille', icon: Calendar },
    { path: '/programs', label: 'Programmes', icon: Tv },
    { path: '/animateurs', label: 'Animateurs', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0 min-w-0">
            <div className="relative flex-shrink-0">
              <Radio className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden xs:block truncate">
              <span className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                {user?.radioName || 'RADIO PROGRAMMER'}
              </span>
              {user?.radioName && (
                <div className="text-xs text-muted-foreground truncate">
                  Radio Programmer
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Medium screens navigation */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground min-w-0">
              <span className="hidden md:inline">Bonjour,</span>
              <span className="font-medium text-foreground truncate max-w-[100px] lg:max-w-none">
                {user?.name}
              </span>
              <span className="hidden lg:inline text-xs">
                ({user?.role})
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden md:inline">Déconnexion</span>
              <span className="md:hidden">Exit</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  <div>Connecté en tant que: <span className="font-medium text-foreground">{user?.name}</span></div>
                  <div className="text-xs mt-1">{user?.role} - {user?.radioName}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start mt-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
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
