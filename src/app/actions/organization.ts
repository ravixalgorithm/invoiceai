"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteUser(organizationId: string, email: string) {
    const supabase = await createClient();

    // Check if current user is owner
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)
        .eq('user_id', user.id)
        .single();

    if (!org) return { error: "Permission denied" };

    // Check existing invite
    const { data: existing } = await supabase
        .from('organization_invites')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

    if (existing) return { error: "Invite already exists" };

    // Create Invite
    const { error } = await supabase.from('organization_invites').insert({
        organization_id: organizationId,
        email: email,
        status: 'pending'
    });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/organization');
    return { success: true };
}

export async function acceptInvite(inviteId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email === undefined) return { error: "Unauthorized" };

    // Fetch Invite
    const { data: invite } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

    if (!invite || invite.status !== 'pending') return { error: "Invalid invite" };
    if (invite.email !== user.email) return { error: "Email mismatch" };

    // Transaction-like operations
    // 1. Add to members
    const { error: memberError } = await supabase.from('organization_members').insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: 'member'
    });

    if (memberError) return { error: memberError.message };

    // 2. Update invite status
    await supabase
        .from('organization_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

    revalidatePath('/dashboard');
    return { success: true };
}

export async function rejectInvite(inviteId: string) {
    const supabase = await createClient();

    await supabase
        .from('organization_invites')
        .update({ status: 'rejected' })
        .eq('id', inviteId);

    revalidatePath('/dashboard');
    return { success: true };
}

export async function removeMember(organizationId: string, memberId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Verify Owner
    const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)
        .eq('user_id', user.id)
        .single();

    if (!org) return { error: "Permission denied" };

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', memberId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/organization');
    return { success: true };
}
