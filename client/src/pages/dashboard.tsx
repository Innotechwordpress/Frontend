import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { TrendingUp, Users, Target, Zap, BarChart3, Calendar, Activity, ArrowRight, Brain, Rocket, Shield, Building, MoreVertical, X, Mail, Briefcase, FileText, Bot } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadEmails, setUnreadEmails] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [credibilityAnalysis, setCredibilityAnalysis] = useState([]);
  const [selectedDialog, setSelectedDialog] = useState<{
    type: 'subject' | 'credibility' | 'intent_summary';
    data: any;
  } | null>(null);

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
      value: unreadCount.toString(),
      change: "This Week",
      icon: Target,
      color: "text-orange-400"
    },
    {
      title: "Open Communication",
      value: "0", // TODO: Implement logic to count emails without replies
      change: "Active Threads",
      icon: Activity,
      color: "text-cyan-400"
    },
    {
      title: "Unread Mails",
      value: unreadCount.toString(),
      change: "Current",
      icon: Mail,
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

  // Helper function to find credibility analysis for an email
  const findCredibilityForEmail = (email: any) => {
    return credibilityAnalysis.find((analysis: any) => 
      analysis.sender === email.sender || 
      analysis.sender_domain === email.sender?.split('@')[1]?.split('>')[0]
    );
  };

  const openDialog = (type: 'subject' | 'credibility' | 'intent_summary', data: any) => {
    setSelectedDialog({ type, data });
  };

  const closeDialog = () => {
    setSelectedDialog(null);
  };

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

                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Email Cards Section */}
        {unreadEmails.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Individual Email Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis for each email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unreadEmails.map((email: any, index: number) => {
                    const credibilityData = findCredibilityForEmail(email);
                    return (
                      <div key={index} className="border border-gray-700 rounded-lg bg-gray-800/30 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-blue-400/10">
                              <Mail className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white truncate">
                                From: {email.sender && email.sender.trim() !== '' ? email.sender : 'Unknown Sender'}
                              </h3>
                              <p className="text-sm text-gray-400 truncate">
                                Subject: {email.subject || 'No Subject'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                                  Score: {credibilityData?.credibility_score?.toFixed(1) || 'N/A'}
                                </Badge>
                                <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                                  {credibilityData?.intent || credibilityData?.email_intent || 'Unknown Intent'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mr-4">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => {
                                const emailAddress = email.sender?.match(/<(.+)>/)?.[1] || email.sender;
                                window.open(`mailto:${emailAddress}`, '_blank');
                              }}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm" 
                              variant="outline"
                              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Schedule Meeting feature will be available soon."
                                });
                              }}
                            >
                              Schedule Meeting
                            </Button>
                          </div>

                          <div className="flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-56">
                                <DropdownMenuItem 
                                  onClick={() => openDialog('subject', { email, analysis: credibilityData })}
                                  className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Subject & Body
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDialog('credibility', { email, analysis: credibilityData })}
                                  className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Company Credibility
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDialog('intent_summary', { email, analysis: credibilityData })}
                                  className="text-white hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                                >
                                  <Bot className="mr-2 h-4 w-4" />
                                  Intent & AI Summary
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog for different views */}
        <Dialog open={!!selectedDialog} onOpenChange={closeDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedDialog?.type === 'subject' && "Email Subject & Body"}
                {selectedDialog?.type === 'credibility' && "Company Credibility Analysis"}
                {selectedDialog?.type === 'intent_summary' && "Intent & AI Summary"}
              </DialogTitle>
            </DialogHeader>

            {selectedDialog?.type === 'subject' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Subject</h4>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">
                    {selectedDialog.data.email.subject || 'No Subject'}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Email Body</h4>
                  <div className="text-white bg-gray-800 p-3 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">
                      {selectedDialog.data.email.body || selectedDialog.data.email.snippet || 'No content available'}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Sender</h4>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">
                    {selectedDialog.data.email.sender && selectedDialog.data.email.sender.trim() !== '' ? selectedDialog.data.email.sender : 'Unknown Sender'}
                  </p>
                </div>
              </div>
            )}

            {selectedDialog?.type === 'credibility' && (
              <div className="space-y-4">
                {selectedDialog.data.analysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Market Cap</h4>
                      <p className="text-white">
                        {selectedDialog.data.analysis.market_cap ? 
                          (typeof selectedDialog.data.analysis.market_cap === 'number' ? 
                            `$${(selectedDialog.data.analysis.market_cap / 1000000000).toFixed(1)}B` : 
                            selectedDialog.data.analysis.market_cap) : 
                          'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Domain Age</h4>
                      <p className="text-white">
                        {selectedDialog.data.analysis.domain_age ? `${selectedDialog.data.analysis.domain_age} years` : 'Unknown'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Funding Status</h4>
                      <p className="text-white">{selectedDialog.data.analysis.funding_status || 'Unknown'}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Employee Count</h4>
                      <p className="text-white">{selectedDialog.data.analysis.employee_count || 'Unknown'}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Business Verified</h4>
                      <p className={`${selectedDialog.data.analysis.business_verified ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedDialog.data.analysis.business_verified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-600 bg-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3">Overall Score</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-400">
                          {selectedDialog.data.analysis.credibility_score || 0}/100
                        </span>
                        <Progress value={selectedDialog.data.analysis.credibility_score || 0} className="h-2 flex-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No credibility data available for this email.</p>
                )}
              </div>
            )}

            {selectedDialog?.type === 'intent_summary' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Email Intent</h4>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">
                    {selectedDialog.data.analysis?.intent || 'No intent analysis available'}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-400">
                      Confidence: {selectedDialog.data.analysis?.intent_confidence ? 
                        `${(selectedDialog.data.analysis.intent_confidence * 100).toFixed(1)}%` : 
                        'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Company AI Summary</h4>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">
                    {selectedDialog.data.analysis?.company_gist || 'No company summary available'}
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">AI Email Summary</h4>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">
                    {selectedDialog.data.analysis?.email_summary || selectedDialog.data.email?.snippet || 'No email summary available'}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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