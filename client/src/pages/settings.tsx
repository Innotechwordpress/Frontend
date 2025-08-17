import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Lock, 
  FileText,
  ArrowLeft,
  Save,
  Camera,
  Mail,
  Building,
  Globe
} from "lucide-react";
import Navbar from "@/components/navbar";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: "profile",
    title: "My profile",
    icon: User,
    description: "Manage your personal information and preferences"
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Configure how you receive notifications"
  },
  {
    id: "security",
    title: "Security and data",
    icon: Shield,
    description: "Manage your account security and data privacy"
  },
  {
    id: "billing",
    title: "Billing and usage",
    icon: CreditCard,
    description: "View your subscription and usage details"
  },
  {
    id: "members",
    title: "Members",
    icon: Users,
    description: "Manage team members and permissions"
  },
  {
    id: "advanced",
    title: "Advanced security",
    icon: Lock,
    description: "Advanced security settings and logs"
  },
  {
    id: "audit",
    title: "Audit log",
    icon: FileText,
    description: "View account activity and changes"
  }
];

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney"
];

const roles = [
  "CEO",
  "CTO",
  "CFO",
  "VP",
  "Director",
  "Manager",
  "Engineer",
  "Developer",
  "Designer",
  "Analyst",
  "Other"
];

export default function Settings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    timezone: "UTC"
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        company: user.companyName || "",
        role: user.role || "",
        timezone: "UTC"
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await apiRequest("PUT", "/api/user/profile", profileData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }

    setIsUpdating(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">My profile</h2>
        <p className="text-gray-400">Manage your personal information and account settings.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="bg-green-400 text-black text-lg font-bold">
                  {getInitials(profileData.firstName, profileData.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                  <Camera className="w-4 h-4 mr-2" />
                  Edit Gravatar
                </Button>
                <p className="text-sm text-gray-400 mt-1">
                  Click to update your profile picture
                </p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-400">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                  required
                />
                <Button variant="outline" size="sm" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                  CHANGE EMAIL
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-400">
                Password <span className="text-red-400">*</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="password"
                  value="••••••••"
                  disabled
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                />
                <Button variant="outline" size="sm" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                  CHANGE PASSWORD
                </Button>
              </div>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-green-400">
                First name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-green-400">
                Last name
              </Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-green-400">
                Company
              </Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-green-400">
                Role
              </Label>
              <Select value={profileData.role} onValueChange={(value) => setProfileData({...profileData, role: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-green-400">
                Timezone
              </Label>
              <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400">
                Used when we handle time with no explicit timezone.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-green-400 text-black hover:bg-green-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving changes..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Notifications</h2>
        <p className="text-gray-400">Choose how you want to be notified about important updates.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-green-400">Email notifications</Label>
              <p className="text-sm text-gray-400">Receive updates via email</p>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
            />
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-green-400">Push notifications</Label>
              <p className="text-sm text-gray-400">Receive push notifications in your browser</p>
            </div>
            <Switch
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
            />
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-green-400">Weekly reports</Label>
              <p className="text-sm text-gray-400">Get weekly activity summaries</p>
            </div>
            <Switch
              checked={notificationSettings.weeklyReports}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
            />
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-green-400">Security alerts</Label>
              <p className="text-sm text-gray-400">Get notified about security events</p>
            </div>
            <Switch
              checked={notificationSettings.securityAlerts}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Security and data</h2>
        <p className="text-gray-400">Manage your account security and data privacy settings.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Two-factor authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Add an extra layer of security to your account</p>
                <p className="text-sm text-gray-400">Status: Not enabled</p>
              </div>
              <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
                Enable 2FA
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Login sessions</h3>
            <p className="text-gray-400 mb-4">Manage your active login sessions across devices</p>
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
              View sessions
            </Button>
          </div>

          <Separator className="bg-gray-700" />

          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Data export</h3>
            <p className="text-gray-400 mb-4">Download a copy of your data</p>
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
              Export data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Billing and usage</h2>
        <p className="text-gray-400">Manage your subscription and view usage statistics.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Current plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {user.subscriptionPlan ? user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1) : 'Free'} Plan
                </p>
                <p className="text-sm text-gray-400">
                  {user.taskLimit ? `${user.taskLimit} tasks per month` : 'Limited features'}
                </p>
              </div>
              <Badge variant="outline" className="border-green-400 text-green-400">
                {user.subscriptionStatus || 'Active'}
              </Badge>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3">Usage this month</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">AI tasks used</span>
                <span className="text-white">0 / {user.taskLimit || 100}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex space-x-3">
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black">
              Upgrade plan
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-700">
              View invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "security":
        return renderSecuritySection();
      case "billing":
        return renderBillingSection();
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Coming Soon</h2>
              <p className="text-gray-400">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-400">Narrisia Settings</h1>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 space-y-2">
            {settingsSections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? "bg-green-400/10 border border-green-400/20 text-green-400" 
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-400 hidden lg:block">
                      {section.description}
                    </div>
                  </div>
                  {section.id === "members" || section.id === "advanced" || section.id === "audit" ? (
                    <Lock className="w-4 h-4 text-gray-500 ml-auto" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="flex-1">
            {renderCurrentSection()}
          </div>
        </div>
      </div>
    </div>
  );
}