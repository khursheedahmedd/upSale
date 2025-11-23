import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Edit, Save, X, Copy, Download } from "lucide-react";

interface SimpleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateContent: string;
  onSave: (content: string) => void;
  loading?: boolean;
  error?: string;
  jobTitle?: string;
  jobId?: number;
}

const SimpleTemplateModal: React.FC<SimpleTemplateModalProps> = ({
  isOpen,
  onClose,
  templateContent,
  onSave,
  loading = false,
  error,
  jobTitle,
  jobId
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedTemplate(templateContent);
  }, [templateContent]);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(editedTemplate);
      setIsEditing(false);
      toast({
        title: "Template Saved",
        description: "Your proposal template has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(editedTemplate);
    toast({
      title: "Template Copied",
      description: "Proposal template copied to clipboard.",
    });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([editedTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-template-${jobId || 'default'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Template Downloaded",
      description: "Proposal template has been downloaded.",
    });
  };

  const handleCancelEdit = () => {
    setEditedTemplate(templateContent);
    setIsEditing(false);
    toast({
      title: "Changes Discarded",
      description: "Template changes have been discarded.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-primary">
                  Edit Proposal Template
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {jobTitle ? `Customize your proposal for: ${jobTitle}` : 'Edit your proposal template'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {jobId && (
                <Badge variant="outline" className="text-xs">
                  Job #{jobId}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading template...</p>
              </div>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <X className="h-4 w-4" />
                  <p>Error loading template: {error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <div className="space-y-4 h-full">
              {/* Template Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={isEditing ? "default" : "secondary"}>
                    {isEditing ? "Editing Mode" : "View Mode"}
                  </Badge>
                  {jobTitle && (
                    <Badge variant="outline">
                      {jobTitle}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTemplate}
                    disabled={isEditing}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={isEditing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Template Content */}
              <Card className="flex-1 min-h-[400px]">
                <CardContent className="p-0 h-full">
                  {isEditing ? (
                    <Textarea
                      value={editedTemplate}
                      onChange={(e) => setEditedTemplate(e.target.value)}
                      placeholder="Enter your proposal template here..."
                      className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
                      style={{ fontFamily: 'monospace' }}
                    />
                  ) : (
                    <div className="p-4 h-full overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700">
                        {templateContent}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isEditing ? "Make changes to your proposal template" : "Review your proposal template"}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimpleTemplateModal; 