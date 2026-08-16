import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      toast.error("Supabase is not configured. Please add your Supabase URL & Anon Key in Settings.");
      return { error: new Error("Supabase not configured") };
    }
    const res = await supabase.auth.signUp({ email, password });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Account created successfully! Check your email or sign in.");
    }
    return res;
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      toast.error("Supabase is not configured. Please add your Supabase URL & Anon Key in Settings.");
      return { error: new Error("Supabase not configured") };
    }
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Signed in successfully!");
    }
    return res;
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const res = await supabase.auth.signOut();
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Signed out.");
    }
    return res;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isConfigured: !!getSupabase(),
  };
}
