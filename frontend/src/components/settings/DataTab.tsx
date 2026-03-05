import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FolderOpen, AlertTriangle } from "lucide-react";

interface DataTabProps {
  dataPath: string;
  setDataPath: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function DataTab({
  dataPath,
  setDataPath,
  onSave,
  isSaving,
}: DataTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Storage Location</CardTitle>
          <CardDescription>
            Choose where Nezord Launcher stores its data (instances, libraries,
            assets).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data Path</Label>
            <div className="flex gap-2">
              <Input
                value={dataPath}
                onChange={(e) => setDataPath(e.target.value)}
                placeholder="/home/user/.local/share/NezordLauncher"
                className="font-mono"
              />
              <Button variant="secondary" size="icon">
                <FolderOpen size={16} />
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-yellow-500/10 p-4 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 mt-0.5" size={18} />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Restart Required</p>
                <p className="text-muted-foreground mt-1">
                  Changing the data path requires a launcher restart. Ensure all
                  instances are closed before proceeding.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end bg-muted/20 py-4">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
