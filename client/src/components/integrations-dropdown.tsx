import { useState } from "react";
import { ChevronDown, Video, Calendar, Users, Database, FileText, Zap, Mic, ClipboardList, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const integrations: Integration[] = [
  {
    id: "video-conferencing",
    name: "Video Conferencing",
    description: "Record and transcribe meetings from Google Meet, Zoom and other apps.",
    icon: Video,
    category: "Communication"
  },
  {
    id: "dialers",
    name: "Dialers", 
    description: "Pull and transcribe calls made from Aircall, Outreach and other apps.",
    icon: Settings,
    category: "Communication"
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Automatically record and transcribe meetings scheduled via your calendar.",
    icon: Calendar,
    category: "Productivity"
  },
  {
    id: "audio-recording",
    name: "Audio Recording",
    description: "Transcribe and save calls recorded through Zoom Cloud Recording.",
    icon: Mic,
    category: "Communication"
  },
  {
    id: "collaboration",
    name: "Collaboration",
    description: "Automatically share meeting transcripts, notes, and recordings to a channel.",
    icon: Users,
    category: "Productivity"
  },
  {
    id: "project-management",
    name: "Project Management",
    description: "Automatically create tasks using voice commands in Asana, Monday and others.",
    icon: ClipboardList,
    category: "Productivity"
  },
  {
    id: "crm",
    name: "CRM",
    description: "Log calls, transcription, and meeting notes into your CRM.",
    icon: Database,
    category: "Sales & Marketing"
  },
  {
    id: "notes",
    name: "Notes",
    description: "Automatically share meeting notes and summary in your note-taking app.",
    icon: FileText,
    category: "Productivity"
  },
  {
    id: "storage",
    name: "Storage",
    description: "Transcribe audio or upload transcript to your storage app.",
    icon: Database,
    category: "Storage"
  },
  {
    id: "narrisia-api",
    name: "Narrisia API",
    description: "Unlock more possibilities with our powerful Narrisia.AI API.",
    icon: Zap,
    category: "Automation"
  }
];

const categories = ["Communication", "Productivity", "Sales & Marketing", "Storage", "Automation"];

export default function IntegrationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-slate-600 hover:text-[#0FFCBE] px-3 py-2 text-base font-medium transition-colors flex items-center space-x-1"
        >
          <span>Integrations</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="center" 
        className="w-96 max-h-96 overflow-y-auto bg-white border border-slate-200 shadow-lg"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-lg font-semibold text-slate-900 px-4 py-3">
          AI-Powered Integrations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-4 py-2">
          <p className="text-sm text-slate-600 mb-4">
            Learn about how Narrisia.AI works with various apps from your workflow.
          </p>
          
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryIntegrations = integrations.filter(int => int.category === category);
              
              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {categoryIntegrations.map((integration) => {
                      const IconComponent = integration.icon;
                      return (
                        <DropdownMenuItem 
                          key={integration.id}
                          className="cursor-pointer hover:bg-slate-50 p-3 rounded-md"
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div className="p-2 bg-[#0FFCBE]/10 rounded-md flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-[#0FFCBE]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-slate-900 mb-1">
                                {integration.name}
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {integration.description}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Explore All Features</h4>
                <p className="text-xs text-slate-600">
                  Discover the full potential of AI automation
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-[#0FFCBE] hover:bg-[#00E6A7] text-slate-800 text-xs"
                onClick={() => window.location.href = '/about'}
              >
                Learn More →
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}