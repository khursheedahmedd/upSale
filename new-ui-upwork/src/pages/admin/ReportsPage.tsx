import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Target,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  // Job Performance Data
  const jobStats = {
    totalAnalyzed: 342,
    strongMatches: 127,
    mediumMatches: 98,
    lowMatches: 73,
    irrelevant: 44,
    proposalsGenerated: 89,
    proposalsSubmitted: 67,
    successRate: 75.3,
    avgResponseTime: 2.3
  };

  // Weekly trend data
  const weeklyTrend = [
    { day: "Mon", jobs: 48, proposals: 12, matches: 18 },
    { day: "Tue", jobs: 52, proposals: 15, matches: 21 },
    { day: "Wed", jobs: 45, proposals: 11, matches: 17 },
    { day: "Thu", jobs: 58, proposals: 18, matches: 24 },
    { day: "Fri", jobs: 51, proposals: 14, matches: 19 },
    { day: "Sat", jobs: 43, proposals: 10, matches: 16 },
    { day: "Sun", jobs: 45, proposals: 9, matches: 12 }
  ];

  // Category breakdown
  const categoryBreakdown = [
    { category: "Web Development", count: 89, percentage: 26 },
    { category: "Mobile Development", count: 67, percentage: 20 },
    { category: "AI/ML", count: 54, percentage: 16 },
    { category: "Data Science", count: 48, percentage: 14 },
    { category: "DevOps", count: 42, percentage: 12 },
    { category: "Other", count: 42, percentage: 12 }
  ];

  // Client location data
  const clientLocations = [
    { country: "United States", count: 128, percentage: 37 },
    { country: "United Kingdom", count: 67, percentage: 20 },
    { country: "Canada", count: 45, percentage: 13 },
    { country: "Australia", count: 38, percentage: 11 },
    { country: "Germany", count: 32, percentage: 9 },
    { country: "Others", count: 32, percentage: 10 }
  ];

  // Budget ranges
  const budgetRanges = [
    { range: "$0 - $500", count: 78, percentage: 23 },
    { range: "$500 - $1,000", count: 102, percentage: 30 },
    { range: "$1,000 - $2,500", count: 89, percentage: 26 },
    { range: "$2,500 - $5,000", count: 45, percentage: 13 },
    { range: "$5,000+", count: 28, percentage: 8 }
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comprehensive insights into job matching and proposal performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-8 px-3 text-xs border border-gray-200 rounded-md bg-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Jobs Analyzed</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{jobStats.totalAnalyzed}</div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Strong Matches</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{jobStats.strongMatches}</div>
              <Badge className="bg-green-50 text-green-700 hover:bg-green-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{((jobStats.strongMatches / jobStats.totalAnalyzed) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Proposals Generated</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">{jobStats.proposalsGenerated}</div>
              <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{jobStats.proposalsSubmitted} saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-600">{jobStats.successRate}%</div>
              <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different report views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
          <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly Trend */}
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Weekly Activity
                </CardTitle>
                <CardDescription className="text-xs">Jobs analyzed per day</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {weeklyTrend.map((day, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-12">{day.day}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(day.jobs / 60) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{day.jobs}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Match Distribution */}
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Match Distribution
                </CardTitle>
                <CardDescription className="text-xs">Job relevance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Strong Match
                      </span>
                      <span className="font-semibold">{jobStats.strongMatches}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${(jobStats.strongMatches / jobStats.totalAnalyzed) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Medium Match
                      </span>
                      <span className="font-semibold">{jobStats.mediumMatches}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${(jobStats.mediumMatches / jobStats.totalAnalyzed) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Low Match
                      </span>
                      <span className="font-semibold">{jobStats.lowMatches}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-full rounded-full"
                        style={{ width: `${(jobStats.lowMatches / jobStats.totalAnalyzed) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        Irrelevant
                      </span>
                      <span className="font-semibold">{jobStats.irrelevant}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gray-400 h-full rounded-full"
                        style={{ width: `${(jobStats.irrelevant / jobStats.totalAnalyzed) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Proposals Submitted</p>
                    <p className="text-xl font-bold text-green-600">{jobStats.proposalsSubmitted}</p>
                    <p className="text-xs text-green-600">+18% this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    <p className="text-xl font-bold text-blue-600">{jobStats.avgResponseTime}s</p>
                    <p className="text-xs text-blue-600">-0.3s improvement</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quality Score</p>
                    <p className="text-xl font-bold text-purple-600">92.8%</p>
                    <p className="text-xs text-purple-600">+2.1% this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Job Categories</CardTitle>
              <CardDescription className="text-xs">Distribution of jobs by category</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.count} jobs ({item.percentage}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                        style={{ width: `${item.percentage * 3}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base">Client Locations</CardTitle>
              <CardDescription className="text-xs">Geographic distribution of clients</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {clientLocations.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.country}</span>
                      <span className="text-muted-foreground">{item.count} jobs ({item.percentage}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                        style={{ width: `${item.percentage * 2.5}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Distribution
              </CardTitle>
              <CardDescription className="text-xs">Jobs by budget range</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-3">
                {budgetRanges.map((item, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.range}</span>
                      <span className="text-muted-foreground">{item.count} jobs ({item.percentage}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full"
                        style={{ width: `${item.percentage * 3}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Job Budget</span>
                  <span className="text-xl font-bold text-blue-600">$1,847</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;