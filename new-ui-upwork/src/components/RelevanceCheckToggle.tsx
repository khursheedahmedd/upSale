import React from 'react';
import { Switch } from "@/components/ui/switch";
import { useRelevanceCheck } from '@/hooks/use-relevance-check';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RelevanceCheckToggle = () => {
  const { status, isLoading, error, toggleRelevance, isToggling } = useRelevanceCheck();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-muted-foreground">Loading relevance status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load relevance check status: {error.message}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">Debug Information:</p>
            <div className="text-xs text-red-700 space-y-1">
              <p>• Check if your backend server is running</p>
              <p>• Verify the API URL in your environment variables</p>
              <p>• Check browser console for detailed error logs</p>
              <p>• Ensure the relevance check endpoints are available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = () => {
    if (status) {
      toggleRelevance(!status.is_enabled_override);
    }
  };

  if (!status) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No relevance status data available
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Relevance Check Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Switch
            id="relevance-check"
            checked={status.is_enabled_override}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
          <label
            htmlFor="relevance-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Enable Relevance Check
          </label>
          {isToggling && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {status.is_within_schedule
                ? "Currently within scheduled hours (6:30 PM - 3:30 AM PKT)"
                : "Outside scheduled hours"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Manual Override: {status.is_enabled_override ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={status.effective_status ? "default" : "secondary"}>
              {status.effective_status ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Effective Status
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          The relevance check automatically runs during scheduled hours (6:30 PM - 3:30 AM PKT) 
          unless manually disabled. You can override this setting at any time.
        </div>
      </CardContent>
    </Card>
  );
};

export default RelevanceCheckToggle;
