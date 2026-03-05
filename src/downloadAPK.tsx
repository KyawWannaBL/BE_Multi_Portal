const APK_URL =
  "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/app-releases/app-debug.apk";

const downloadAPK = () => {
  window.open(APK_URL, "_blank", "noopener,noreferrer");
};
