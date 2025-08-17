import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Building, Users, Target, Calendar, Activity, Rocket } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";

const userRoles = [
  "CEO", "CTO", "CFO", "COO", "VP", "Director", "Manager", "Lead", "Senior", "Executive"
];

const companySizes = [
  "1-10", "11-50", "51-200", "201-1000", "1000+"
];

const goalCategories = [
  "Productivity", "Automation", "Analytics", "Collaboration", "Innovation", "Growth"
];

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    role: user?.role || "",
    companyName: user?.companyName || "",
    companySize: user?.companySize || "",
    industry: user?.industry || "",
    goals: user?.goals || []
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g: string) => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-green-400 text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="bg-green-400 text-black text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-green-400">{user.firstName} {user.lastName}</CardTitle>
              <p className="text-gray-400 flex items-center justify-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">{user.role || 'Role not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">{user.companyName || 'Company not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">{user.companySize || 'Size not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-green-400">Update Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-white">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>{size} employees</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-white">
                    <Target className="w-4 h-4" />
                    Goals & Interests
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {goalCategories.map((goal) => (
                      <Badge
                        key={goal}
                        variant={formData.goals.includes(goal) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          formData.goals.includes(goal)
                            ? "bg-green-400 text-black hover:bg-green-500"
                            : "border-gray-600 text-gray-300 hover:border-green-400"
                        }`}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <Button
                  type="submit"
                  className="w-full bg-green-400 text-black hover:bg-green-500"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Setup Progress Section */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2 mt-8">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Setup Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Account created via Google OAuth</p>
                    <p className="text-gray-400 text-xs">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Profile initialized</p>
                    <p className="text-gray-400 text-xs">1 minute ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Dashboard accessed</p>
                    <p className="text-gray-400 text-xs">Now</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}