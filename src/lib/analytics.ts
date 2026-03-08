declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

export function trackStyleSelect(styleId: string) {
  gtag("event", "style_select", { style: styleId });
}

export function trackAffiliateClick(toolName: string) {
  gtag("event", "affiliate_click", { tool_name: toolName });
}

export function trackPomodoroComplete(count: number) {
  gtag("event", "pomodoro_complete", { count });
}
