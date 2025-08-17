import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hi! I'm Narri, your AI assistant. How can I help you today?",
    isBot: true,
    timestamp: new Date()
  }
];

const botResponses = {
  greeting: [
    "Hello! I'm here to help you with NarrisiaAI. What would you like to know?",
    "Hi there! How can I assist you with our AI platform today?",
    "Welcome! I'm Narri, your AI assistant. What questions do you have?"
  ],
  pricing: [
    "Our pricing starts with a free tier for up to 100 tasks per month. Professional plans begin at $29/month. Would you like me to show you our pricing page?",
    "We offer flexible pricing based on your needs. Check out our pricing page for detailed information, or I can help you find the right plan."
  ],
  features: [
    "NarrisiaAI offers intelligent automation, voice transcription, meeting recording, CRM integration, and much more. What specific feature interests you?",
    "Our platform includes AI-powered workflows, team collaboration tools, and integrations with popular business apps. What would you like to learn about?"
  ],
  support: [
    "I'm here to help! You can also reach our support team at support@narrisiaai.com or through our contact form.",
    "For technical support, you can email us or use the contact form. I'm also here to answer quick questions!"
  ],
  default: [
    "That's a great question! Let me help you find the right information. Could you be more specific about what you're looking for?",
    "I'd be happy to help with that. Can you tell me more about what you need assistance with?",
    "I'm here to help! Could you provide a bit more detail so I can give you the best answer?"
  ]
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
    }
    
    if (message.includes("price") || message.includes("cost") || message.includes("plan") || message.includes("billing")) {
      return botResponses.pricing[Math.floor(Math.random() * botResponses.pricing.length)];
    }
    
    if (message.includes("feature") || message.includes("capability") || message.includes("what") || message.includes("how")) {
      return botResponses.features[Math.floor(Math.random() * botResponses.features.length)];
    }
    
    if (message.includes("support") || message.includes("help") || message.includes("contact") || message.includes("problem")) {
      return botResponses.support[Math.floor(Math.random() * botResponses.support.length)];
    }
    
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-400 hover:bg-green-300 text-black shadow-lg z-50 flex items-center justify-center"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-green-400 text-black rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Narri AI Assistant</h3>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-black hover:bg-green-300 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs ${message.isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {message.isBot ? (
                        <Bot className="h-3 w-3 text-green-600" />
                      ) : (
                        <User className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.isBot
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-400 text-black"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-xs">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-green-400 hover:bg-green-300 text-black"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Powered by NarrisiaAI
            </p>
          </div>
        </div>
      )}
    </>
  );
}