import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadForm } from "@/components/leads/lead-form";

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.id).single();
  if (!lead) notFound();
  return <LeadForm initialLead={lead} />;
}
