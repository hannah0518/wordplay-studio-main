import { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, Loader2, ShieldCheck, Database } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, isConfigured } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (!error) {
      setOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password);
    setIsSubmitting(false);
    if (!error) {
      setOpen(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <LogIn className="size-4" /> Đăng nhập
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-500" /> Tài khoản WordPlay
          </DialogTitle>
          <DialogDescription>
            Đăng nhập hoặc tạo tài khoản mới để lưu bài học & tiến trình của bạn.
          </DialogDescription>
        </DialogHeader>

        {!isConfigured && (
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-xs flex items-center gap-2 border border-amber-500/20">
            <Database className="size-4 shrink-0" />
            <span>Chưa cấu hình Supabase. Vui lòng bấm vào <b>Settings (Bánh răng)</b> để nhập URL và Anon Key.</span>
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
            <TabsTrigger value="signup">Đăng ký</TabsTrigger>
          </TabsList>

          {/* TAB DANG NHAP */}
          <TabsContent value="signin" className="space-y-4 pt-3">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-1 text-xs">
                  <Mail className="size-3.5" /> Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-1 text-xs">
                  <Lock className="size-3.5" /> Mật khẩu
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !isConfigured}>
                {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogIn className="mr-2 size-4" />}
                Đăng nhập
              </Button>
            </form>
          </TabsContent>

          {/* TAB DANG KY */}
          <TabsContent value="signup" className="space-y-4 pt-3">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-1 text-xs">
                  <Mail className="size-3.5" /> Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-1 text-xs">
                  <Lock className="size-3.5" /> Mật khẩu (tối thiểu 6 ký tự)
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !isConfigured}>
                {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UserPlus className="mr-2 size-4" />}
                Tạo tài khoản mới
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
