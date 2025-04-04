
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Brain } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Button variant="outline" className="ml-2">Sign In</Button>
            <Button>Get Started</Button>
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
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline">Sign In</Button>
              <Button>Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
