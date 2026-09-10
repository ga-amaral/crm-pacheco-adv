"use client";
import { useRouter } from "next/navigation";
import { LeadForm } from "@/components/leads/lead-form";
export default function NewLeadPage() { const router = useRouter(); return <LeadForm onCreated={() => router.push("/")} onClose={() => router.push("/")} />; }
