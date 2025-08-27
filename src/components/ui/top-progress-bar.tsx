import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger on route change
    setIsVisible(true);
    setProgress(0);

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 10));
    }, 100);

    const completeTimeout = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    }, 800);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(completeTimeout);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}