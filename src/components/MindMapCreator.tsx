
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Lightbulb, FileText } from "lucide-react";

type MindMapType = "simple" | "analogy" | "text";

interface MindMapCreatorProps {
  onGenerate: (topic: string, type: MindMapType) => void;
}

const MindMapCreator = ({ onGenerate }: MindMapCreatorProps) => {
  const [topic, setTopic] = useState("");
  const [textContent, setTextContent] = useState("");
  const [currentTab, setCurrentTab] = useState<MindMapType>("simple");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    // In a real implementation, this would call the backend API
    setIsGenerating(true);
    
    // Simulating API call
    setTimeout(() => {
      onGenerate(currentTab === "text" ? textContent : topic, currentTab);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs 
          defaultValue="simple" 
          className="w-full"
          onValueChange={(value) => setCurrentTab(value as MindMapType)}
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Simple</span>
            </TabsTrigger>
            <TabsTrigger value="analogy" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Analogy</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="simple-topic">Topic</Label>
              <Input
                id="simple-topic"
                placeholder="Enter a topic (e.g., Quantum Physics)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter any topic and our AI will create a structured mind map.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="analogy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="analogy-topic">Complex Topic</Label>
              <Input
                id="analogy-topic"
                placeholder="Enter a complex topic (e.g., Blockchain Technology)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Our AI will create an analogy-based mind map to simplify the complex topic.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                placeholder="Paste your text content here..."
                className="min-h-[150px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Convert any text content into a structured mind map.
              </p>
            </div>
          </TabsContent>
          
          <div className="mt-6">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (currentTab !== "text" ? !topic : !textContent)}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Mind Map"}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MindMapCreator;
