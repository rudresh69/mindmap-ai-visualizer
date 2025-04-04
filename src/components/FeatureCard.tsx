
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
}

const FeatureCard = ({ title, description, icon, buttonText, onClick }: FeatureCardProps) => {
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
          onClick={onClick}
        >
          {buttonText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
