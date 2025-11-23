import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Copy, Download, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Job {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  client_country: string;
  publishedDateTime: string;
  category_label: string;
  subcategory_label: string;
  skills: string;
  relevance?: {
    score: number;
    category: string;
    reasoning: string;
    technology_match: string;
    portfolio_match: string;
    project_match: string;
    location_match: string;
    closest_profile_name: string;
    tags: string;
  };
}

interface ProposalGeneratorModalProps {
  job: Job;
  trigger?: React.ReactNode;
}

const ProposalGeneratorModal = ({ job, trigger }: ProposalGeneratorModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [existingProposal, setExistingProposal] = useState<string | null>(null);
  const [proposalExists, setProposalExists] = useState(false);
  const [templateError, setTemplateError] = useState("");

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setTemplateError("");
    try {
      // Updated to use IBM watsonx ADK endpoint
      const endpoint = `http://localhost:8001/api/watsonx/adk/generate-proposal/${job.id}?overwrite=${overwrite}`;
      
      console.log("Attempting to generate proposal with IBM watsonx ADK:", endpoint);
      console.log("Job ID:", job.id);
      console.log("Overwrite:", overwrite);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorText = await response.text();
        setTemplateError(`Failed to generate proposal: ${response.status} ${errorText}`);
        throw new Error(`Failed to generate proposal: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setProposalContent(data.proposal || "");
      setProposalExists(data.exists || false);
      setExistingProposal(data.proposal || "");

      toast({
        title: proposalExists ? "Proposal Updated!" : "Proposal Generated!",
        description: proposalExists 
          ? "Your proposal has been updated successfully with IBM watsonx.ai" 
          : "Your proposal has been generated successfully with IBM watsonx.ai",
      });
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProposal = async () => {
    try {
      // Updated to use IBM watsonx ADK endpoint
      const response = await fetch(`http://localhost:8001/api/watsonx/adk/save-proposal/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal: proposalContent,
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save proposal: ${response.status}`);
      }

      toast({
        title: "Proposal Saved!",
        description: "Your proposal has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposalContent);
    toast({
      title: "Copied!",
      description: "Proposal copied to clipboard.",
    });
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([proposalContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${job.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Proposal has been downloaded.",
    });
  };

  const handleRegenerateProposal = () => {
    setOverwrite(true);
    handleGenerateProposal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center gap-2 justify-center" size="lg">
            <Sparkles className="w-5 h-5" />
            Generate & Edit Proposal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Proposal for "{job.title}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Job Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Budget:</span> {job.currency}{job.amount}
              </div>
              <div>
                <span className="font-medium">Country:</span> {job.client_country}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Description:</span> {job.description?.substring(0, 200)}...
              </div>
              {job.relevance && (
                <div className="col-span-2">
                  <span className="font-medium">Relevance Score:</span> {Math.round(job.relevance.score * 100)}% ({job.relevance.category})
                </div>
              )}
            </div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="overwrite-mode"
                checked={overwrite}
                onCheckedChange={setOverwrite}
              />
              <Label htmlFor="overwrite-mode">Overwrite existing proposal</Label>
            </div>
            {proposalExists && (
              <div className="text-sm text-muted-foreground">
                <Badge variant="secondary">Existing proposal found</Badge>
              </div>
            )}
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateProposal} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {proposalExists ? "Update Proposal" : "Generate Proposal"}
                </>
              )}
            </Button>
            {proposalExists && (
              <Button 
                onClick={handleRegenerateProposal}
                disabled={isGenerating}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>

          {/* Proposal Content */}
          {proposalContent && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="proposal-content">
                  {proposalExists ? "Updated Proposal" : "Generated Proposal"}
                </Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyProposal}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadProposal}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveProposal}>
                    <Send className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              
              <Textarea
                id="proposal-content"
                value={proposalContent}
                onChange={(e) => setProposalContent(e.target.value)}
                placeholder="Generated proposal will appear here..."
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Method: AI-Generated
                </Badge>
                {proposalExists && (
                  <Badge variant="outline">
                    {overwrite ? "Overwritten" : "Existing"}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {templateError && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">
              {templateError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalGeneratorModal;
