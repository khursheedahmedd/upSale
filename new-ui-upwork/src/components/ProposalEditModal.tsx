import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, RefreshCw, AlertTriangle, HelpCircle, CheckCircle, Clock } from "lucide-react";

interface ProposalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  currentProposal: string;
  onSave: (proposal: string) => void;
  onGenerate: (uncertaintyLevel: string) => Promise<string>;
}

const ProposalEditModal: React.FC<ProposalEditModalProps> = ({
  isOpen,
  onClose,
  job,
  currentProposal,
  onSave,
  onGenerate
}) => {
  const { toast } = useToast();
  const [proposalContent, setProposalContent] = useState(currentProposal);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uncertaintyLevel, setUncertaintyLevel] = useState('low');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const getUncertaintyColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    try {
      await onSave(proposalContent);
      setIsEditing(false);
      toast({
        title: "Proposal Updated",
        description: "Your proposal has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedProposal = await onGenerate(uncertaintyLevel);
      setProposalContent(generatedProposal);
      setShowGenerateForm(false);
      toast({
        title: "Proposal Generated",
        description: "New proposal has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setProposalContent(currentProposal);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProposalContent(currentProposal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-primary">
                  {isEditing ? 'Edit Proposal' : 'Proposal Management'}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {job?.title}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="space-y-6">
            {/* Job Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Job Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <div className="font-medium">{job?.currency} {job?.amount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Country:</span>
                  <div className="font-medium">{job?.client_country}</div>
                </div>
                <div>
                  <span className="text-gray-600">Skills:</span>
                  <div className="font-medium">{job?.skills?.join(', ')}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className="font-medium">{job?.status}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex items-center gap-3">
                <Button onClick={handleEditMode} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Current Proposal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowGenerateForm(true)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate New Proposal
                </Button>
              </div>
            )}

            {/* Generate Form */}
            {showGenerateForm && !isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Generate New Proposal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-900">Uncertainty Level</label>
                    <Select value={uncertaintyLevel} onValueChange={setUncertaintyLevel}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select uncertainty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Low - Clear requirements, confident delivery
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Medium - Some uncertainties, need clarification
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            High - Complex requirements, discovery needed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Generate Proposal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGenerateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Proposal Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isEditing ? 'Edit Proposal' : 'Current Proposal'}
                </h3>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSave} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg">
                <Textarea
                  value={proposalContent}
                  onChange={(e) => setProposalContent(e.target.value)}
                  className="min-h-[400px] resize-none border-0 focus:ring-0"
                  placeholder="Proposal content..."
                  readOnly={!isEditing}
                />
              </div>

              {/* Uncertainty Notes */}
              {uncertaintyLevel !== 'low' && (
                <div className={`p-4 rounded-lg ${getUncertaintyColor(uncertaintyLevel)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {uncertaintyLevel === 'medium' ? 'Medium Uncertainty' : 'High Uncertainty'}
                    </span>
                  </div>
                  <p className="text-sm">
                    {uncertaintyLevel === 'medium' 
                      ? 'This project has some uncertainties that should be addressed during development. Consider adding clarification points to your proposal.'
                      : 'This project has complex requirements that may need discovery phase. Consider proposing a detailed planning phase.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalEditModal; 