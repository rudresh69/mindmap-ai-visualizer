
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import MindMapCreator from "@/components/MindMapCreator";
import MindMapViewer from "@/components/MindMapViewer";
import { Braces, Lightbulb, FileText } from "lucide-react";

// Example SVG for demonstration
const EXAMPLE_SVG = `
<svg width="100%" height="100%" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .node rect { fill: #4f46e5; stroke: #4338ca; }
    .node text { fill: white; font-family: Arial; }
    .edgePath path { stroke: #6b7280; stroke-width: 2px; }
  </style>
  <g transform="translate(400, 200)">
    <g class="node" transform="translate(0,0)">
      <rect width="120" height="40" rx="5" ry="5"></rect>
      <text x="60" y="25" text-anchor="middle">Quantum Physics</text>
    </g>
    <g class="node" transform="translate(-200,-100)">
      <rect width="100" height="40" rx="5" ry="5"></rect>
      <text x="50" y="25" text-anchor="middle">Particles</text>
    </g>
    <g class="node" transform="translate(200,-100)">
      <rect width="100" height="40" rx="5" ry="5"></rect>
      <text x="50" y="25" text-anchor="middle">Waves</text>
    </g>
    <g class="node" transform="translate(-200,100)">
      <rect width="100" height="40" rx="5" ry="5"></rect>
      <text x="50" y="25" text-anchor="middle">Uncertainty</text>
    </g>
    <g class="node" transform="translate(200,100)">
      <rect width="100" height="40" rx="5" ry="5"></rect>
      <text x="50" y="25" text-anchor="middle">Entanglement</text>
    </g>
    <g class="edgePath">
      <path d="M0,20 L-200,-80"></path>
    </g>
    <g class="edgePath">
      <path d="M0,20 L200,-80"></path>
    </g>
    <g class="edgePath">
      <path d="M0,20 L-200,80"></path>
    </g>
    <g class="edgePath">
      <path d="M0,20 L200,80"></path>
    </g>
  </g>
</svg>
`;

type MindMapType = "simple" | "analogy" | "text";

const Index = () => {
  const [generatedMindMap, setGeneratedMindMap] = useState<string | null>(null);
  const [mindMapTitle, setMindMapTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeMapType, setActiveMapType] = useState<MindMapType | null>(null);

  const handleGenerateMindMap = (topic: string, type: MindMapType) => {
    setIsLoading(true);
    setMindMapTitle(topic);
    setActiveMapType(type);
    
    // Simulate API call - in reality, this would call the Flask backend
    setTimeout(() => {
      setGeneratedMindMap(EXAMPLE_SVG);
      setIsLoading(false);
    }, 2000);
  };

  const handleFeatureClick = (type: MindMapType) => {
    // Scroll to creator section
    const element = document.getElementById("create");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    
    // Set the active tab
    setActiveMapType(type);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <section id="features" className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Mind Map Type</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI can generate three different types of mind maps to help you visualize knowledge in the way that works best for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Simple Mind Map"
                description="Generate a hierarchical structure of concepts and relationships for any topic."
                icon={<Braces className="h-10 w-10 text-primary" />}
                buttonText="Create Simple Mind Map"
                onClick={() => handleFeatureClick("simple")}
              />
              
              <FeatureCard
                title="Analogy-Based Mind Map"
                description="Visualize complex topics through relatable analogies to simplify understanding."
                icon={<Lightbulb className="h-10 w-10 text-accent" />}
                buttonText="Create Analogy Mind Map"
                onClick={() => handleFeatureClick("analogy")}
              />
              
              <FeatureCard
                title="Text-Based Mind Map"
                description="Convert any text content into a structured mind map for better comprehension."
                icon={<FileText className="h-10 w-10 text-secondary" />}
                buttonText="Create Text Mind Map"
                onClick={() => handleFeatureClick("text")}
              />
            </div>
          </div>
        </section>
        
        <section id="create" className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Create Your Mind Map</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter your topic or text below and our AI will generate a visual mind map for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <MindMapCreator onGenerate={handleGenerateMindMap} />
              </div>
              
              <div className="h-[500px]">
                <MindMapViewer 
                  title={mindMapTitle || "Your Mind Map"} 
                  svgContent={generatedMindMap || undefined}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted py-8 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p>© 2025 Learner.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
