import type { ScreenConfig } from "../types";

export const screens: ScreenConfig[] = [
  {
    key: "branches",
    title: { en: "Branch List", my: "ရုံးခွဲစာရင်း" },
    description: {
      en: "Reusable branch listing screen for shared portal content.",
      my: "Portal များအကြား အကြောင်းအရာတူညီသော ရုံးခွဲစာရင်းမျက်နှာပြင်။"
    },
    endpoint: "/api/branches",
    mergeCandidateKeys: ["admin.branches", "branch.branches", "operations.branches"],
    columns: [
      { key: "code", label: { en: "Code", my: "ကုဒ်" } },
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "city", label: { en: "City", my: "မြို့" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "branchForm",
    title: { en: "Branch Form", my: "ရုံးခွဲဖောင်" },
    description: {
      en: "Create or update branch records.",
      my: "ရုံးခွဲအသစ်ဖန်တီးရန် သို့မဟုတ် ပြင်ဆင်ရန်။"
    },
    endpoint: "/api/branches/form-meta",
    mergeCandidateKeys: ["admin.branch.create", "branch.branch.create"],
    columns: []
  },
  {
    key: "merchants",
    title: { en: "Merchant List", my: "ကုန်သည်စာရင်း" },
    description: {
      en: "Shared merchant list screen across eligible portals.",
      my: "အသုံးပြုနိုင်သော portal များအကြား မျှဝေသုံးနိုင်သော ကုန်သည်စာရင်း။"
    },
    endpoint: "/api/merchants",
    mergeCandidateKeys: ["admin.merchants", "merchant.merchants", "finance.merchants"],
    columns: [
      { key: "merchantCode", label: { en: "Merchant Code", my: "ကုန်သည်ကုဒ်" } },
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "phone", label: { en: "Phone", my: "ဖုန်း" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "merchantAccounts",
    title: { en: "Merchant Accounts", my: "ကုန်သည်အကောင့်များ" },
    description: {
      en: "Merchant account and balance view.",
      my: "ကုန်သည်အကောင့်နှင့် လက်ကျန်ပြသမှု။"
    },
    endpoint: "/api/merchant-accounts",
    mergeCandidateKeys: ["merchant.accounts", "finance.merchantAccounts"],
    columns: [
      { key: "accountNo", label: { en: "Account No", my: "အကောင့်နံပါတ်" } },
      { key: "accountName", label: { en: "Account Name", my: "အကောင့်အမည်" } },
      { key: "balance", label: { en: "Balance", my: "လက်ကျန်" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "transactions",
    title: { en: "Transactions", my: "ငွေလွှဲမှတ်တမ်းများ" },
    description: {
      en: "Transaction records shared between finance and merchant flows.",
      my: "Finance နှင့် Merchant flow များအကြား မျှဝေသုံးနိုင်သော ငွေလွှဲမှတ်တမ်းများ။"
    },
    endpoint: "/api/transactions",
    mergeCandidateKeys: ["finance.transactions", "merchant.transactions"],
    columns: [
      { key: "txnId", label: { en: "Transaction ID", my: "ငွေလွှဲအိုင်ဒီ" } },
      { key: "date", label: { en: "Date", my: "ရက်စွဲ" } },
      { key: "amount", label: { en: "Amount", my: "ပမာဏ" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "users",
    title: { en: "Users", my: "အသုံးပြုသူများ" },
    description: {
      en: "Shared user management screen.",
      my: "မျှဝေသုံးနိုင်သော အသုံးပြုသူစီမံခန့်ခွဲမှု မျက်နှာပြင်။"
    },
    endpoint: "/api/users",
    mergeCandidateKeys: ["admin.users", "branch.users", "merchant.users"],
    columns: [
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "email", label: { en: "Email", my: "အီးမေးလ်" } },
      { key: "phone", label: { en: "Phone", my: "ဖုန်း" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "roles",
    title: { en: "Roles", my: "တာဝန်ပေးအဆင့်များ" },
    description: {
      en: "Role management screen.",
      my: "Role စီမံခန့်ခွဲမှု မျက်နှာပြင်။"
    },
    endpoint: "/api/roles",
    mergeCandidateKeys: ["admin.roles"],
    columns: [
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "description", label: { en: "Description", my: "ဖော်ပြချက်" } }
    ]
  },
  {
    key: "permissions",
    title: { en: "Permissions", my: "ခွင့်ပြုချက်များ" },
    description: {
      en: "Permission management screen.",
      my: "ခွင့်ပြုချက်စီမံခန့်ခွဲမှု မျက်နှာပြင်။"
    },
    endpoint: "/api/permissions",
    mergeCandidateKeys: ["admin.permissions"],
    columns: [
      { key: "module", label: { en: "Module", my: "မော်ဂျူး" } },
      { key: "action", label: { en: "Action", my: "လုပ်ဆောင်ချက်" } }
    ]
  },
  {
    key: "partners",
    title: { en: "Partners", my: "မိတ်ဖက်များ" },
    description: {
      en: "Partner management screen.",
      my: "မိတ်ဖက်စီမံခန့်ခွဲမှု မျက်နှာပြင်။"
    },
    endpoint: "/api/partners",
    mergeCandidateKeys: ["admin.partners", "operations.partners"],
    columns: [
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "code", label: { en: "Code", my: "ကုဒ်" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "affiliates",
    title: { en: "Affiliates", my: "ဆက်စပ်အဖွဲ့များ" },
    description: {
      en: "Affiliate management screen.",
      my: "ဆက်စပ်အဖွဲ့စီမံခန့်ခွဲမှု မျက်နှာပြင်။"
    },
    endpoint: "/api/affiliates",
    mergeCandidateKeys: ["admin.affiliates", "operations.affiliates"],
    columns: [
      { key: "name", label: { en: "Name", my: "အမည်" } },
      { key: "code", label: { en: "Code", my: "ကုဒ်" } },
      { key: "status", label: { en: "Status", my: "အခြေအနေ" } }
    ]
  },
  {
    key: "accounting",
    title: { en: "Accounting Entries", my: "စာရင်းကိုင်မှတ်တမ်းများ" },
    description: {
      en: "Accounting entry screen with production API only.",
      my: "Production API သီးသန့်အသုံးပြုသော စာရင်းကိုင်မှတ်တမ်း မျက်နှာပြင်။"
    },
    endpoint: "/api/accounting-entries",
    mergeCandidateKeys: ["finance.entries", "finance.accounting"],
    columns: [
      { key: "entryNo", label: { en: "Entry No", my: "မှတ်တမ်းနံပါတ်" } },
      { key: "account", label: { en: "Account", my: "အကောင့်" } },
      { key: "debit", label: { en: "Debit", my: "ဒက်ဘစ်" } },
      { key: "credit", label: { en: "Credit", my: "ခရက်ဒစ်" } }
    ]
  }
];
