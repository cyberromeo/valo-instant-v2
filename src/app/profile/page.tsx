import type { Metadata } from "next";
import { ProfileView } from "@/components/party/ProfileView";
import { henrikConfigured } from "@/lib/henrik";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() { return <ProfileView lookupAvailable={henrikConfigured()} />; }
