import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { TrendingUp, Users, Target, Zap, BarChart3, Calendar, Activity, ArrowRight, Brain, Rocket, Shield, Building } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadEmails, setUnreadEmails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [credibilityAnalysis, setCredibilityAnalysis] = useState([]);

  // Update time every minute for live greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch unread emails when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetch("/api/emails/unread")
        .then((res) => res.json())
        .then((data) => {
          console.log("Dashboard received processed data:", data);
          setUnreadEmails(data.emails || []);
          setUnreadCount(data.count || 0);
          setCredibilityAnalysis(data.credibility_analysis || []);
        })
        .catch((error) => {
          console.error("Error fetching unread emails:", error);
          toast({
            title: "Error",
            description: "Failed to fetch unread emails.",
            variant: "destructive",
          });
          // Set empty state on error
          setUnreadEmails([]);
          setUnreadCount(0);
        });
    }
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-green-400 text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    // Get current time in Indian timezone (IST)
    const indianTime = new Date(currentTime).toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const hour = new Date(indianTime).getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Setup AI Assistant",
      description: "Configure your personalized AI co-pilot",
      icon: Brain,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      action: () => toast({ title: "Coming Soon", description: "AI Assistant setup will be available soon." })
    },
    {
      title: "View Analytics",
      description: "Track your productivity metrics",
      icon: BarChart3,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      action: () => toast({ title: "Coming Soon", description: "Analytics dashboard coming soon." })
    },
    {
      title: "Team Collaboration",
      description: "Invite team members to join",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      action: () => toast({ title: "Coming Soon", description: "Team features coming soon." })
    }
  ];



  const stats = [
    {
      title: "Total Mail",
      value: "247",
      change: "This Week",
      icon: Target,
      color: "text-orange-400"
    },
    {
      title: "Open Communication",
      value: "23",
      change: "Active Threads",
      icon: Activity,
      color: "text-cyan-400"
    },
    {
      title: "Meeting Schedule",
      value: "8",
      change: "This Month",
      icon: Calendar,
      color: "text-pink-400"
    },
    {
      title: "Call Taken",
      value: "15",
      change: "This Week",
      icon: BarChart3,
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-[55px]">
        {/* Welcome Section with Email Info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-green-400">
                {getGreeting()}, {user.firstName || user.email.split('@')[0]}!
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg mb-4">
            Welcome to your AI-powered dashboard
          </p>
          <p className="text-gray-400 text-lg mb-4">
            Welcome to your Email Company Research & Classification Dashboard. Your AI co-pilot awaits.
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-green-400 text-green-400">
              {user.role || 'Executive'}
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              Account: {user.firstName} {user.lastName}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 hover:border-green-400/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className={`text-xs ${stat.color}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credibility Meter Section */}
        <div className="mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Credibility Meter
              </CardTitle>
              <CardDescription>
                Trust and reliability indicators for business assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Market Cap</span>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold text-white">$0.15B</div>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Employees</span>
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white">50</div>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Domain Age</span>
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-white">7 years</div>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Sentiment Score</span>
                    <Activity className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-xl font-bold text-white">0.75</div>
                  <Progress value={75} className="mt-2 h-2" />
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Certified</span>
                    <Shield className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="text-xl font-bold text-white">No</div>
                  <Badge variant="outline" className="border-red-400 text-red-400 mt-2">
                    Not Certified
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Top Investors</span>
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="text-xl font-bold text-white">No</div>
                  <Badge variant="outline" className="border-red-400 text-red-400 mt-2">
                    Not Funded
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Company Age</span>
                    <Calendar className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold text-white">9 years</div>
                </div>

                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 md:col-span-2 lg:col-span-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Connected Email Account</span>
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold text-green-400">{user.email}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Account: {user.firstName} {user.lastName} • Role: {user.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Research & Classification Section */}
        <div className="mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Email Company Research & Classification
              </CardTitle>
              <CardDescription>
                AI-powered email analysis and company intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
                  onClick={async () => {
                    toast({ title: "Parsing Started", description: "Email analysis has begun." });
                    
                    try {
                      const response = await fetch("/api/emails/start-parsing", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log("Parsing completed:", data);
                        
                        // Update the state with processed data
                        setUnreadEmails(data.emails || []);
                        setUnreadCount(data.count || 0);
                        setCredibilityAnalysis(data.credibility_analysis || []);
                        
                        toast({ 
                          title: "Parsing Complete", 
                          description: "Email analysis and credibility scoring completed!" 
                        });
                      } else {
                        const errorData = await response.json();
                        toast({
                          title: "Parsing Failed",
                          description: errorData.message || "Failed to process emails.",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error("Error starting parsing:", error);
                      toast({
                        title: "Error",
                        description: "Failed to start email parsing.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Start Parsing
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Unread Emails</span>
                      <Activity className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-white">{unreadCount}</div>
                    <div className="text-xs text-green-400">Unread emails</div>
                  </div>
                  {/* Render company names and intents from credibility analysis */}
                  {credibilityAnalysis.length > 0 ? (
                    credibilityAnalysis.map((analysis: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Company</span>
                          <Target className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-lg font-bold text-white truncate" title={analysis.company_name}>
                          {analysis.company_name || 'Unknown Company'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Intent: <span className="text-blue-400">{analysis.intent || 'Unknown'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Credibility: <span className="text-green-400">{analysis.credibility_score || 0}/100</span>
                        </div>
                      </div>
                    ))
                  ) : unreadCount > 0 ? (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 md:col-span-2 lg:col-span-4">
                      <p className="text-center text-gray-400">
                        Click "Start Parsing" to analyze company information and credibility scores.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 md:col-span-2 lg:col-span-4">
                      <p className="text-center text-gray-400">
                        No unread emails found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Analysis Dropdown Section */}
        {credibilityAnalysis.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Company Analysis Details
                </CardTitle>
                <CardDescription>
                  Detailed credibility analysis and company intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {credibilityAnalysis.map((analysis: any, index: number) => (
                    <div key={index} className="border border-gray-700 rounded-lg bg-gray-800/30">
                      <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-400/10">
                              <Building className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {analysis.company_name || 'Unknown Company'}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline" className="border-green-400 text-green-400">
                                  Score: {analysis.credibility_score || 0}/100
                                </Badge>
                                <Badge variant="outline" className="border-blue-400 text-blue-400">
                                  {analysis.intent_classification || 'Unknown Intent'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    analysis.risk_level === 'LOW' ? 'border-green-400 text-green-400' :
                                    analysis.risk_level === 'MEDIUM' ? 'border-yellow-400 text-yellow-400' :
                                    'border-red-400 text-red-400'
                                  }`}
                                >
                                  Risk: {analysis.risk_level || 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">View Details</span>
                            <svg 
                              className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </summary>
                        
                        <div className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {/* Company Overview */}
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Building className="h-4 w-4 text-blue-400" />
                                Company Overview
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Company Name:</span>
                                  <span className="text-white">{analysis.company_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Industry:</span>
                                  <span className="text-white">{analysis.industry || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Company Size:</span>
                                  <span className="text-white">{analysis.company_size || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Founded:</span>
                                  <span className="text-white">{analysis.founded_year || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Metrics */}
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                Financial Metrics
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Market Cap:</span>
                                  <span className="text-white">{analysis.market_cap || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Revenue:</span>
                                  <span className="text-white">{analysis.revenue || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Funding Status:</span>
                                  <span className="text-white">{analysis.funding_status || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Investors:</span>
                                  <span className="text-white">{analysis.top_investors || 'None Listed'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Credibility Factors */}
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-400" />
                                Credibility Factors
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Domain Age:</span>
                                  <span className="text-white">{analysis.domain_age || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">SSL Certificate:</span>
                                  <span className={`${analysis.ssl_certificate ? 'text-green-400' : 'text-red-400'}`}>
                                    {analysis.ssl_certificate ? 'Valid' : 'Invalid/Missing'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Business Verified:</span>
                                  <span className={`${analysis.business_verified ? 'text-green-400' : 'text-red-400'}`}>
                                    {analysis.business_verified ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Employee Count:</span>
                                  <span className="text-white">{analysis.employee_count || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contact & Intent */}
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50 md:col-span-2 lg:col-span-3">
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-yellow-400" />
                                Communication Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400 block mb-1">Email Intent:</span>
                                  <span className="text-white">{analysis.intent_classification || 'Unknown'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Sender Domain:</span>
                                  <span className="text-white">{analysis.sender_domain || 'Unknown'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Contact Quality:</span>
                                  <span className="text-white">{analysis.contact_quality || 'Unknown'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-1">Overall Score:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-green-400">
                                      {analysis.credibility_score || 0}/100
                                    </span>
                                    <Progress value={analysis.credibility_score || 0} className="h-2 flex-1" />
                                  </div>
                                </div>
                              </div>
                              
                              {analysis.summary && (
                                <div className="mt-4 p-3 rounded-lg bg-gray-600/50 border border-gray-500">
                                  <span className="text-gray-400 block mb-1">AI Summary:</span>
                                  <p className="text-white text-sm">{analysis.summary}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Company Credibility Analysis Section */}
        {credibilityAnalysis.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Company Credibility Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered credibility scores and intent classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credibilityAnalysis.map((analysis: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-700 bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Company Analysis</span>
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="space-y-2">
                        {analysis.company_name && (
                          <div>
                            <span className="text-xs text-gray-400">Company:</span>
                            <div className="text-sm font-semibold text-white">{analysis.company_name}</div>
                          </div>
                        )}
                        {analysis.credibility_score && (
                          <div>
                            <span className="text-xs text-gray-400">Credibility Score:</span>
                            <div className="text-lg font-bold text-green-400">{analysis.credibility_score}/100</div>
                            <Progress value={analysis.credibility_score} className="mt-1 h-2" />
                          </div>
                        )}
                        {analysis.intent_classification && (
                          <div>
                            <span className="text-xs text-gray-400">Intent:</span>
                            <Badge variant="outline" className="border-blue-400 text-blue-400 ml-2">
                              {analysis.intent_classification}
                            </Badge>
                          </div>
                        )}
                        {analysis.risk_level && (
                          <div>
                            <span className="text-xs text-gray-400">Risk Level:</span>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${
                                analysis.risk_level === 'LOW' ? 'border-green-400 text-green-400' :
                                analysis.risk_level === 'MEDIUM' ? 'border-yellow-400 text-yellow-400' :
                                'border-red-400 text-red-400'
                              }`}
                            >
                              {analysis.risk_level}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Get started with these essential features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={action.action}
                      className="p-4 rounded-lg border border-gray-700 hover:border-green-400/50 cursor-pointer transition-all hover:bg-gray-800/50 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${action.bgColor}`}>
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>

        {/* Feature Preview */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Features Preview
            </CardTitle>
            <CardDescription>
              Discover what your AI co-pilot can do for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="p-3 rounded-full bg-blue-400/10 w-fit mx-auto mb-3">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Automation</h3>
                <p className="text-sm text-gray-400">
                  Automate repetitive tasks and streamline your workflow
                </p>
              </div>

              <div className="text-center p-4">
                <div className="p-3 rounded-full bg-green-400/10 w-fit mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Analytics & Insights</h3>
                <p className="text-sm text-gray-400">
                  Get actionable insights from your productivity data
                </p>
              </div>

              <div className="text-center p-4">
                <div className="p-3 rounded-full bg-purple-400/10 w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Team Collaboration</h3>
                <p className="text-sm text-gray-400">
                  Coordinate with your team using AI-powered tools
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}