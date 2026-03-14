// @ts-nocheck
/**
 * UI Helpers (EN/MM)
 * EN: cn() helper similar to shadcn.
 * MY: shadcn လို className တွေကို စုပေါင်းဖို့ cn() helper.
 */
export function cn(...args: any[]) {
  return args
    .flat()
    .filter(Boolean)
    .join(" ")
    .trim();
}
