import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planDetails }: { planDetails: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Handle free plan (Starter) - skip payment processing
      if (planDetails.plan === 'starter' || parseFloat(planDetails.price) === 0) {
        const subscriptionResponse = await apiRequest("POST", "/api/create-subscription", { 
          priceId: planDetails.plan, 
          planName: planDetails.name,
          amount: planDetails.price,
          tasks: planDetails.tasks
        });

        const subscriptionData = await subscriptionResponse.json();

        toast({
          title: "Free Plan Activated",
          description: "Your free starter plan is now active!",
        });

        // Redirect to dashboard
        window.location.href = '/dashboard?plan=starter';
        return;
      }

      // For paid plans, first confirm the setup intent to save the payment method
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
        redirect: 'if_required',
      });

      if (setupError) {
        toast({
          title: "Payment Setup Failed",
          description: setupError.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Now create the subscription with the saved payment method
      const subscriptionResponse = await apiRequest("POST", "/api/create-subscription", { 
        priceId: planDetails.plan, 
        planName: planDetails.name,
        paymentMethodId: setupIntent.payment_method,
        amount: planDetails.price,
        tasks: planDetails.tasks
      });

      const subscriptionData = await subscriptionResponse.json();

      toast({
        title: "Subscription Created",
        description: "Your subscription is now active!",
      });

      // Redirect to dashboard
      window.location.href = '/dashboard?payment=success';

    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <PaymentElement 
          options={{
            layout: "tabs"
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-green-400 text-black hover:bg-green-500 text-lg py-3"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {isProcessing ? "Processing..." : `Subscribe to ${planDetails.name} - $${planDetails.price}/month`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    // Get plan details from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const price = urlParams.get('price');
    
    if (!plan || !price) {
      setLocation('/pricing');
      return;
    }

    const tasks = urlParams.get('tasks') || '1000';
    
    const details = {
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      price: price,
      plan: plan,
      tasks: tasks
    };
    
    setPlanDetails(details);

    // Create a setup intent for immediate payment form display
    apiRequest("POST", "/api/create-setup-intent", {})
      .then((res) => res.json())
      .then((data) => {
        console.log('Setup intent response:', data);
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Setup intent creation failed:', error);
      });
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-green-400 text-lg">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (!clientSecret || !planDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-green-400 text-lg">Setting up payment...</div>
        </div>
      </div>
    );
  }

  const planFeatures = planDetails.plan === 'pro' ? [
    "50 AI tasks per month",
    "Basic analytics",
    "Email support",
    "Standard integrations"
  ] : [
    "Unlimited AI tasks",
    "Advanced analytics",
    "Priority support",
    "All integrations",
    "Team collaboration",
    "Custom workflows"
  ];

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/pricing')}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          
          <h1 className="text-3xl font-bold text-green-400 mb-2">Complete Your Subscription</h1>
          <p className="text-gray-400">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{planDetails.name} Plan</h3>
                  <Badge variant="outline" className="border-green-400 text-green-400 mt-1">
                    Monthly Subscription
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">${planDetails.price}</div>
                  <div className="text-sm text-gray-400">per month</div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-semibold text-white mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {planFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total due today:</span>
                  <span className="text-green-400">${planDetails.price}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Cancel anytime. No setup fees.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm planDetails={planDetails} />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            🔒 Your payment information is secure and encrypted. 
            We use Stripe for secure payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}