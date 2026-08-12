import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrialDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rozpocznij 14 dni za darmo</DialogTitle>
          <DialogDescription>
            Bez karty kredytowej. Konto lokalu tworzysz w minutę.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
            toast.success("Konto testowe utworzone", {
              description: `Wysłaliśmy link aktywacyjny na ${email}.`,
            });
            setName("");
            setEmail("");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="trial-name">Nazwa lokalu</Label>
            <Input
              id="trial-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pizzeria La Torre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trial-email">E-mail służbowy</Label>
            <Input
              id="trial-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kontakt@twojlokal.pl"
            />
          </div>
          <Button type="submit" className="w-full font-semibold">
            Aktywuj darmowy okres próbny
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
