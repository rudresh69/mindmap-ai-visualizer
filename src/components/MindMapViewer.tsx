
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MindMapViewerProps {
  title: string;
  svgContent?: string;
  isLoading?: boolean;
}

const MindMapViewer = ({ title, svgContent, isLoading = false }: MindMapViewerProps) => {
  // In a real implementation, this would have zoom and download functionality
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Reset view">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Download SVG">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-0">
        <div className="mindmap-container w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Generating your mind map...</p>
              </div>
            </div>
          ) : svgContent ? (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No mind map generated yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create a mind map to see it here</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MindMapViewer;
