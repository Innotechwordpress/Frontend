import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/download-removebg-preview.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle Google OAuth callback token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      toast({
        title: "Login successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      setTimeout(() => setLocation('/dashboard'), 1000);
    } else if (error) {
      let errorMessage = "Authentication failed";
      if (error === 'oauth_failed') errorMessage = "Google authentication failed";
      if (error === 'token_failed') errorMessage = "Failed to authenticate with Google";
      
      toast({
        title: "Authentication Error", 
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [setLocation, toast]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting to dashboard...",
        });
        setTimeout(() => setLocation("/dashboard"), 1000);
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-green-400">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="Narrisia.AI Logo" className="h-12 w-12 mr-3" />
            <span className="font-bold text-2xl text-green-400">Narrisia.AI</span>
          </div>
          <CardTitle className="text-3xl font-bold text-green-400">Welcome Back</CardTitle>
          <CardDescription className="text-green-200">
            Log in to your executive AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-400 text-green-300 hover:bg-green-400 hover:text-black"
            onClick={handleGoogleLogin}
            disabled={isLoading}
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-300">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="bg-gray-800 border-green-400 text-green-200 focus:border-green-300"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-300 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-green-400 hover:text-green-300 text-sm"
              onClick={() => {
                // TODO: Implement forgot password functionality
                alert("Forgot password functionality will be implemented soon. Please contact support for password reset.");
              }}
            >
              Forgot your password?
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-green-200">
              Don't have an account?{" "}
              <Link href="/signup" className="text-green-400 hover:text-green-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}