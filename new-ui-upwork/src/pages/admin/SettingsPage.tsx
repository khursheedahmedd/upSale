import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProposalTemplate } from "@/hooks/use-proposal-template";
import RelevanceCheckToggle from "@/components/RelevanceCheckToggle";
import { FileText, Save, AlertCircle, Play, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api";

const SettingsPage = () => {
  const [localTemplate, setLocalTemplate] = useState("");
  const { template, isLoading, error, saveTemplate, isSaving } = useProposalTemplate();
  
  // Manual job processing state
  const [isProcessingJobs, setIsProcessingJobs] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);

  // Update local template when API template changes (only if user hasn't made changes)
  useEffect(() => {
    console.log('useEffect triggered:', { template, localTemplate, hasLocalTemplate: !!localTemplate });
    if (template && !localTemplate) {
      // Only set local template if it's empty (initial load)
      console.log('Setting initial local template');
      setLocalTemplate(template);
    }
  }, [template, localTemplate]);

  // Handle template changes
  const handleTemplateChange = (value: string) => {
    console.log('Template changed, setting local template');
    setLocalTemplate(value);
  };

  // Save template
  const handleSaveTemplate = async () => {
    await saveTemplate(localTemplate);
  };

  // Reset template to original API value
  const handleResetTemplate = () => {
    if (template) {
      console.log('Resetting template to original value');
      setLocalTemplate(template);
    }
  };

  // Check if template has unsaved changes
  const hasUnsavedChanges = localTemplate !== template && localTemplate !== '';

  // Manual job processing handler
  const handleManualJobProcessing = async () => {
    setIsProcessingJobs(true);
    setProcessingStatus(null);
    setProcessingResult(null);

    try {
      const data = await apiClient.processNewJobsCron();
      setProcessingResult(data);
      setProcessingStatus('success');
    } catch (err: any) {
      setProcessingResult({ error: err.message });
      setProcessingStatus('error');
      console.error('Error processing jobs:', err);
    } finally {
      setIsProcessingJobs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      {/* Relevance Check Section */}
      <RelevanceCheckToggle />

      {/* Manual Job Processing Section - FOR TESTING ONLY */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Manual Job Processing - TESTING ONLY</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="border-amber-300 bg-amber-100 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ WARNING:</strong> This feature is for testing purposes only. 
              It will manually trigger the job processing cron job that normally runs automatically.
              Use only when you need to test the relevance analysis system outside of scheduled hours.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">What this does:</p>
              <p>• Manually triggers the job processing system to analyze new jobs in the database</p>
              <p>• Processes jobs in batches of 3 for parallel analysis</p>
              <p>• Updates job relevance scores and stores results in the database</p>
              <p>• Only processes jobs that haven't been analyzed yet</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleManualJobProcessing}
              disabled={isProcessingJobs}
              variant="outline"
              className="flex items-center space-x-2 border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isProcessingJobs ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Process New Jobs</span>
                </>
              )}
            </Button>
            
            {processingStatus && (
              <div className="text-sm">
                <span className="font-medium">Status: </span>
                <span className={processingStatus === "success" ? "text-green-600" : "text-red-600"}>
                  {processingStatus}
                </span>
              </div>
            )}
          </div>
          
          {processingResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Processing Result:</h4>
              <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-auto max-h-48">
                {JSON.stringify(processingResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Relevance Check Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Test Relevance Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works:</p>
              <p>The relevance check automatically analyzes new jobs during scheduled hours (6:30 PM - 3:30 AM PKT) 
              and assigns relevance scores based on your company profile and team member skills.</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>• Jobs are automatically processed when they are fetched from Upwork</p>
            <p>• Each job receives a relevance score from 0.0 to 1.0</p>
            <p>• Jobs are categorized as Irrelevant, Low, Medium, or Strong match</p>
            <p>• The system considers technology match, portfolio match, project match, and location preferences</p>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Template Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Proposal Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposal-template" className="text-base">
              Edit your proposal template
            </Label>
            <p className="text-sm text-muted-foreground">
              This template will be used as a starting point for generating proposals.
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-48 bg-muted animate-pulse rounded-md"></div>
              <div className="text-sm text-muted-foreground text-center">
                Loading proposal template...
              </div>
            </div>
          ) : (
            <Textarea
              id="proposal-template"
              key="proposal-template-textarea"
              value={localTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter your proposal template here..."
            />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSaveTemplate}
                disabled={isLoading || isSaving || !hasUnsavedChanges}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
              
              {hasUnsavedChanges && (
                <>
                  <Button
                    onClick={handleResetTemplate}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <span className="text-sm text-amber-600 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <span>Unsaved changes</span>
                  </span>
                </>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load template: {error.message}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">Troubleshooting:</p>
                <div className="text-xs text-red-700 space-y-1">
                  <p>• Check if your backend server is running on {import.meta.env.VITE_APP_URL || 'http://localhost:8001'}</p>
                  <p>• Verify the template endpoints are available: /api/template/proposal-template</p>
                  <p>• Check browser console for detailed error logs</p>
                  <p>• Ensure the template file exists in your backend</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
