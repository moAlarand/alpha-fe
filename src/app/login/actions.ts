'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log(data);

  const { error } = await supabase.auth.signInWithPassword(data);
  console.log("🚀 ~ login ~ error:", error?.cause);

  if (error) {
    redirect(`/error?message=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/stocks");
}

export async function signup(formData: FormData) {
  console.log(formData);
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);
  console.log(error);
  if (error) {
    redirect(`/error?message=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/account");
}