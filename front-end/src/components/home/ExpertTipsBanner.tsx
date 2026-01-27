import React from "react";
import { Lightbulb, Sparkles, Target, MessageCircle } from "lucide-react";

const experts = [
  {
    name: "Dr. Alex Rivera",
    role: "Relationship Psychologist",
    image: "https://i.pravatar.cc/150?img=11",
    tip: "Use the conversation hook. Matches are 3x more likely to reply to a specific question.",
    icon: MessageCircle,
    iconColor: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    name: "Sarah Chen",
    role: "Profile Specialist",
    image: "https://i.pravatar.cc/150?img=5",
    tip: "Specifics attract. Instead of 'I like food', try 'I'm searching for the best tacos'.",
    icon: Target,
    iconColor: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    name: "Marcus Johnson",
    role: "Communication Coach",
    image: "https://i.pravatar.cc/150?img=60",
    tip: "Users who fill out all 5 vibe tags get 40% more matches on average.",
    icon: Sparkles,
    iconColor: "text-amber-500",
    bg: "bg-amber-50"
  }
];

export default function ExpertTipsBanner() {
  return (
    <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-violet-100 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-violet-100 text-violet-600">
            <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-black text-gray-900">Expert Tips</h3>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Maximize match potential</p>
          </div>
        </div>
        <button className="text-xs font-bold text-violet-600 hover:text-violet-700 whitespace-nowrap">
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experts.map((expert, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img src={expert.image} alt={expert.name} className="w-10 h-10 rounded-full border border-gray-100" />
              <div>
                <h4 className="font-bold text-sm text-gray-900">{expert.name}</h4>
                <p className="text-[10px] font-bold uppercase text-gray-400">{expert.role}</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">"{expert.tip}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}