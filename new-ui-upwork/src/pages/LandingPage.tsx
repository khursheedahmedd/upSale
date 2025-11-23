import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  Target, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Award
} from "lucide-react";
import { useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Job Matching",
      description: "IBM watsonx.ai analyzes thousands of jobs to find perfect matches for your skills and experience.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: FileText,
      title: "Automated Proposal Generation",
      description: "Generate personalized, winning proposals in seconds using IBM Granite 3.3 8B model.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Brain,
      title: "RAG-Enhanced Context",
      description: "Retrieval Augmented Generation ensures proposals are tailored to your company profile.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Target,
      title: "Smart Relevance Scoring",
      description: "Multi-dimensional analysis scores jobs on technology, portfolio, and location match.",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Zap,
      title: "Multi-Agent Orchestration",
      description: "IBM watsonx ADK coordinates 4 specialized agents for optimal workflow automation.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Shield,
      title: "Enterprise Governance",
      description: "Built-in compliance tracking, audit logging, and model usage monitoring.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const stats = [
    { label: "Jobs Analyzed", value: "10K+", icon: BarChart3 },
    { label: "Success Rate", value: "85%", icon: TrendingUp },
    { label: "Time Saved", value: "90%", icon: Clock },
    { label: "Active Users", value: "500+", icon: Users }
  ];

  const benefits = [
    "Save 90% of time on job searching and proposal writing",
    "Increase proposal acceptance rate by 3x",
    "Focus on high-value opportunities only",
    "Track team performance with detailed analytics",
    "Ensure compliance with governance tools",
    "Scale your Upwork business efficiently"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">IBM Sales Navigator</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/sign-in")}
                className="text-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/sign-up")}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by IBM watsonx.ai
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              AI-Powered Upwork
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Job Automation
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your Upwork workflow with IBM watsonx.ai. Automatically match jobs, 
              generate winning proposals, and scale your freelancing business with enterprise-grade AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/sign-up")}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-lg px-8 h-12"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/sign-in")}
                className="text-lg px-8 h-12 border-2"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="p-3 bg-purple-100 rounded-full">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <stat.icon className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to dominate Upwork with AI-powered automation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`${feature.bgColor} p-3 rounded-lg w-fit mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200">
                <Award className="h-4 w-4 mr-2" />
                Enterprise-Grade Solution
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose IBM Sales Navigator?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                onClick={() => navigate("/sign-up")}
                className="mt-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Card className="p-8 bg-white shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Bot className="h-10 w-10 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Job Matching Agent</p>
                      <p className="text-sm text-gray-600">IBM Granite 3.3 8B</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <FileText className="h-10 w-10 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Proposal Generator</p>
                      <p className="text-sm text-gray-600">IBM Granite 3.3 8B</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <Brain className="h-10 w-10 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Context Retrieval</p>
                      <p className="text-sm text-gray-600">RAG + FAISS</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                    <Zap className="h-10 w-10 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Batch Processing</p>
                      <p className="text-sm text-gray-600">IBM Granite 3.3 8B</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Upwork Business?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join hundreds of successful freelancers using AI to scale their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/sign-up")}
              className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-8 h-12"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/sign-in")}
              className="text-white border-2 border-white hover:bg-white/10 text-lg px-8 h-12"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">IBM Sales Navigator</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered Upwork automation using IBM watsonx.ai
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 IBM Sales Navigator for Upwork. Powered by IBM watsonx.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

