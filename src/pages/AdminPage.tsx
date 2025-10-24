import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminPanel from "@/components/AdminPanel";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already authenticated in session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("adminAuthenticated");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you would send this to a backend API for verification
      // For now, we'll do a simple hash comparison (not secure for production)
      // The default password is "admin123"
      const passwordHash = await hashPassword(adminPassword);

      // For this demo, we'll accept "admin123" directly
      // In production, use proper bcrypt or Argon2 hashing on the backend
      if (adminPassword === "admin123") {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuthenticated", "true");
        toast.success("Admin authenticated successfully!");
      } else {
        toast.error("Incorrect admin password");
        setAdminPassword("");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuthenticated");
    setAdminPassword("");
    navigate("/");
    toast.info("Logged out from admin panel");
  };

  // Simple hash function for demo purposes (NOT FOR PRODUCTION)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  if (isAuthenticated) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-card/95 backdrop-blur-sm border-primary/30 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">Admin Access</h1>
          <p className="text-muted-foreground">
            Enter admin password to access the admin panel
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Admin Password
            </label>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password..."
              disabled={loading}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading || !adminPassword.trim()}
          >
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Game
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;
