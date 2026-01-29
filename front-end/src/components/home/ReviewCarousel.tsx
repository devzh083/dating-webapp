import React from 'react';

const reviews = [
  { id: 1, name: "Sarah K.", role: "Verified User", text: "I was skeptical about online dating, but the privacy features here made me feel so safe. Found my match in 2 weeks!" },
  { id: 2, name: "Mike R.", role: "Premium Member", text: "The quality of matches is just superior. No spam, just real people looking for genuine connections." },
  { id: 3, name: "Priya M.", role: "Verified User", text: "Finally, an app that focuses on personality first. The 'blind match' feature is a game changer." },
  { id: 4, name: "James L.", role: "Verified User", text: "The UI is so clean and easy to use. Had a great date last night thanks to this app!" },
  { id: 5, name: "Anita S.", role: "Verified User", text: "I love that I can control who sees my profile. Privacy was my #1 concern and they nailed it." },
];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
  <div className="flex-shrink-0 w-[280px] md:w-80 p-5 md:p-6 mx-3 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center mb-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
        {review.name[0]}
      </div>
      <div className="ml-3">
        <h4 className="font-bold text-gray-900 text-xs md:text-sm">{review.name}</h4>
        <span className="text-[9px] uppercase tracking-wider text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
          {review.role}
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-xs md:text-sm leading-relaxed italic line-clamp-3">"{review.text}"</p>
    <div className="mt-3 flex text-yellow-400 text-xs gap-0.5">
      {'★'.repeat(5)}
    </div>
  </div>
);

export default function ReviewCarousel() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 rounded-[2rem] p-6 md:p-8 border border-gray-100 overflow-hidden relative group">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-black text-gray-900">Success Stories</h2>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Join thousands of happy couples</p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden mask-linear-fade">
        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

        <div className="flex animate-scroll w-max">
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}