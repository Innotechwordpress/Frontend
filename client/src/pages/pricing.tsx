import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Check, Star, Users, Building2, Zap, Shield, HeadphonesIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerTask: number;
  maxTasks: number;
  billing: string;
  badge?: string;
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individual executives getting started with AI assistance",
    basePrice: 0,
    pricePerTask: 0,
    maxTasks: 100,
    billing: "Free forever",
    buttonText: "Get Started Free",
    buttonVariant: "outline",
    features: [
      "AI-powered task automation",
      "100 tasks per month",
      "Basic email templates",
      "Standard reporting",
      "Community support",
      "Mobile app access"
    ],
    icon: Zap,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Advanced AI capabilities for growing executives and small teams",
    basePrice: 29,
    pricePerTask: 0.01,
    maxTasks: 2000,
    billing: "Billed monthly",
    badge: "Most Popular",
    buttonText: "Start Free Trial",
    buttonVariant: "default",
    features: [
      "Everything in Starter, plus:",
      "Advanced AI workflows",
      "Custom automation rules",
      "Priority email support",
      "Advanced analytics",
      "Integrations with CRM/ERP",
      "Team collaboration tools",
      "Custom AI training"
    ],
    icon: Users,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Complete AI automation solution for large organizations",
    basePrice: 99,
    pricePerTask: 0.005,
    maxTasks: 10000,
    billing: "Billed monthly",
    badge: "Best Value",
    buttonText: "Start Free Trial",
    buttonVariant: "default",
    features: [
      "Everything in Professional, plus:",
      "Unlimited AI automations",
      "Advanced security & compliance",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "White-label options",
      "Advanced user management",
      "API access & webhooks"
    ],
    icon: Building2,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Tailored solutions for unique enterprise requirements",
    basePrice: 0,
    pricePerTask: 0,
    maxTasks: 0,
    billing: "Contact for pricing",
    buttonText: "Contact Sales",
    buttonVariant: "secondary",
    features: [
      "Everything in Enterprise, plus:",
      "Custom AI model training",
      "On-premise deployment",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom contract terms",
      "Compliance certifications",
      "Advanced security auditing"
    ],
    icon: Shield,
  },
];

const taskOptions = [
  { value: 100, label: "100" },
  { value: 500, label: "500" },
  { value: 1000, label: "1K" },
  { value: 2000, label: "2K" },
  { value: 5000, label: "5K" },
  { value: 10000, label: "10K" },
  { value: 25000, label: "25K" },
  { value: 50000, label: "50K" },
];

export default function Pricing() {
  const [taskCount, setTaskCount] = useState([1000]);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const currentTasks = taskCount[0];

  const handlePricingAction = (tier: PricingTier) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    // Handle different tier actions for authenticated users
    if (tier.buttonText === "Contact Sales") {
      // Handle contact sales
      window.open("mailto:sales@narrisia.ai?subject=Enterprise Inquiry", "_blank");
    } else if (tier.id === "starter" || tier.id === "professional" || tier.id === "enterprise") {
      // Calculate the actual price based on current task count
      const calculatedPrice = calculatePrice(tier);
      setLocation(`/checkout?plan=${tier.id}&price=${Math.round(calculatedPrice)}&tasks=${currentTasks}`);
    }
  };

  const calculatePrice = (tier: PricingTier): number => {
    if (tier.basePrice === 0 && tier.pricePerTask === 0) return 0;
    if (currentTasks <= tier.maxTasks) {
      return tier.basePrice + (currentTasks * tier.pricePerTask);
    }
    return tier.basePrice + (tier.maxTasks * tier.pricePerTask);
  };

  const getRecommendedTier = (): string => {
    if (currentTasks <= 100) return "starter";
    if (currentTasks <= 2000) return "professional";
    if (currentTasks <= 10000) return "enterprise";
    return "custom";
  };

  const formatTaskLabel = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-black text-green-100">
      <Navbar />
      {/* Header */}
      <div className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 mb-6">
            AI That Scales With You
          </h1>
          <p className="text-xl text-green-200 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your executive AI needs. Start free and scale as you grow.
          </p>
          
          {/* Task Slider */}
          <div className="bg-gray-900 border border-green-400/20 rounded-lg p-8 max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-400">
                How many AI tasks per month do you need?
              </h3>
              <Button variant="ghost" size="sm" className="text-green-300 hover:text-green-200">
                Learn about tasks
              </Button>
            </div>
            
            <div className="space-y-6">
              <Slider
                value={taskCount}
                onValueChange={setTaskCount}
                max={50000}
                min={100}
                step={100}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-green-300">
                {taskOptions.map((option) => (
                  <span
                    key={option.value}
                    className={`${
                      Math.abs(currentTasks - option.value) < 100
                        ? "text-green-400 font-semibold"
                        : ""
                    }`}
                  >
                    {option.label}
                  </span>
                ))}
              </div>
              
              <div className="text-center">
                <span className="text-2xl font-bold text-green-400">
                  {formatTaskLabel(currentTasks)} tasks/month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier) => {
              const price = calculatePrice(tier);
              const isRecommended = getRecommendedTier() === tier.id;
              const IconComponent = tier.icon;
              
              return (
                <Card
                  key={tier.id}
                  className={`relative bg-gray-900 border-2 transition-all duration-300 hover:scale-105 ${
                    isRecommended
                      ? "border-green-400 shadow-lg shadow-green-400/20"
                      : "border-green-400/20 hover:border-green-400/40"
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-400 text-black font-semibold px-3 py-1">
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-400/10 rounded-full">
                        <IconComponent className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-400">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-green-200 mt-2">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    {/* Pricing */}
                    <div className="text-center mb-6">
                      {tier.id === "custom" ? (
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            Contact Us
                          </div>
                          <div className="text-sm text-green-300 mt-1">
                            Custom pricing
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold text-green-400">
                            ${Math.round(price)}
                            <span className="text-lg text-green-300 font-normal">
                              /month
                            </span>
                          </div>
                          <div className="text-sm text-green-300 mt-1">
                            {tier.billing}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePricingAction(tier)}
                      className={`w-full mb-6 ${
                        tier.buttonVariant === "default"
                          ? "bg-green-400 hover:bg-green-300 text-black"
                          : tier.buttonVariant === "outline"
                          ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                          : "bg-gray-800 hover:bg-gray-700 text-green-400"
                      }`}
                      variant={tier.buttonVariant}
                    >
                      {tier.buttonText}
                    </Button>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-400 text-sm uppercase tracking-wide">
                        {tier.id === "starter" ? "Key Features" : "Everything included"}
                      </h4>
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-green-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>



      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-green-400/10 to-green-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Ready to Transform Your Executive Workflow?
          </h2>
          <p className="text-xl text-green-200 mb-8">
            Join thousands of executives who've already revolutionized their productivity with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => handlePricingAction("Start Free Trial")}
              className="bg-green-400 hover:bg-green-300 text-black px-8 py-3 text-lg"
            >
              Start Free Trial
            </Button>
            <Button 
              onClick={() => handlePricingAction("Schedule Demo")}
              variant="outline" 
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3 text-lg"
            >
              <HeadphonesIcon className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
          
          <p className="text-sm text-green-300 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}