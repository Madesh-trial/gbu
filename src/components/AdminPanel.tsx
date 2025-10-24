import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Save, X, Lock, LogOut } from "lucide-react";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer: string;
  hint: string;
  hint_password: string;
  clues?: string[];
}

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question_number: 6,
    question_text: "",
    answer: "",
    hint: "",
    hint_password: "",
    clues: [],
  });
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCluesDialog, setShowCluesDialog] = useState(false);
  const [newClue, setNewClue] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [hintPassword, setHintPassword] = useState("");
  const [newHintPassword, setNewHintPassword] = useState("");
  const [confirmHintPassword, setConfirmHintPassword] = useState("");
  const [gameDuration, setGameDuration] = useState(30);

  useEffect(() => {
    fetchQuestions();
    fetchGameSettings();
  }, []);

  const fetchGameSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_config")
        .select("game_duration_minutes")
        .limit(1)
        .single();

      if (error) {
        console.warn("No admin_config found, using default duration");
        setGameDuration(30);
        return;
      }

      if (data) {
        const config = data as unknown as { game_duration_minutes?: number };
        if (
          config.game_duration_minutes &&
          typeof config.game_duration_minutes === "number" &&
          config.game_duration_minutes > 0
        ) {
          setGameDuration(config.game_duration_minutes);
        } else {
          setGameDuration(30);
        }
      }
    } catch (error) {
      console.error("Error fetching game settings:", error);
      setGameDuration(30);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("question_number", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (
      !newQuestion.question_text ||
      !newQuestion.answer ||
      !newQuestion.hint ||
      !newQuestion.hint_password
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const { error } = await supabase.from("questions").insert([
        {
          question_number: newQuestion.question_number,
          question_text: newQuestion.question_text,
          answer: newQuestion.answer.toLowerCase().trim(),
          hint: newQuestion.hint,
          hint_password: newQuestion.hint_password,
          clues: newQuestion.clues || [],
        },
      ]);

      if (error) throw error;
      toast.success("Question added successfully");
      setNewQuestion({
        question_number: questions.length + 1,
        question_text: "",
        answer: "",
        hint: "",
        hint_password: "",
        clues: [],
      });
      setNewClue("");
      setShowNewDialog(false);
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    }
  };

  const handleUpdateQuestion = async () => {
    if (
      !editingQuestion ||
      !editingQuestion.question_text ||
      !editingQuestion.answer ||
      !editingQuestion.hint ||
      !editingQuestion.hint_password
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("questions")
        .update({
          question_text: editingQuestion.question_text,
          answer: editingQuestion.answer.toLowerCase().trim(),
          hint: editingQuestion.hint,
          hint_password: editingQuestion.hint_password,
          clues: editingQuestion.clues || [],
        })
        .eq("id", editingQuestion.id);

      if (error) throw error;
      toast.success("Question updated successfully");
      setEditingQuestion(null);
      setNewClue("");
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) throw error;
      toast.success("Question deleted successfully");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleUpdateGameDuration = async () => {
    if (!gameDuration || gameDuration < 1 || gameDuration > 120) {
      toast.error("Game duration must be between 1 and 120 minutes");
      return;
    }

    try {
      // First, check if admin_config exists
      const { data: existingConfig, error: fetchError } = await supabase
        .from("admin_config")
        .select("id")
        .limit(1)
        .single();

      if (fetchError) {
        // If no config exists, we need to create one
        toast.error(
          "Admin config not found. Please initialize database first."
        );
        return;
      }

      // Update the existing config
      const { error: updateError } = await supabase
        .from("admin_config")
        .update({ game_duration_minutes: gameDuration })
        .eq("id", existingConfig.id);

      if (updateError) throw updateError;
      toast.success(`Game duration updated to ${gameDuration} minutes`);
      setShowSettingsDialog(false);
    } catch (error) {
      console.error("Error updating game duration:", error);
      toast.error("Failed to update game duration");
    }
  };

  const handleUpdatePasswords = async () => {
    // Validate passwords
    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      toast.error("Admin passwords do not match");
      return;
    }
    if (newHintPassword && newHintPassword !== confirmHintPassword) {
      toast.error("Hint passwords do not match");
      return;
    }

    // Note: In a real application, passwords should be hashed using a secure backend.
    // This is a simplified demo - passwords are sent as-is to demonstrate the feature.
    // TODO: Implement proper hashing using Supabase Edge Functions
    toast.info(
      "Password update feature requires backend implementation. Please use database directly or implement Edge Function."
    );
    setShowPasswordDialog(false);
    setAdminPassword("");
    setNewAdminPassword("");
    setConfirmAdminPassword("");
    setHintPassword("");
    setNewHintPassword("");
    setConfirmHintPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage questions, hints, and passwords
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(true)}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Game Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Manage Passwords
            </Button>
            <Button
              variant="destructive"
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Add New Question Button */}
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Question
        </Button>

        {/* Questions List */}
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading questions...
          </Card>
        ) : questions.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No questions yet. Add one to get started!
          </Card>
        ) : (
          <div className="grid gap-4">
            {questions.map((question) => (
              <Card
                key={question.id}
                className="p-6 space-y-4 border-primary/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                        {question.question_number}
                      </span>
                      <h3 className="text-lg font-semibold text-primary">
                        {question.question_text}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-muted/30 p-3 rounded border border-muted">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">
                          ANSWER
                        </p>
                        <p className="text-foreground font-mono">
                          {question.answer}
                        </p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded border border-muted">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">
                          HINT
                        </p>
                        <p className="text-foreground">{question.hint}</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded border border-muted">
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        HINT PASSWORD
                      </p>
                      <p className="text-foreground font-mono">
                        {question.hint_password}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingQuestion(question)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Question Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new question with its answer, hint, and hint password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Question Number
              </label>
              <Input
                type="number"
                value={newQuestion.question_number}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_number: parseInt(e.target.value),
                  })
                }
                placeholder="e.g., 6"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Question Text
              </label>
              <Input
                value={newQuestion.question_text}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_text: e.target.value,
                  })
                }
                placeholder="Enter the question..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Answer
              </label>
              <Input
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, answer: e.target.value })
                }
                placeholder="Enter the answer..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Hint
              </label>
              <Input
                value={newQuestion.hint}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, hint: e.target.value })
                }
                placeholder="Enter a helpful hint..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Hint Password
              </label>
              <Input
                value={newQuestion.hint_password || ""}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    hint_password: e.target.value,
                  })
                }
                placeholder="Enter password to unlock this hint..."
              />
            </div>

            {/* Clues Management Section for New Question */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Clues for this Question
                </label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setNewQuestion({
                      ...newQuestion,
                      clues: [...(newQuestion.clues || []), newClue],
                    });
                    setNewClue("");
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Clue
                </Button>
              </div>

              {newQuestion.clues && newQuestion.clues.length > 0 && (
                <div className="space-y-2 bg-muted/30 p-3 rounded">
                  {newQuestion.clues.map((clue, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Clue {index + 1}:
                        </p>
                        <p className="text-sm text-muted-foreground">{clue}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setNewQuestion({
                            ...newQuestion,
                            clues: newQuestion.clues?.filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Input
                value={newClue}
                onChange={(e) => setNewClue(e.target.value)}
                placeholder="Enter a clue and click 'Add Clue' button..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newClue.trim()) {
                    setNewQuestion({
                      ...newQuestion,
                      clues: [...(newQuestion.clues || []), newClue],
                    });
                    setNewClue("");
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddQuestion}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={() => setEditingQuestion(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question, answer, hint, or hint password
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Question Number
                </label>
                <Input
                  type="number"
                  value={editingQuestion.question_number}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question_number: parseInt(e.target.value),
                    })
                  }
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Question Text
                </label>
                <Input
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question_text: e.target.value,
                    })
                  }
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Answer
                </label>
                <Input
                  value={editingQuestion.answer}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      answer: e.target.value,
                    })
                  }
                  placeholder="Enter the answer..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Hint
                </label>
                <Input
                  value={editingQuestion.hint}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      hint: e.target.value,
                    })
                  }
                  placeholder="Enter a helpful hint..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Hint Password
                </label>
                <Input
                  value={editingQuestion.hint_password || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      hint_password: e.target.value,
                    })
                  }
                  placeholder="Enter password to unlock this hint..."
                />
              </div>

              {/* Clues Management Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Clues for this Question
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingQuestion({
                        ...editingQuestion,
                        clues: [...(editingQuestion.clues || []), newClue],
                      });
                      setNewClue("");
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Clue
                  </Button>
                </div>

                {editingQuestion.clues && editingQuestion.clues.length > 0 && (
                  <div className="space-y-2 bg-muted/30 p-3 rounded">
                    {editingQuestion.clues.map((clue, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-background rounded border border-border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            Clue {index + 1}:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {clue}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setEditingQuestion({
                              ...editingQuestion,
                              clues: editingQuestion.clues?.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Input
                  value={newClue}
                  onChange={(e) => setNewClue(e.target.value)}
                  placeholder="Enter a clue and click 'Add Clue' button..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newClue.trim()) {
                      setEditingQuestion({
                        ...editingQuestion,
                        clues: [...(editingQuestion.clues || []), newClue],
                      });
                      setNewClue("");
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateQuestion}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Management Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Passwords</DialogTitle>
            <DialogDescription>
              Update admin and hint unlock passwords
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Admin Password Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Admin Password</h3>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Current Admin Password
                </label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter current admin password"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  New Admin Password
                </label>
                <Input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new admin password (leave blank to keep current)"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Confirm New Admin Password
                </label>
                <Input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Confirm new admin password"
                />
              </div>
            </div>

            {/* Hint Password Section */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-foreground">
                Hint Unlock Password (for users)
              </h3>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Current Hint Password
                </label>
                <Input
                  type="password"
                  value={hintPassword}
                  onChange={(e) => setHintPassword(e.target.value)}
                  placeholder="Enter current hint password"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  New Hint Password
                </label>
                <Input
                  type="password"
                  value={newHintPassword}
                  onChange={(e) => setNewHintPassword(e.target.value)}
                  placeholder="Enter new hint password (leave blank to keep current)"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Confirm New Hint Password
                </label>
                <Input
                  type="password"
                  value={confirmHintPassword}
                  onChange={(e) => setConfirmHintPassword(e.target.value)}
                  placeholder="Confirm new hint password"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePasswords}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Passwords
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription>Configure game parameters</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Game Duration (Minutes)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={gameDuration || 30}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setGameDuration(30);
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setGameDuration(parsed);
                      }
                    }
                  }}
                  placeholder="Enter game duration in minutes"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  min
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valid range: 1 - 120 minutes (default: 30)
              </p>
            </div>

            <div className="flex gap-3 justify-end border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateGameDuration}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
