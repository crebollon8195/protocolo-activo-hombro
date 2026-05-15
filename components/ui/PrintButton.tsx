"use client";
import { Download } from "lucide-react";
import { Button } from "./button";

export function PrintButton({ label }: { label: string }) {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-primary hover:bg-dark text-white font-primary font-semibold px-8 py-3 rounded-xl flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
}
