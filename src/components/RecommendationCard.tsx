"use client";

import { useState, useEffect } from "react";
import { Phase } from "@/hooks/usePomodoro";
import { recommendations } from "@/data/recommendations";
import { trackAffiliateClick } from "@/lib/analytics";
import { Recommendation } from "@/types";

interface RecommendationCardProps {
  phase: Phase;
}

export default function RecommendationCard({ phase }: RecommendationCardProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );

  const isBreak = phase === "shortBreak" || phase === "longBreak";

  useEffect(() => {
    if (!isBreak) return;
    const pick =
      recommendations[Math.floor(Math.random() * recommendations.length)];
    setRecommendation(pick);
  }, [isBreak]);

  if (!isBreak || !recommendation) return null;

  return (
    <div
      key={recommendation.id}
      className="animate-fade-in mt-4 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      <p className="mb-3 text-xs text-gray-500">休息一下，看看这个</p>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{recommendation.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{recommendation.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            {recommendation.description}
          </p>
          <a
            href={recommendation.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateClick(recommendation.name)}
            className="mt-3 inline-block text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            了解更多 →
          </a>
        </div>
      </div>
    </div>
  );
}
