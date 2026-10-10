import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { AimTrainer } from "@/components/wiki/AimTrainer";

export const metadata: Metadata = { title: "Aim Trainer" };

export default function TrainerPage() {
  return (
    <>
      <PageHead kicker="REYNA'S RANGE" title="Shoot the Blind" sub="30 seconds, as many Leers as you can. Tap or click to fire. Every miss, she notices." back={{ href: "/wiki", label: "Wiki" }} />
      <AimTrainer />
    </>
  );
}
