import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User, Settings, LogOut, ChevronDown, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import logoPath from "@assets/download-removebg-preview.png";
import IntegrationsDropdown from "@/components/integrations-dropdown";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleSignup = () => {
    setLocation("/signup");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 relative">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img
              src={logoPath}
              alt="Narrisia.AI Logo"
              className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mr-2 sm:mr-3"
            />
            <span className="font-bold text-sm sm:text-lg lg:text-xl text-slate-800">
              Narrisia.AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-slate-600 hover:text-[#0FFCBE] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            <IntegrationsDropdown />
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="text-slate-600">Loading...</div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-[#0FFCBE]/10 hover:ring-2 hover:ring-[#0FFCBE]/30 focus:ring-2 focus:ring-[#0FFCBE]/50 transition-all duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                      <AvatarFallback className="bg-[#0FFCBE]/20 text-[#0FFCBE] font-semibold">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <Target className="mr-2 h-4 w-4" />
                    <span>Complete Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className="border-[#0FFCBE] text-[#0FFCBE] hover:bg-[#0FFCBE] hover:text-black font-semibold px-4 py-2 transition-all duration-200"
                >
                  Log In
                </Button>
                <Button 
                  onClick={handleSignup}
                  className="bg-[#0FFCBE] text-black hover:bg-[#0FFCBE]/90 font-semibold px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div ref={dropdownRef} className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="text-slate-600 hover:text-[#0FFCBE] block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 pt-4 pb-3">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-slate-800">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setLocation("/dashboard");
                          closeMobileMenu();
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {logoutMutation.isPending ? "Logging out..." : "Log out"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 px-5">
                    <Button
                      variant="outline"
                      className="w-full border-[#0FFCBE] text-[#0FFCBE] hover:bg-[#0FFCBE] hover:text-black font-semibold py-2 transition-all duration-200"
                      onClick={() => {
                        handleLogin();
                        closeMobileMenu();
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      className="w-full bg-[#0FFCBE] text-black hover:bg-[#0FFCBE]/90 font-semibold py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={() => {
                        handleSignup();
                        closeMobileMenu();
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}