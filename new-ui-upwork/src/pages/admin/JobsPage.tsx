import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, Send, X, Shield, BarChart3, Users, DollarSign, Clock, AlertTriangle, CheckCircle, Ban, Edit, Trash2, Download, Upload, Settings, Activity, Sparkles, Briefcase, Bell, BellOff, FileText } from "lucide-react";
import { TableSkeleton, MobileCardsSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ProposalGeneratorModal from "@/components/ProposalGeneratorModal";
import { useAuth } from "@clerk/clerk-react";
import { PropsWithChildren } from 'react';

interface JobsPageProps {
  apiUrl?: string;
}

const sampleUsers = [
  { id: 1, name: "Alice Smith" },
  { id: 2, name: "Bob Johnson" },
  { id: 3, name: "Charlie Lee" }
];

// Sample job data for when backend is not available
const sampleJobs = [
  {
    id: 1,
    title: "React Developer Needed for E-commerce Platform",
    description: "We are looking for an experienced React developer to help us build a modern e-commerce platform. The ideal candidate should have experience with React, TypeScript, and modern web development practices.",
    status: "available",
    currency: "$",
    amount: "2500",
    client_country: "United States",
    client_total_hires: 15,
    client_total_spent: 45000,
    client_verification_status: "Verified",
    publishedDateTime: "2024-01-15T10:30:00Z",
    engagement: "Full-time",
    experienceLevel: "Intermediate",
    category_label: "Web Development",
    subcategory_label: "Frontend Development",
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
    totalApplicants: 12,
    freelancersToHire: 1,
    proposal_count: 8,
    view_count: 45,
    relevance: { score: 0.85 },
    client_feedback_score: 95
  },
  {
    id: 2,
    title: "WordPress Developer for Blog Redesign",
    description: "Need a skilled WordPress developer to redesign our company blog. Must have experience with custom themes, plugins, and WordPress best practices.",
    status: "in-progress",
    currency: "$",
    amount: "1200",
    client_country: "Canada",
    client_total_hires: 8,
    client_total_spent: 22000,
    client_verification_status: "Verified",
    publishedDateTime: "2024-01-14T14:20:00Z",
    engagement: "Part-time",
    experienceLevel: "Expert",
    category_label: "Web Development",
    subcategory_label: "WordPress",
    skills: ["WordPress", "PHP", "CSS", "HTML", "JavaScript"],
    totalApplicants: 6,
    freelancersToHire: 1,
    proposal_count: 4,
    view_count: 28,
    relevance: { score: 0.72 },
    client_feedback_score: 88
  },
  {
    id: 3,
    title: "Mobile App Developer for iOS and Android",
    description: "Looking for a mobile app developer to create a cross-platform application for both iOS and Android. Experience with React Native or Flutter is required.",
    status: "completed",
    currency: "$",
    amount: "5000",
    client_country: "United Kingdom",
    client_total_hires: 25,
    client_total_spent: 85000,
    client_verification_status: "Verified",
    publishedDateTime: "2024-01-13T09:15:00Z",
    engagement: "Full-time",
    experienceLevel: "Expert",
    category_label: "Mobile Development",
    subcategory_label: "Cross-platform",
    skills: ["React Native", "Flutter", "JavaScript", "TypeScript", "Mobile Development"],
    totalApplicants: 18,
    freelancersToHire: 1,
    proposal_count: 12,
    view_count: 67,
    relevance: { score: 0.91 },
    client_feedback_score: 92
  }
];

const JobsPage: React.FC<JobsPageProps> = ({ apiUrl }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    totalBudget: 0
  });
  const [editStatusJob, setEditStatusJob] = useState<any>(null);
  const [assignUserJob, setAssignUserJob] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState('strong'); // Changed default to 'strong'
  const [apiError, setApiError] = useState(false);
  const previousStrongMatchJobIds = useRef<Set<string>>(new Set());
  const isInitialRelevantJobsLoad = useRef(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [nextPollTime, setNextPollTime] = useState<Date>(new Date(Date.now() + 90000));
  const apiUrlToUse = apiUrl || import.meta.env.VITE_APP_URL || "http://localhost:8001";

  const fetchJobsData = useCallback(async (url: string) => {
    setLoading(true);
    try {
      console.log('Environment variables:', import.meta.env);
      
      console.log('Fetching from API URL:', apiUrlToUse);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
      setApiError(false);
      calculateAnalytics(data);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      // Use sample data when API is not available
      setJobs(sampleJobs);
      setApiError(true);
      toast({
        title: "API Unavailable",
        description: "Using sample data. Backend server may not be running.",
        variant: "destructive",
      });
      calculateAnalytics(sampleJobs);
    } finally {
      setLoading(false);
    }
  }, [toast, apiUrlToUse]);

  const showNotification = useCallback((jobTitle: string, jobDescription: string) => {
    console.log('🔔 Attempting to show notification for:', jobTitle);
    console.log('🔍 Notification API available:', "Notification" in window);
    console.log('🔍 Current permission:', Notification.permission);
    
    if ("Notification" in window && Notification.permission === "granted") {
      // Truncate title and description for better display (using the working approach from old frontend)
      const truncatedTitle = jobTitle.length > 100 ? jobTitle.substring(0, 100) + '...' : jobTitle;
      const truncatedDescription = jobDescription.length > 200 ? jobDescription.substring(0, 200) + '...' : jobDescription;
      
      try {
        // Use the proven working notification approach from the old frontend
        const notification = new Notification('New Strong Match Job!', {
          body: `Details: ${truncatedTitle}\n\n${truncatedDescription}`,
          icon: '/logo.png',
          tag: 'new-job-notification',
          silent: false // This ensures the system notification sound plays
        });

        console.log('✅ System notification created successfully with title:', truncatedTitle);
        console.log('✅ Notification object:', notification);
        
        // Add click handler to notification
        notification.onclick = function() {
          window.focus();
          this.close();
          console.log('✅ Notification clicked and closed');
        };

        // Auto-close notification after 10 seconds
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, 10000);
        
      } catch (error) {
        console.error('❌ Error creating notification:', error);
        
        // Fallback to toast only
        toast({
          title: "❌ Notification Error",
          description: `Failed to create system notification: ${error}`,
          variant: "destructive",
          duration: 10000,
        });
      }

      // Show toast notification as well
      toast({
        title: "🎯 New Strong Match Job!",
        description: truncatedTitle,
        duration: 10000,
      });
      
      console.log('✅ Toast notification sent successfully');
    } else {
      console.warn('⚠️ Notifications not available or permission not granted');
      // Fallback to just toast notification
      toast({
        title: "🎯 New Strong Match Job!",
        description: jobTitle,
        duration: 10000,
      });
    }
  }, [toast]);

  const fetchJobsByRelevance = useCallback(async (relevance: string, isPolling: boolean = false) => {
    if (!isPolling) {
      setLoading(true);
    }
    try {
      let fetchedData;
      if (relevance === 'all') {
        const response = await fetch(`${apiUrlToUse}/api/job-listings/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchedData = await response.json();
      } else if (relevance === 'strong') {
        const response = await fetch(`${apiUrlToUse}/api/job-listings/relevance/strong`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchedData = await response.json();
        
        // Process notifications for new strong match jobs
        if (notificationsEnabled) {
          const validJobs = fetchedData.filter((job: any) => job.id != null);
          const currentJobIds = new Set<string>(validJobs.map((job: any) => String(job.id)));

          if (isInitialRelevantJobsLoad.current) {
            previousStrongMatchJobIds.current = currentJobIds;
            isInitialRelevantJobsLoad.current = false;
            console.log('✅ Initial strong match load complete. Stored', previousStrongMatchJobIds.current.size, 'job IDs as baseline. NO NOTIFICATIONS SENT.');
          } else {
            const newStrongMatchJobs = validJobs.filter((job: any) => !previousStrongMatchJobIds.current.has(String(job.id)));
            
            if (newStrongMatchJobs.length > 0) {
              console.log(`🔔 Found ${newStrongMatchJobs.length} new strong match jobs!`);
              
              // Show system notifications for each new job FIRST (this is the main requirement)
              newStrongMatchJobs.forEach((job: any) => {
                console.log('🔔 Sending notification for job:', job.title);
                showNotification(job.title, job.description || 'No description available');
              });
              
              // Then show a summary toast notification
              toast({
                title: `🎯 ${newStrongMatchJobs.length} New Strong Match Job${newStrongMatchJobs.length > 1 ? 's' : ''} Found!`,
                description: `System notifications have been sent for each new job.`,
                duration: 10000,
              });
              
              // Update the tracking set with new job IDs
              newStrongMatchJobs.forEach((job: any) => {
                previousStrongMatchJobIds.current.add(String(job.id));
              });
            }
          }
        }
        
        // Update the ref with current strong match job IDs
        previousStrongMatchJobIds.current = new Set(fetchedData.map((job: any) => String(job.id)));
      }
      
      // Update jobs state
      if (!isPolling || (isPolling && relevance === 'strong')) {
        setJobs(prevJobs => {
          if (relevance === 'all' || !isPolling) {
            return fetchedData;
          }
          // For polling, merge new jobs
          const existingJobIds = new Set(prevJobs.map(job => String(job.id)));
          const newJobsToAdd = fetchedData.filter((job: any) => !existingJobIds.has(String(job.id)));
          if (newJobsToAdd.length > 0) {
            return [...newJobsToAdd, ...prevJobs];
          }
          return prevJobs;
        });
      }

      setApiError(false);
      calculateAnalytics(fetchedData);
      if (!isPolling) {
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching jobs by relevance:', error);
      if (!isPolling) {
        setJobs(sampleJobs);
        setApiError(true);
        toast({
          title: "API Unavailable",
          description: "Using sample data. Backend server may not be running.",
          variant: "destructive",
        });
        calculateAnalytics(sampleJobs);
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [showNotification, toast, notificationsEnabled, apiUrlToUse]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const currentPermission = Notification.permission;
      
      if (currentPermission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        // Reset previous jobs ref when enabling notifications
        previousStrongMatchJobIds.current = new Set();
        isInitialRelevantJobsLoad.current = true;
        
        toast({
          title: "🔔 Notifications Enabled",
          description: "You will now receive system notifications for new strong match jobs.",
        });
      } else {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            localStorage.setItem('notificationsEnabled', 'true');
            previousStrongMatchJobIds.current = new Set();
            isInitialRelevantJobsLoad.current = true;
            
            toast({
              title: "🔔 Notifications Enabled",
              description: "You will now receive system notifications for new strong match jobs.",
            });
            

          } else {
            toast({
              title: "❌ Notification Permission Denied",
              description: "Please enable notifications in your browser settings to receive job alerts.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      previousStrongMatchJobIds.current = new Set();
      isInitialRelevantJobsLoad.current = true;
      
      toast({
        title: "🔕 Notifications Disabled",
        description: "You will no longer receive notifications for new strong match jobs.",
      });
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (relevanceFilter === 'strong') {
      fetchJobsByRelevance('strong');
    } else {
      fetchJobsData(`${apiUrlToUse}/api/job-listings/`);
    }
  };

  // Start polling for new strong match jobs
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      if (relevanceFilter === 'strong' && notificationsEnabled) {
        console.log('🔄 Polling for new strong match jobs...');
        // Pass isPolling as true to fetchJobsByRelevance for proper notification handling
        fetchJobsByRelevance('strong', true);
        setNextPollTime(new Date(Date.now() + 90000));
      }
    }, 90000); // Poll every 90 seconds
    
    setPollingInterval(interval);
    setNextPollTime(new Date(Date.now() + 90000));
    return interval;
  }, [relevanceFilter, notificationsEnabled, fetchJobsByRelevance]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Update next poll time when relevance filter changes
  useEffect(() => {
    if (relevanceFilter === 'strong' && notificationsEnabled) {
      setNextPollTime(new Date(Date.now() + 90000));
    }
  }, [relevanceFilter, notificationsEnabled]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Initial fetch - always fetch strong match jobs by default
    fetchJobsByRelevance('strong');

    // Request notification permission on component mount
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.warn("Notification permission denied or dismissed.");
        }
      });
    }
  }, [isLoaded, isSignedIn, fetchJobsByRelevance]);

  // Handle relevance filter changes
  useEffect(() => {
    if (relevanceFilter === 'strong') {
      fetchJobsByRelevance('strong');
    } else if (relevanceFilter === 'all') {
      fetchJobsData(`${apiUrlToUse}/api/job-listings/`);
    }
  }, [relevanceFilter, fetchJobsByRelevance, fetchJobsData, apiUrlToUse]);

  // Start/stop polling based on relevance filter and notification settings
  useEffect(() => {
    if (relevanceFilter === 'strong' && notificationsEnabled) {
      const interval = startPolling();
      return () => {
        clearInterval(interval);
      };
    } else {
      stopPolling();
    }
  }, [relevanceFilter, notificationsEnabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };



  const calculateAnalytics = (jobsData: any[]) => {
    const total = jobsData.length;
    const active = jobsData.filter(job => job.status === 'active' || job.status === 'available').length;
    const completed = jobsData.filter(job => job.status === 'completed').length;
    const pending = jobsData.filter(job => job.status === 'submitted' || job.status === 'in-progress').length;
    const totalBudget = jobsData.reduce((sum, job) => sum + (parseFloat(job.amount) || 0), 0);

    setAnalytics({ total, active, completed, pending, totalBudget });
  };

  const getStatusColor = (status: string) => {
    if (status && status.toLowerCase() === 'active') return 'bg-green-500 text-white';
    switch (status) {
      case 'available': return 'bg-status-available text-white';
      case 'in-progress': return 'bg-status-in-progress text-white';
      case 'completed': return 'bg-status-completed text-white';
      case 'irrelevant': return 'bg-status-irrelevant text-white';
      case 'submitted': return 'bg-status-submitted text-white';
      default: return 'bg-muted';
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedJobs.size === 0) return;
    
    const selectedJobIds = Array.from(selectedJobs);
    const updatedJobs = jobs.map(job => {
      if (selectedJobIds.includes(job.id)) {
        return { ...job, status: action };
      }
      return job;
    });
    
    setJobs(updatedJobs);
    setSelectedJobs(new Set());
    setBulkAction("");
    calculateAnalytics(updatedJobs);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleSelectJob = (jobId: number, checked: boolean) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  let sortedJobs = filteredJobs;

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    return <div className="flex items-center justify-center min-h-screen">Please sign in to view jobs.</div>;
  }

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <TableSkeleton />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* API Error Notice */}
      {apiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700">
                Backend API is not available. Showing sample data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-teal-50/30 to-emerald-100/40 rounded-2xl shadow-xl border border-teal-100/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl shadow-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 bg-clip-text text-transparent mb-2">
                  Jobs Management
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-teal-700 font-medium">Smart job discovery & management</p>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-700">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Status and Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl shadow-sm">
                <Activity className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">
                  {analytics.total} Jobs • {analytics.active} Active
                </span>
              </div>
              
              <Button
                onClick={handleManualRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-white/70 backdrop-blur-sm border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl"
              >
                <div className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}>
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Status Indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-700">Live Updates Active</span>
          </div>
          {notificationsEnabled && (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 rounded-full">
              <Bell className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">System Notifications ON</span>
            </div>
          )}
          {relevanceFilter === 'strong' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-teal-100 rounded-full">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-xs font-semibold text-teal-700">Strong Match Filter</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-700">Auto-refresh: 90s</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 shadow-xl border-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/20">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search Input */}
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-blue-600">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search jobs by title, client, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
              />
              {searchTerm && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Enhanced Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Enhanced Relevance Filter */}
              <div className="relative">
                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger className="w-48 h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Filter by Relevance" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl">
                    <SelectItem value="all" className="py-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">All Jobs</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="strong" className="py-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">Strong Match</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Enhanced Notification Toggle */}
              <Button 
                onClick={toggleNotifications}
                variant={notificationsEnabled ? "default" : "outline"}
                className={`h-14 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  notificationsEnabled 
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-0" 
                    : "bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700"
                }`}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <BellOff className="w-5 h-5 mr-2" />
                    Enable Notifications
                  </>
                )}
              </Button>
              
                        {/* Test Notification Button */}
          {notificationsEnabled && (
            <Button
              onClick={() => showNotification("Test Job", "This is a test notification to verify the system is working correctly.")}
              variant="outline"
              size="sm"
              className="h-14 px-4 bg-white/80 backdrop-blur-sm border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 text-teal-700 transition-all duration-300 shadow-sm hover:shadow-md rounded-xl"
            >
              <Bell className="w-4 h-4 mr-2" />
              Test
            </Button>
          )}
          

          

          

            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Bulk Actions */}
      {selectedJobs.size > 0 && (
        <Card className="p-5 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-lg font-bold text-blue-900">{selectedJobs.size}</span>
                <span className="text-sm font-medium text-blue-700 ml-2">
                  {selectedJobs.size === 1 ? 'job selected' : 'jobs selected'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-44 h-11 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg bg-white shadow-sm">
                  <SelectValue placeholder="Choose Action" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl">
                  <SelectItem value="available" className="py-2">✅ Mark Available</SelectItem>
                  <SelectItem value="in-progress" className="py-2">⏳ Mark In Progress</SelectItem>
                  <SelectItem value="completed" className="py-2">🎉 Mark Completed</SelectItem>
                  <SelectItem value="irrelevant" className="py-2">❌ Mark Irrelevant</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                onClick={() => handleBulkAction(bulkAction)}
                disabled={!bulkAction}
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Apply Changes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedJobs(new Set())}
                className="h-11 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Jobs Table */}
      <Card className="overflow-hidden shadow-2xl border-0 bg-white">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="table-auto w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-800">
                    <Checkbox 
                      checked={selectedJobs.size === sortedJobs.length && sortedJobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Job Details</th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Status</th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Budget & Timeline</th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Client Info</th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Published</th>
                  <th className="text-left p-4 font-bold text-gray-800 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job, index) => (
                  <tr key={job.id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 align-middle group ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}>
                    <td className="p-4">
                      <Checkbox 
                        checked={selectedJobs.has(job.id)}
                        onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4 pr-0">
                      <div className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-900 transition-colors">{job.title}</div>
                      <div className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {job.description
                          ? job.description.split(" ").slice(0, 15).join(" ") + (job.description.split(" ").length > 15 ? "..." : "")
                          : ""}
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Engagement:</span> 
                          <span className="text-gray-600">{job.engagement || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <BarChart3 className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Experience:</span> 
                          <span className="text-gray-600">{job.experienceLevel || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <ProposalGeneratorModal
                          job={job}
                          trigger={
                            <Button
                              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white flex items-center gap-2 justify-center text-xs py-2 px-4 max-w-xs rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                              size="sm"
                            >
                              <Sparkles className="w-4 h-4" />
                              Generate Proposal
                            </Button>
                          }
                        />
                      </div>
                    </td>
                    <td className="p-4 pl-0">
                      <div className="space-y-1">
                        <Button
                          variant={
                            job.status === 'available' ? 'default' :
                            job.status === 'submitted' ? 'secondary' :
                            job.status === 'in-progress' ? 'outline' :
                            job.status === 'completed' ? 'default' :
                            job.status === 'irrelevant' ? 'destructive' :
                            'outline'
                          }
                          size="sm"
                          className={`flex items-center gap-2 shadow-sm px-3 py-1.5 rounded-full font-semibold text-xs ${getStatusColor(job.status)}`}
                          disabled
                        >
                          {job.status === 'available' && <Briefcase className="w-3 h-3 mr-1 text-green-600" />}
                          {job.status === 'submitted' && <Clock className="w-3 h-3 mr-1 text-blue-600" />}
                          {job.status === 'in-progress' && <CheckCircle className="w-3 h-3 mr-1 text-yellow-600" />}
                          {job.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1 text-green-700" />}
                          {job.status === 'irrelevant' && <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />}
                          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 pl-0">
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-green-700">{job.currency} {job.amount}</div>
                        <div className="text-sm text-gray-600">
                          {job.durationLabel || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">{job.client_country}</div>
                        <div className="text-sm text-gray-600">
                          {job.client_total_hires !== undefined ? `${job.client_total_hires} hires` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {job.client_total_spent !== undefined ? `$${job.client_total_spent} spent` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {job.client_verification_status || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700 font-medium">
                        {job.publishedDateTime ? new Date(job.publishedDateTime).toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-normal break-words">
                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader className="pb-4 border-b">
                              <DialogTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Job Review
                              </DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">
                                Comprehensive job analysis and management controls
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2">
                                <a 
                                  href={`https://www.upwork.com/jobs/~02${job.id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                                >
                                  View on Upwork
                                </a>
                                <Button variant="outline" size="sm" onClick={() => { setEditStatusJob(job); setSelectedStatus(job.status); }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Status
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { setAssignUserJob(job); setSelectedUser(job.assigned_user || ""); }}>
                                  <Users className="h-4 w-4 mr-2" />
                                  Assign User
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Ban className="h-4 w-4 mr-2" />
                                      Mark Irrelevant
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Mark Job as Irrelevant</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will mark the job as irrelevant and remove it from active listings. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <Activity className="h-4 w-4" />
                                      Job Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <Button
                                          variant={
                                            job.status === 'available' ? 'default' :
                                            job.status === 'submitted' ? 'secondary' :
                                            job.status === 'in-progress' ? 'outline' :
                                            job.status === 'completed' ? 'default' :
                                            job.status === 'irrelevant' ? 'destructive' :
                                            'outline'
                                          }
                                          size="sm"
                                          className={`flex items-center gap-1 shadow-sm px-3 py-1.5 rounded-full font-semibold text-xs ${getStatusColor(job.status)}`}
                                          disabled
                                        >
                                          {job.status === 'available' && <Briefcase className="w-3 h-3 mr-1 text-green-600" />}
                                          {job.status === 'submitted' && <Clock className="w-3 h-3 mr-1 text-blue-600" />}
                                          {job.status === 'in-progress' && <CheckCircle className="w-3 h-3 mr-1 text-yellow-600" />}
                                          {job.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1 text-green-700" />}
                                          {job.status === 'irrelevant' && <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />}
                                          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                                        </Button>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Budget:</span>
                                        <span className="font-medium">{job.currency} {job.amount}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Country:</span>
                                        <span className="font-medium">{job.client_country}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Published:</span>
                                        <span className="font-medium">{job.publishedDateTime ? new Date(job.publishedDateTime).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Applicants:</span>
                                        <span className="font-medium">{job.totalApplicants || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Freelancers to Hire:</span>
                                        <span className="font-medium">{job.freelancersToHire || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Engagement:</span>
                                        <span className="font-medium">{job.engagement || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Analytics
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Relevance Score:</span>
                                        <span className="font-medium">{job.relevance?.score ? `${(job.relevance.score * 100).toFixed(1)}%` : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Client Rating:</span>
                                        <span className="font-medium">{job.client_feedback_score ? `${job.client_feedback_score}%` : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Proposal Count:</span>
                                        <span className="font-medium">{job.proposal_count || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Views:</span>
                                        <span className="font-medium">{job.view_count || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <DollarSign className="h-4 w-4" />
                                      Client Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Hires:</span>
                                        <span className="font-medium">{job.client_total_hires || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Posted Jobs:</span>
                                        <span className="font-medium">{job.client_total_posted_jobs || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Total Spent:</span>
                                        <span className="font-medium">{job.client_total_spent ? `$${job.client_total_spent}` : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Verification Status:</span>
                                        <span className="font-medium">{job.client_verification_status || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Location:</span>
                                        <span className="font-medium">{job.client_location_city}, {job.client_location_state}, {job.client_country}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Timezone:</span>
                                        <span className="font-medium">{job.client_location_timezone || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Offset to UTC:</span>
                                        <span className="font-medium">{job.client_location_offsetToUTC || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Category & Skills
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{job.category_label}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Subcategory:</span>
                                        <span className="font-medium">{job.subcategory_label}</span>
                                </div>
                                <div>
                                        <span className="text-gray-600">Skills:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {Array.isArray(job.skills) ? job.skills.map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                          )) : <span className="font-medium">{job.skills}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Job Description */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {job.description || 'No description available'}
                              </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {sortedJobs.map((job) => (
              <Card key={job.id} className="block md:hidden">
                <CardContent>
                  <div className="font-medium text-base mb-1">{job.title}</div>
                  <div className="truncate text-sm text-muted-foreground mb-2 whitespace-normal break-words">
                    {job.description
                      ? job.description.split(" ").slice(0, 15).join(" ") + (job.description.split(" ").length > 15 ? "..." : "")
                      : ""}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Engagement:</span> {job.engagement || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Experience Level:</span> {job.experienceLevel || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <ProposalGeneratorModal
                      job={job}
                      trigger={
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center text-xs py-1.5 px-2 max-w-xs"
                          size="sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate & Edit Proposal
                        </Button>
                      }
                    />
                  </div>
                  {/* Other actions/info as needed */}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={!!editStatusJob} onOpenChange={() => setEditStatusJob(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Status</DialogTitle>
            <DialogDescription>Change the status for <b>{editStatusJob?.title}</b></DialogDescription>
          </DialogHeader>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditStatusJob(null)}>Cancel</Button>
            <Button onClick={() => {
              setJobs(jobs => jobs.map(j => j.id === editStatusJob.id ? { ...j, status: selectedStatus } : j));
              setEditStatusJob(null);
              toast({ title: "Status Updated", description: `Job status updated to ${selectedStatus}.` });
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={!!assignUserJob} onOpenChange={() => setAssignUserJob(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>Assign a user to <b>{assignUserJob?.title}</b></DialogDescription>
          </DialogHeader>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {sampleUsers.map(user => (
                <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAssignUserJob(null)}>Cancel</Button>
            <Button onClick={() => {
              setJobs(jobs => jobs.map(j => j.id === assignUserJob.id ? { ...j, assigned_user: selectedUser } : j));
              setAssignUserJob(null);
              toast({ title: "User Assigned", description: `Assigned ${selectedUser} to job.` });
            }}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="flex flex-col gap-3 items-end">
          {/* Quick Stats Tooltip */}
          <div className="bg-white/90 backdrop-blur-sm border border-teal-200 rounded-lg px-4 py-2 shadow-lg">
            <div className="text-xs text-gray-600 text-right">
              <div className="font-semibold text-teal-600">{jobs.length} jobs loaded</div>
              <div>{relevanceFilter === 'strong' ? 'Strong matches only' : 'All jobs'}</div>
            </div>
          </div>
          
          {/* Main FAB */}
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
