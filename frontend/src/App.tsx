import { useState } from "react";
import logo from "./assets/images/logo-universal.png";
import { Greet } from "../wailsjs/go/main/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  const [resultText, setResultText] = useState<string>("Please enter your name below 👇");
  const [name, setName] = useState<string>("");

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  function greet() {
    Greet(name).then(updateResultText);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">

        <Card className="w-full border-border/40 shadow-lg backdrop-blur-sm bg-card/50">
          <div className="flex justify-center">
            <img src={logo} alt="logo" className="h-24 w-auto" />
          </div>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Wails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-muted-foreground">{resultText}</div>

            <div className="flex items-center space-x-2">
              <Input id="name" className="flex-1" onChange={updateName} autoComplete="off" name="input" type="text" placeholder="Your Name" />
              <Button onClick={greet}>Greet</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
