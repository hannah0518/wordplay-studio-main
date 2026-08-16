import { PartyPopper, Star } from "lucide-react";
import type { Badge } from "@/lib/game-state";
import { DynamicIcon } from "./dynamic-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function LevelUpModal({
  level,
  onClose,
}: {
  level: number | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={level !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <DialogTitle className="sr-only">Level up</DialogTitle>
        <div className="animate-float mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-primary to-berry text-primary-foreground">
          <Star className="size-12" />
        </div>
        <h2 className="text-3xl">Level {level}!</h2>
        <p className="text-sm text-muted-foreground">
          You are getting stronger in English. Keep the streak alive!
        </p>
        <Button onClick={onClose}>Let&apos;s keep going</Button>
      </DialogContent>
    </Dialog>
  );
}

export function BadgeModal({
  badge,
  onClose,
}: {
  badge: Badge | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={badge !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <DialogTitle className="sr-only">Badge unlocked</DialogTitle>
        <div className="animate-pop-in mx-auto grid size-20 place-items-center rounded-3xl bg-accent text-accent-foreground">
          <DynamicIcon name={badge?.icon ?? "award"} className="size-10" />
        </div>
        <h2 className="flex items-center justify-center gap-2 text-2xl">
          <PartyPopper className="size-5 text-primary" /> Badge unlocked
        </h2>
        <p className="font-bold">{badge?.name}</p>
        <p className="text-sm text-muted-foreground">{badge?.description}</p>
        <Button onClick={onClose}>Nice!</Button>
      </DialogContent>
    </Dialog>
  );
}
