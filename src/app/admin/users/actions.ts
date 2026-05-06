"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  try {
    const supabase = createAdminClient();
    
    // 1. Delete from auth.users (this will cascade to profiles if configured, 
    // but we'll be explicit if needed)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    
    if (error) throw error;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating role:", error);
    return { success: false, error: error.message };
  }
}
