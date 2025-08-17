import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What is special about NarrisiaAI?",
    answer: "NarrisiaAI helps you transform your existing workflows into intelligent automation systems with AI agents that handle complex tasks. Think of it as having a team of AI specialists ready to streamline your business operations and boost productivity.",
    defaultOpen: true
  },
  {
    question: "How do I set up AI agents in NarrisiaAI?",
    answer: "Setting up AI agents is simple with our intuitive interface. You can create specialized agents for different tasks like email management, data analysis, or customer support. Our platform guides you through the process with templates and customization options."
  },
  {
    question: "What is the best way to integrate NarrisiaAI with my existing tools?",
    answer: "NarrisiaAI seamlessly integrates with popular business tools through our extensive API connections. We support major platforms like Slack, Gmail, CRM systems, and project management tools. Our integration wizard makes setup quick and straightforward."
  },
  {
    question: "How many integrations does NarrisiaAI support?",
    answer: "We support over 100+ integrations with popular business tools including productivity suites, communication platforms, CRM systems, project management tools, and more. New integrations are added regularly based on user feedback."
  },
  {
    question: "What about team collaboration?",
    answer: "NarrisiaAI is built for teams. You can share AI agents, collaborate on workflows, set permissions, and track team productivity. Our platform includes real-time collaboration features, shared workspaces, and team analytics."
  },
  {
    question: "Is NarrisiaAI free to use?",
    answer: "We offer a free tier with basic features to get you started. For advanced functionality, team features, and higher usage limits, we have flexible paid plans. You can upgrade anytime as your needs grow."
  },
  {
    question: "Can I use NarrisiaAI on mobile?",
    answer: "Yes! NarrisiaAI is fully responsive and works seamlessly on mobile devices. You can monitor your AI agents, receive notifications, and perform key actions from your smartphone or tablet."
  },
  {
    question: "What support can I expect if I get stuck?",
    answer: "We provide comprehensive support including detailed documentation, video tutorials, live chat support, and email assistance. Our team is dedicated to helping you succeed with AI automation."
  }
];

export default function FAQSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-16 lg:py-20 bg-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
        </div>

        {/* Main dropdown container */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg">
          {/* Dropdown header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-6 py-4 text-left text-white hover:bg-gray-800/50 transition-colors rounded-lg"
          >
            <span className="text-lg font-medium">Frequently Asked Questions</span>
            <ChevronDown 
              className={`h-5 w-5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Expandable content */}
          {isExpanded && (
            <div className="border-t border-gray-700/50">
              <div className="p-6 space-y-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqData.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="bg-gray-800/30 border border-gray-600/30 rounded-lg px-4 py-2 hover:bg-gray-700/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left text-white hover:text-green-400 text-base font-medium py-3 hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300 pb-3 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="text-center mt-8">
          <p className="text-lg text-gray-300 leading-relaxed">
            Can't find the answer you are looking for? Reach out to us{" "}
            <a href="#contact" className="text-green-400 hover:text-green-300 transition-colors">
              here
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}