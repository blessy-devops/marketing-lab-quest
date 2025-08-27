import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TopProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading") {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => clearInterval(timer);
    } else {
      if (isVisible) {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 200);
      }
    }
  }, [navigation.state, isVisible]);

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