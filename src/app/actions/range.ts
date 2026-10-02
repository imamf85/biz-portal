"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RANGE_COOKIE, type ActiveRangeValue } from "@/lib/active-range";

export async function setActiveRange(value: ActiveRangeValue, path: string) {
  const store = await cookies();
  store.set(RANGE_COOKIE, JSON.stringify(value), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath(path);
}
