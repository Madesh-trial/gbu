import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, X, Clock, Target } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  attempts: number;
  time_taken: number | null;
  timestamp: string;
}

interface LeaderboardProps {
  onClose: () => void;
  currentUserName?: string;
}

const Leaderboard = ({ onClose, currentUserName }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      let query = supabase
        .from("treasure_unlocks")
        .select("*")
        .eq("level", 5)
        .order("time_taken", { ascending: true })
        .limit(100);

      // Apply time filter
      if (filter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("timestamp", today.toISOString());
      } else if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("timestamp", weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "treasure_unlocks",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return (
          <span className="w-6 text-center font-bold text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAdminLogin = () => {
    const password = prompt("Enter admin password:");
    const ADMIN_PASSWORD = "admin123";

    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminPrompt(false);
      toast.success("Admin access granted");
    } else if (password !== null) {
      toast.error("Incorrect password");
    }
  };

  const handleResetLeaderboard = async () => {
    if (!isAdmin) {
      handleAdminLogin();
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete ALL leaderboard data? This cannot be undone!"
      )
    ) {
      return;
    }

    try {
      // First, get all entries
      const { data: allEntries, error: fetchError } = await supabase
        .from("treasure_unlocks")
        .select("id");

      if (fetchError) throw fetchError;

      if (!allEntries || allEntries.length === 0) {
        toast.info("Leaderboard is already empty");
        return;
      }

      // Delete all entries by their IDs
      const { error: deleteError } = await supabase
        .from("treasure_unlocks")
        .delete()
        .in(
          "id",
          allEntries.map((entry) => entry.id)
        );

      if (deleteError) throw deleteError;

      // Immediately clear the leaderboard entries on screen
      setEntries([]);

      toast.success(
        `Leaderboard has been reset! Deleted ${allEntries.length} entries.`
      );
    } catch (error) {
      console.error("Error resetting leaderboard:", error);
      toast.error(
        `Failed to reset leaderboard: ${error.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card/95 backdrop-blur-sm border-2 border-primary/50 shadow-[0_0_80px_20px_rgba(255,215,0,0.3)]">
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-gold animate-glow flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-background" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hall of Fame
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                🏆 Legendary treasure hunters
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/20 hover:text-primary transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="p-2 sm:p-4 border-b border-primary/20 flex flex-col sm:flex-row gap-2 bg-muted/30 justify-between">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={`text-xs sm:text-sm ${
                filter === "all" ? "bg-primary shadow-gold" : ""
              }`}
            >
              All Time
            </Button>
            <Button
              variant={filter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("today")}
              className={`text-xs sm:text-sm ${
                filter === "today" ? "bg-primary shadow-gold" : ""
              }`}
            >
              Today
            </Button>
            <Button
              variant={filter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("week")}
              className={`text-xs sm:text-sm ${
                filter === "week" ? "bg-primary shadow-gold" : ""
              }`}
            >
              This Week
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetLeaderboard}
            className={`text-xs sm:text-sm flex-shrink-0 ${
              isAdmin ? "bg-red-600 hover:bg-red-700" : ""
            }`}
          >
            {isAdmin ? "🔓 Reset" : "🔒 Admin"}
          </Button>
        </div>

        {/* Leaderboard List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No entries yet. Be the first to complete the quest!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-2 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 ${
                    entry.display_name === currentUserName
                      ? "bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-l-4 border-primary shadow-gold"
                      : "hover:bg-muted/50"
                  } ${
                    index < 3
                      ? "bg-gradient-to-r from-primary/5 to-transparent"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4 w-full">
                    <div className="flex-shrink-0 w-8">
                      {getRankIcon(index + 1)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-2 text-sm sm:text-base">
                        {entry.display_name}
                        {entry.display_name === currentUserName && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/40 font-bold animate-glow flex-shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap justify-end sm:justify-start">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {entry.attempts}
                        </span>
                      </div>
                      {entry.time_taken && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {formatTime(entry.time_taken)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
