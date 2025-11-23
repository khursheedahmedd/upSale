import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Edit, Save, X, Copy, Download, Search, Plus, Trash2, CheckCircle, Clock, Star } from "lucide-react";

interface Template {
  id: number;
  name: string;
  content: string;
  job_id?: number;
  job_title?: string;
  created_at: string;
  last_used?: string;
  applications?: number;
  success_rate?: string;
}

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
  onSaveTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: number) => void;
}

const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Sample templates for testing
  const sampleTemplates: Template[] = [
    {
      id: 1,
      name: "General Web Development",
      content: `Dear Client,

I am writing to express my interest in your project.

Based on your requirements, I believe I have the skills and experience needed to deliver excellent results. Here's why I'm a great fit for this project:

• Relevant Experience: [Your experience here]
• Technical Skills: [Your skills here]
• Previous Success: [Your achievements here]

I am committed to delivering high-quality work within your timeline and budget.

I would love to discuss this project in more detail and answer any questions you may have.

Best regards,
[Your Name]`,
      created_at: "2024-01-15T10:00:00Z",
      last_used: "2 days ago",
      applications: 12,
      success_rate: "75%"
    },
    {
      id: 2,
      name: "React/Node.js Projects",
      content: `Dear Client,

I am excited to apply for your React/Node.js project.

With extensive experience in modern web development, I can deliver:

• React/Next.js expertise with TypeScript
• Node.js backend development
• Database design and optimization
• API development and integration
• Responsive UI/UX implementation

I have successfully completed similar projects and can provide references.

Best regards,
[Your Name]`,
      created_at: "2024-01-14T15:30:00Z",
      last_used: "1 week ago",
      applications: 8,
      success_rate: "87%"
    }
  ];

  // Load templates from backend
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_URL}/api/proposal-template/list/`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || sampleTemplates);
      } else {
        setTemplates(sampleTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(sampleTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditedContent(template.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplate = {
        ...selectedTemplate,
        content: editedContent
      };

      await onSaveTemplate(updatedTemplate);
      
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id ? updatedTemplate : t
      ));

      setIsEditing(false);
      setSelectedTemplate(null);
      toast({
        title: "Template Updated",
        description: "Template has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template changes.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await onDeleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Template Copied",
      description: "Template content copied to clipboard.",
    });
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-primary">
                  Template Manager
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Manage and apply your saved proposal templates
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Template List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Badge variant="secondary">
                    {filteredTemplates.length} templates
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {template.last_used || 'Never used'}
                              </span>
                              {template.applications && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {template.applications} applications
                                </span>
                              )}
                              {template.success_rate && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {template.success_rate} success
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTemplate(template);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyTemplate(template.content);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Template Preview/Edit */}
              <div className="space-y-4">
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApplyTemplate(selectedTemplate)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(selectedTemplate)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="min-h-[300px] resize-none"
                          placeholder="Edit template content..."
                        />
                        <div className="flex items-center gap-2">
                          <Button onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setEditedContent(selectedTemplate.content);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 max-h-[300px] overflow-y-auto">
                            {selectedTemplate.content}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <div>
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Select a template to preview</p>
                      <p className="text-sm">or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagerModal; 