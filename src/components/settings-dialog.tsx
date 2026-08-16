import { useState } from "react";
import { Settings, Key, Check, Loader2, Sparkles, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createClient } from "@supabase/supabase-js";

import { sanitizeSupabaseUrl } from "@/lib/supabase";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage("gemini-api-key", "");
  const [supabaseUrl, setSupabaseUrl] = useLocalStorage("supabase-url", "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useLocalStorage("supabase-anon-key", "");

  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempUrl, setTempUrl] = useState(supabaseUrl);
  const [tempAnonKey, setTempAnonKey] = useState(supabaseAnonKey);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Sync temp state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempApiKey(apiKey);
      setTempUrl(supabaseUrl);
      setTempAnonKey(supabaseAnonKey);
    }
    setOpen(newOpen);
  };

  const handleSave = () => {
    const cleanUrl = sanitizeSupabaseUrl(tempUrl);
    setApiKey(tempApiKey.trim());
    setSupabaseUrl(cleanUrl);
    setSupabaseAnonKey(tempAnonKey.trim());
    toast.success("Settings saved to browser local storage.");
    setOpen(false);
  };

  const handleTestGemini = async () => {
    if (!tempApiKey.trim()) {
      toast.error("Please enter a Gemini API Key to test.");
      return;
    }

    setIsTestingGemini(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${tempApiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Hello! Reply 'OK' if you can read this." }] }],
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google API Error [${res.status}]: ${errText}`);
      }

      toast.success("Gemini API Key is valid!");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify API Key.");
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleTestSupabase = async () => {
    const cleanUrl = sanitizeSupabaseUrl(tempUrl);
    if (!cleanUrl || !tempAnonKey.trim()) {
      toast.error("Please enter both Supabase URL and Key to test.");
      return;
    }

    setIsTestingSupabase(true);
    try {
      const client = createClient(cleanUrl, tempAnonKey.trim());
      const { error } = await client.auth.getSession();
      if (error) {
        throw error;
      }
      toast.success("Supabase Connection Successful!");
    } catch (error: any) {
      toast.error(`Supabase Error: ${error.message || "Connection failed"}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="size-5 text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> System Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI & Database keys. Saved locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Gemini API Key */}
          <div className="grid gap-2">
            <Label htmlFor="api-key" className="flex items-center gap-2 font-medium">
              <Key className="size-4 text-primary" /> Gemini API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestGemini}
                disabled={isTestingGemini || !tempApiKey.trim()}
              >
                {isTestingGemini ? <Loader2 className="size-4 animate-spin" /> : "Test AI"}
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Supabase Config */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 font-medium">
                <Database className="size-4 text-emerald-500" /> Supabase Connection
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase || !tempUrl.trim() || !tempAnonKey.trim()}
              >
                {isTestingSupabase ? <Loader2 className="size-3 animate-spin" /> : "Test Database"}
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supabase-url" className="text-xs text-muted-foreground">
                Project URL
              </Label>
              <Input
                id="supabase-url"
                type="text"
                placeholder="https://xyz.supabase.co"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supabase-anon" className="text-xs text-muted-foreground">
                Anon / Publishable Key
              </Label>
              <Input
                id="supabase-anon"
                type="password"
                placeholder="eyJhbGci... or sb_publishable_..."
                value={tempAnonKey}
                onChange={(e) => setTempAnonKey(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button onClick={handleSave}>
              <Check className="mr-2 size-4" /> Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
