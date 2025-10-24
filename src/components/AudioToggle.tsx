import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

const AudioToggle = ({ isMuted, onToggle }: AudioToggleProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="fixed top-4 right-4 md:right-4 z-40 bg-card/80 backdrop-blur-sm border-primary/30 hover:bg-card hover:border-primary transition-all"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary" />
      )}
    </Button>
  );
};

export default AudioToggle;
