import React from "react";
import { Lightbulb, Sparkles, Target, MessageCircle } from "lucide-react";

const experts = [
  {
    name: "Dr. Alex Rivera",
    role: "Relationship Psychologist",
    image: "https://i.pravatar.cc/150?img=11",
    tip: "Don't just say 'Hi'. Use the conversation hook on their profile. Matches are 3x more likely to reply to a specific question.",
    icon: MessageCircle,
    iconColor: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    name: "Sarah Chen",
    role: "Dating Profile Specialist",
    image: "https://i.pravatar.cc/150?img=5",
    tip: "Specifics attract. Instead of 'I like food', try 'I'm on a quest for the best spicy ramen in town'. Authenticity wins.",
    icon: Target,
    iconColor: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    name: "Marcus Johnson",
    role: "Communication Coach",
    image: "https://i.pravatar.cc/150?img=60",
    tip: "The 'Vibe Check' isn't just a label. Users who fill out all 5 vibe tags get 40% more matches on average.",
    icon: Sparkles,
    iconColor: "text-amber-500",
    bg: "bg-amber-50"
  }
];

export default function ExpertTipsBanner() {
  return (
    <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-violet-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-violet-100 text-violet-600">
            <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              Expert Tips
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Maximize your match potential
            </p>
          </div>
        </div>
        <button className="hidden sm:block text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline transition-colors">
          View all guides →
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {experts.map((expert, i) => (
          <div 
            key={i} 
            className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-300"
          >
            {/* Expert Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm border border-gray-50`}>
                  <div className={`p-1 rounded-full ${expert.bg}`}>
                    <expert.icon className={`w-3 h-3 ${expert.iconColor}`} />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 leading-tight">
                  {expert.name}
                </h4>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                  {expert.role}
                </p>
              </div>
            </div>

            {/* Tip Content */}
            <div className="relative">
              <span className="absolute -top-2 -left-1 text-4xl text-gray-100 font-serif leading-none select-none">
                “
              </span>
              <p className="relative text-sm text-gray-600 font-medium leading-relaxed pl-2">
                {expert.tip}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Footer Link */}
      <div className="mt-6 text-center sm:hidden">
        <button className="text-sm font-bold text-violet-600 hover:text-violet-700">
          View all guides →
        </button>
      </div>
    </section>
  );
}