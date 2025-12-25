import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function SetupWizardPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tighter">WELCOME</h1>
          <p className="text-zinc-400">
            Let's set up your ultimate launcher experience.
          </p>
        </div>

        <Button
          className="w-full bg-zinc-100 text-black hover:bg-white font-bold tracking-widest h-12"
          onClick={() => navigate("/")}
        >
          START SETUP
        </Button>
      </div>
    </div>
  );
}
