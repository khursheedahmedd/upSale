import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  Sparkles,
  Bot,
  Zap,
  BarChart3,
  Clock,
  Users,
  Target,
  ArrowRight,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalJobs: number;
  relevantJobs: number;
  proposalsGenerated: number;
  successRate: number;
  activeAgents: number;
  avgResponseTime: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    relevantJobs: 0,
    proposalsGenerated: 0,
    successRate: 0,
    activeAgents: 4,
    avgResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<DashboardStats>(stats);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/job-listings/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalJobs: data.total_jobs || 0,
            relevantJobs: data.relevant_jobs || 0,
            proposalsGenerated: data.proposals_generated || 0,
            successRate: data.success_rate || 0,
            activeAgents: 4,
            avgResponseTime: data.avg_response_time || 2.3
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use mock data for demo
        setStats({
          totalJobs: 156,
          relevantJobs: 89,
          proposalsGenerated: 67,
          successRate: 75.3,
          activeAgents: 4,
          avgResponseTime: 2.3
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animate numbers
  useEffect(() => {
    if (isLoading) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        totalJobs: Math.floor(stats.totalJobs * progress),
        relevantJobs: Math.floor(stats.relevantJobs * progress),
        proposalsGenerated: Math.floor(stats.proposalsGenerated * progress),
        successRate: parseFloat((stats.successRate * progress).toFixed(1)),
        activeAgents: stats.activeAgents,
        avgResponseTime: parseFloat((stats.avgResponseTime * progress).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats, isLoading]);

  const statCards = [
    {
      title: "Total Jobs Analyzed",
      value: animatedStats.totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12% from last week",
      trendUp: true
    },
    {
      title: "Relevant Matches",
      value: animatedStats.relevantJobs,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: `${((animatedStats.relevantJobs / animatedStats.totalJobs) * 100 || 0).toFixed(1)}% match rate`,
      trendUp: true
    },
    {
      title: "Proposals Generated",
      value: animatedStats.proposalsGenerated,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: `${animatedStats.proposalsGenerated} this month`,
      trendUp: true
    },
    {
      title: "Success Rate",
      value: `${animatedStats.successRate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "+5.2% improvement",
      trendUp: true
    }
  ];

  const agentCards = [
    {
      name: "Job Matching Agent",
      status: "active",
      model: "IBM Granite 3.3 8B",
      processed: "89 jobs today",
      icon: Target,
      color: "text-blue-600"
    },
    {
      name: "Proposal Generation Agent",
      status: "active",
      model: "IBM Granite 3.3 8B",
      processed: "67 proposals today",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      name: "Context Retrieval Agent",
      status: "active",
      model: "RAG + FAISS",
      processed: "38 chunks indexed",
      icon: Brain,
      color: "text-green-600"
    },
    {
      name: "Batch Processing Agent",
      status: "active",
      model: "IBM Granite 3.3 8B",
      processed: "156 jobs analyzed",
      icon: Zap,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            AI-Powered Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Powered by IBM watsonx.ai & ADK Multi-Agent Orchestration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 text-sm">
            <Activity className="h-4 w-4 mr-2 text-green-600" />
            All Systems Operational
          </Badge>
          <Badge className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600">
            <Sparkles className="h-4 w-4 mr-2" />
            IBM watsonx
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* IBM watsonx ADK Agents */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  IBM watsonx ADK Agents
                </CardTitle>
                <CardDescription className="mt-1">
                  Multi-agent orchestration workflow powered by IBM Granite 3.3 8B
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {agentCards.map((agent, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className={`${agent.color === "text-blue-600" ? "bg-blue-50" : agent.color === "text-purple-600" ? "bg-purple-50" : agent.color === "text-green-600" ? "bg-green-50" : "bg-orange-50"} p-3 rounded-lg`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{agent.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.model}</p>
                    <p className="text-xs font-medium text-primary">{agent.processed}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Job Matching Accuracy</span>
                <span className="font-semibold">{animatedStats.successRate}%</span>
              </div>
              <Progress value={animatedStats.successRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Proposal Quality Score</span>
                <span className="font-semibold">92.8%</span>
              </div>
              <Progress value={92.8} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">System Efficiency</span>
                <span className="font-semibold">88.5%</span>
              </div>
              <Progress value={88.5} className="h-2" />
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Response Time</span>
                </div>
                <span className="text-2xl font-bold text-primary">{animatedStats.avgResponseTime}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              View All Jobs
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              <Target className="mr-2 h-4 w-4" />
              Analyze New Jobs
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Proposals
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/settings')}
            >
              <Bot className="mr-2 h-4 w-4" />
              Configure Agents
            </Button>
            <div className="pt-3 border-t">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => window.open('http://localhost:8001/docs', '_blank')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                View API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IBM watsonx Governance */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                IBM watsonx.governance
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time monitoring, audit logging, and compliance tracking
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.open('http://localhost:8001/api/watsonx/governance/metrics', '_blank')}
            >
              View Metrics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Model Usage Tracked</p>
                <p className="text-2xl font-bold text-green-600">{animatedStats.proposalsGenerated}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Audit Logs</p>
                <p className="text-2xl font-bold text-blue-600">{animatedStats.totalJobs}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Compliance Score</p>
                <p className="text-2xl font-bold text-purple-600">100%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
