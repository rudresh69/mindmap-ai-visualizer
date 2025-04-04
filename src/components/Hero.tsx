
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Zap, Share2 } from "lucide-react";

const Hero = () => {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Visualize Knowledge with <span className="gradient-text">AI-Powered Mind Maps</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform complex topics into clear, structured visualizations using our advanced AI. Learn faster, understand deeper, and remember longer.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="px-6">
              Start Creating <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-6">
              See Examples
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 w-full max-w-4xl">
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <div className="bg-primary/10 p-2 rounded-full">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Smart Generation</p>
                <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <div className="bg-accent/10 p-2 rounded-full">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Multiple Formats</p>
                <p className="text-sm text-muted-foreground">3 types of mind maps</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
              <div className="bg-secondary/10 p-2 rounded-full">
                <Share2 className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Easy Sharing</p>
                <p className="text-sm text-muted-foreground">Export as SVG</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
