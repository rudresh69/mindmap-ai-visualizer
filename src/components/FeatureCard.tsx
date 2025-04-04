
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
  requiresAuth?: boolean;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  onClick,
  requiresAuth = false 
}: FeatureCardProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (requiresAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
      // Navigate to login page or show login modal
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };
  
  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Content can be expanded later */}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-between"
          onClick={handleClick}
        >
          {buttonText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
