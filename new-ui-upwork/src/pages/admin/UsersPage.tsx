import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award,
  Target,
  Mail,
  Calendar,
  BarChart3
} from "lucide-react";

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Team members data
  const teamMembers = [
    {
      id: "1",
      name: "Khursheed Ahmad",
      email: "khursheed.ahmad@company.com",
      role: "Senior Proposal Writer",
      avatar: "KA",
      status: "active",
      stats: {
        assignedJobs: 34,
        completedProposals: 0,
        successRate: 82.4,
        avgResponseTime: 1.8,
        thisWeek: 8,
        thisMonth: 28
      },
      recentActivity: [
        { job: "React Developer for E-commerce", status: "assigned", date: "2 hours ago" },
        { job: "Full Stack Engineer - SaaS Platform", status: "assigned", date: "5 hours ago" },
        { job: "Frontend Developer - Mobile App", status: "assigned", date: "1 day ago" }
      ]
    },
    {
      id: "2",
      name: "Saadain Haider",
      email: "saadain.haider@company.com",
      role: "Technical Writer",
      avatar: "SH",
      status: "active",
      stats: {
        assignedJobs: 9,
        completedProposals: 0,
        successRate: 82.8,
        avgResponseTime: 2.1,
        thisWeek: 6,
        thisMonth: 9,
      },
      recentActivity: [
        { job: "Python Developer - AI/ML Project", status: "assigned", date: "3 hours ago" },
        { job: "Backend Engineer - API Development", status: "assigned", date: "6 hours ago" },
        { job: "DevOps Engineer - Cloud Infrastructure", status: "assigned", date: "1 day ago" }
      ]
    },
   
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "in-progress":
        return <Clock className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Calculate team totals
  const teamTotals = {
    totalAssigned: teamMembers.reduce((sum, user) => sum + user.stats.assignedJobs, 0),
    totalCompleted: teamMembers.reduce((sum, user) => sum + user.stats.completedProposals, 0),
    avgSuccessRate: (teamMembers.reduce((sum, user) => sum + user.stats.successRate, 0) / teamMembers.length).toFixed(1),
    avgResponseTime: (teamMembers.reduce((sum, user) => sum + user.stats.avgResponseTime, 0) / teamMembers.length).toFixed(1)
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track individual progress and job assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-1 text-xs">
            <Users className="h-3 w-3 mr-1.5" />
            {teamMembers.length} Active Members
          </Badge>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Assigned</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{teamTotals.totalAssigned}</div>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">jobs across team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{teamTotals.totalCompleted}</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">proposals submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">{teamTotals.avgSuccessRate}%</div>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-600">{teamTotals.avgResponseTime}s</div>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">per proposal</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">{member.name}</h3>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 text-xs h-5">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="text-lg font-bold text-blue-600">{member.stats.assignedJobs}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-md">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold text-green-600">{member.stats.completedProposals}</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">{member.stats.successRate}%</span>
                </div>
                <Progress value={member.stats.successRate} className="h-1.5" />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">This week:</span>
                  <span className="font-semibold">{member.stats.thisWeek}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-semibold">{member.stats.avgResponseTime}s</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2">Recent Activity</p>
                <div className="space-y-1.5">
                  {member.recentActivity.slice(0, 2).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{activity.job}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-xs h-4 px-1.5 ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 text-xs"
                  onClick={() => setSelectedUser(member.id)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-600" />
            Top Performers This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            {teamMembers
              .sort((a, b) => b.stats.successRate - a.stats.successRate)
              .slice(0, 3)
              .map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.stats.thisMonth} proposals this month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{member.stats.successRate}%</p>
                    <p className="text-xs text-muted-foreground">success rate</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;