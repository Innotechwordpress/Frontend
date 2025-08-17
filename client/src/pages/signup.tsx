import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, userRoles, companySizes, goalCategories, type SignupData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/download-removebg-preview.png";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      goals: []
    }
  });

  const selectedGoals = watch("goals") || [];

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("token", result.token);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        setLocation("/dashboard");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    const newGoals = selectedGoals.includes(goal as any)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal as any];
    setValue("goals", newGoals as any);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-green-400">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="Narrisia.AI Logo" className="h-12 w-12 mr-3" />
            <span className="font-bold text-2xl text-green-400">Narrisia.AI</span>
          </div>
          <CardTitle className="text-3xl font-bold text-green-400">Join Narrisia.AI</CardTitle>
          <CardDescription className="text-green-200">
            Create your executive AI assistant account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-400 text-green-300 hover:bg-green-400 hover:text-black"
            onClick={handleGoogleSignup}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-green-400" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-green-200">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-green-300">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-green-300">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-300">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                placeholder="john@company.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-green-300">Your Role</Label>
              <Select onValueChange={(value) => setValue("role", value as any)}>
                <SelectTrigger className="bg-gray-800 border-green-400 text-green-200">
                  <SelectValue placeholder="Select your executive role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400">
                  {userRoles.map((role) => (
                    <SelectItem key={role} value={role} className="text-green-200 focus:bg-green-400 focus:text-black">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-400 text-sm">{errors.role.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-green-300">Company Name</Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="Acme Corp"
                />
                {errors.companyName && (
                  <p className="text-red-400 text-sm">{errors.companyName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-green-300">Industry</Label>
                <Input
                  id="industry"
                  {...register("industry")}
                  className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                  placeholder="Technology"
                />
                {errors.industry && (
                  <p className="text-red-400 text-sm">{errors.industry.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize" className="text-green-300">Company Size</Label>
              <Select onValueChange={(value) => setValue("companySize", value as any)}>
                <SelectTrigger className="bg-gray-800 border-green-400 text-green-200">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-400">
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-green-200 focus:bg-green-400 focus:text-black">
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companySize && (
                <p className="text-red-400 text-sm">{errors.companySize.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-green-300">Primary Goals (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-2">
                {goalCategories.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={selectedGoals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                      className="border-green-400 data-[state=checked]:bg-green-400 data-[state=checked]:text-black"
                    />
                    <Label htmlFor={goal} className="text-green-200 text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.goals && (
                <p className="text-red-400 text-sm">{errors.goals.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-300 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-green-200">
              Already have an account?{" "}
              <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}