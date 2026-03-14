import LanguageToggle from "@/components/common/LanguageToggle";
import { Link } from "react-router-dom";

const bilingualMenuItems = [
  { key: "branches", path: "/portal/bilingual/branches", labelEn: "Branches", labelMy: "ရုံးခွဲများ" },
  { key: "merchants", path: "/portal/bilingual/merchants", labelEn: "Merchants", labelMy: "ကုန်သည်များ" },
  { key: "merchantAccounts", path: "/portal/bilingual/merchant-accounts", labelEn: "Merchant Accounts", labelMy: "ကုန်သည်အကောင့်များ" },
  { key: "transactions", path: "/portal/bilingual/transactions", labelEn: "Transactions", labelMy: "ငွေလွှဲမှတ်တမ်းများ" },
  { key: "users", path: "/portal/bilingual/users", labelEn: "Users", labelMy: "အသုံးပြုသူများ" },
  { key: "roles", path: "/portal/bilingual/roles", labelEn: "Roles", labelMy: "တာဝန်ပေးအဆင့်များ" },
  { key: "permissions", path: "/portal/bilingual/permissions", labelEn: "Permissions", labelMy: "ခွင့်ပြုချက်များ" },
  { key: "partners", path: "/portal/bilingual/partners", labelEn: "Partners", labelMy: "မိတ်ဖက်များ" },
  { key: "affiliates", path: "/portal/bilingual/affiliates", labelEn: "Affiliates", labelMy: "ဆက်စပ်အဖွဲ့များ" },
  { key: "accounting", path: "/portal/bilingual/accounting", labelEn: "Accounting", labelMy: "စာရင်းကိုင်" }
];

export default function BilingualPortalMenu() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {bilingualMenuItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          className="text-sm text-gray-300 hover:text-gold-400"
        >
          {item.labelEn}
        </Link>
      ))}
      <div className="ml-auto">
        <LanguageToggle />
      </div>
    </div>
  );
}
