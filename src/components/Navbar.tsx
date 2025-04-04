
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Brain, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-background border-b border-border py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Learner.ai</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#create" className="text-foreground hover:text-primary transition-colors">Create</a>
            
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/sessions')} 
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Sessions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={logout} 
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="ml-2">Sign In</Button>
                <Button>Get Started</Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-4 py-4 md:hidden flex flex-col space-y-4">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#create" className="text-foreground hover:text-primary transition-colors">Create</a>
            
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/sessions');
                    setIsMenuOpen(false);
                  }} 
                  className="flex items-center justify-start gap-2"
                >
                  <User className="h-4 w-4" />
                  Sessions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={logout} 
                  className="flex items-center justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline">Sign In</Button>
                <Button>Get Started</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
