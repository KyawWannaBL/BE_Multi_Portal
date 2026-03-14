import {
  LayoutDashboard,
  PlusSquare,
  Route,
  PackageSearch,
  Map,
  Warehouse,
  Store,
  Receipt,
  Landmark,
  Truck,
  BookOpen,
  BarChart3,
  Megaphone,
  Users,
  Contact,
  Headset,
  Settings,
  LogOut,
  FileText,
  Network,
  Building2,
  DollarSign,
  Facebook,
  MessageCircle,
  Image,
  ShieldCheck,
  ClipboardList,
  Scale,
} from "lucide-react";

export type MenuLabelMap = Record<string, string>;

export type MenuNode = {
  key: string;
  labelKey: string;
  path?: string;
  icon?: any;
  children?: MenuNode[];
};

export const adminMenuLabels: { en: MenuLabelMap; my: MenuLabelMap } = {
  en: {
    "menu.dashboard": "Dashboard",
    "menu.createDelivery": "Create Delivery",

    "menu.wayManagement": "Way management",
    "menu.wayManagement.pickupWays": "Pickup ways",
    "menu.wayManagement.deliverWays": "Deliver ways",
    "menu.wayManagement.failedWays": "Failed ways",
    "menu.wayManagement.returnWays": "Return ways",
    "menu.wayManagement.parcelInOut": "Parcel In/Out",
    "menu.wayManagement.transitRoute": "Transit route",
    "menu.wayManagement.trackingMap": "Tracking map",

    "menu.merchants": "Merchants",
    "menu.merchants.addNew": "Add new merchant",
    "menu.merchants.list": "Merchant list",
    "menu.merchants.receipts": "Receipts",
    "menu.merchants.financialCenter": "Financial center",
    "menu.merchants.bankAccountList": "Bank account list",
    "menu.merchants.invoiceScheduling": "Invoice scheduling",

    "menu.deliverymen": "Deliverymen",
    "menu.deliverymen.addNew": "Add new deliveryman",
    "menu.deliverymen.list": "Deliveryman list",
    "menu.deliverymen.financialCenter": "Financial center",

    "menu.accounting": "Accounting",
    "menu.accounting.accounts": "Accounts",
    "menu.accounting.accounts.balance": "Account balance",
    "menu.accounting.accounts.nameTitleList": "Account name/title list",
    "menu.accounting.transactions": "Transactions",
    "menu.accounting.transactions.simple": "Simple transaction",
    "menu.accounting.transactions.journalVoucherEntry": "Journal voucher entry",
    "menu.accounting.transactions.cashVoucherEntry": "Cash voucher entry",
    "menu.accounting.transactions.journalVoucherList": "Journal voucher list",
    "menu.accounting.transactions.cashVoucherList": "Cash voucher list",
    "menu.accounting.transactions.generalLedgerList": "General ledger list",
    "menu.accounting.financialReports": "Financial reports",
    "menu.accounting.financialReports.cashBookSummary": "Cash book summary",
    "menu.accounting.financialReports.journalSummary": "Journal summary",
    "menu.accounting.financialReports.trialBalance": "Trial balance",
    "menu.accounting.financialReports.incomeStatement": "Income statement",
    "menu.accounting.financialReports.balanceSheet": "Balance sheet",
    "menu.accounting.financialReports.profitAndLoss": "Profit And Loss",

    "menu.reporting": "Reporting",
    "menu.reporting.waysCountReport": "Ways count report",
    "menu.reporting.activeWaysByTown": "Active ways count by town",
    "menu.reporting.waysByDeliverymen": "Ways by deliverymen",
    "menu.reporting.waysByMerchants": "Ways by merchants",
    "menu.reporting.overdueWaysCount": "Overdue ways count",
    "menu.reporting.overdueWaysByDeliveryman": "Overdue ways by deliveryman",
    "menu.reporting.overdueWaysByMerchant": "Overdue ways by merchant",
    "menu.reporting.totalWaysByTown": "Total ways by town",
    "menu.reporting.merchantsOrderCompare": "Merchants order compare",

    "menu.broadcastMessage": "Broadcast message",
    "menu.broadcastMessage.createMessage": "Create message",
    "menu.broadcastMessage.messageList": "Message list",
    "menu.broadcastMessage.facebookPages": "Facebook pages",
    "menu.broadcastMessage.viberBots": "Viber bots",
    "menu.broadcastMessage.mediaFiles": "Media files",

    "menu.teams": "Teams",
    "menu.teams.branches": "Branches",
    "menu.teams.syncUsersToHRM": "Sync users to HRM",
    "menu.teams.zoneAutoAssign": "Zone and auto assign",
    "menu.teams.stationNetwork": "Station network",
    "menu.teams.stationCoverages": "Station coverages",
    "menu.teams.financialCenter": "Financial Center",
    "menu.teams.hrManagement": "HR Management",
    "menu.teams.pricingAndPackage": "Pricing and package",

    "menu.contacts": "Contacts",
    "menu.contacts.customerSupport": "Customer support",

    "menu.settings": "Settings",
    "menu.settings.auditLogs": "Audit logs",
    "menu.settings.termsConditions": "Terms & Conditions",
    "menu.settings.logout": "Logout",

    "menu.executiveGroup": "Core Executive",
    "menu.operationalGroup": "Operational",
    "menu.externalGroup": "Customer & B2B",
    "menu.portal.finance": "Finance",
    "menu.portal.hr": "HR",
    "menu.portal.operations": "Operations",
    "menu.portal.warehouse": "Warehouse",
    "menu.portal.branch": "Branch",
    "menu.portal.merchant": "Merchant",
    "menu.portal.support": "Support",
    "menu.userMatrix": "User Matrix",
    "menu.systemOnline": "System Online",
    "menu.commandCenter": "Command Center",
    "menu.userMatrices": "User Matrices",
    "menu.merchantAdmin": "Merchant Admin",
    "menu.platformSettings": "Platform Settings",
    "menu.logOut": "Log Out",
    "menu.systemAdmin": "System Admin"
  },
  my: {
    "menu.dashboard": "ဒတ်ရှ်ဘုတ်",
    "menu.createDelivery": "ပို့ဆောင်မှု ဖန်တီးရန်",

    "menu.wayManagement": "Way စီမံခန့်ခွဲမှု",
    "menu.wayManagement.pickupWays": "Pickup Way များ",
    "menu.wayManagement.deliverWays": "Delivery Way များ",
    "menu.wayManagement.failedWays": "မအောင်မြင်သော Way များ",
    "menu.wayManagement.returnWays": "ပြန်ပို့ရန် Way များ",
    "menu.wayManagement.parcelInOut": "ပစ္စည်း ဝင်/ထွက်",
    "menu.wayManagement.transitRoute": "ဖြတ်သန်း လမ်းကြောင်း",
    "menu.wayManagement.trackingMap": "လိုက်လံစစ်ဆေး မြေပုံ",

    "menu.merchants": "ကုန်သည်များ",
    "menu.merchants.addNew": "ကုန်သည်အသစ် ထည့်ရန်",
    "menu.merchants.list": "ကုန်သည်စာရင်း",
    "menu.merchants.receipts": "လက်ခံပြေစာများ",
    "menu.merchants.financialCenter": "ဘဏ္ဍာရေး စင်တာ",
    "menu.merchants.bankAccountList": "ဘဏ်အကောင့် စာရင်း",
    "menu.merchants.invoiceScheduling": "အင်ဗွိုက် အချိန်ဇယား",

    "menu.deliverymen": "ပို့ဆောင်သူများ",
    "menu.deliverymen.addNew": "ပို့ဆောင်သူအသစ် ထည့်ရန်",
    "menu.deliverymen.list": "ပို့ဆောင်သူစာရင်း",
    "menu.deliverymen.financialCenter": "ဘဏ္ဍာရေး စင်တာ",

    "menu.accounting": "စာရင်းကိုင်",
    "menu.accounting.accounts": "အကောင့်များ",
    "menu.accounting.accounts.balance": "အကောင့်လက်ကျန်",
    "menu.accounting.accounts.nameTitleList": "အကောင့်အမည်/ခေါင်းစဉ် စာရင်း",
    "menu.accounting.transactions": "ငွေလွှဲလုပ်ငန်းစဉ်များ",
    "menu.accounting.transactions.simple": "ရိုးရိုး ငွေလွှဲ",
    "menu.accounting.transactions.journalVoucherEntry": "ဂျာနယ်ဗောင်ချာ ထည့်သွင်း",
    "menu.accounting.transactions.cashVoucherEntry": "ငွေသားဗောင်ချာ ထည့်သွင်း",
    "menu.accounting.transactions.journalVoucherList": "ဂျာနယ်ဗောင်ချာ စာရင်း",
    "menu.accounting.transactions.cashVoucherList": "ငွေသားဗောင်ချာ စာရင်း",
    "menu.accounting.transactions.generalLedgerList": "General Ledger စာရင်း",
    "menu.accounting.financialReports": "ဘဏ္ဍာရေး အစီရင်ခံစာများ",
    "menu.accounting.financialReports.cashBookSummary": "ငွေစာအုပ် အနှစ်ချုပ်",
    "menu.accounting.financialReports.journalSummary": "ဂျာနယ် အနှစ်ချုပ်",
    "menu.accounting.financialReports.trialBalance": "စမ်းသပ်လက်ကျန်စာရင်း",
    "menu.accounting.financialReports.incomeStatement": "ဝင်ငွေ/ထွက်ငွေ စာရင်း",
    "menu.accounting.financialReports.balanceSheet": "လက်ကျန်စာရင်း",
    "menu.accounting.financialReports.profitAndLoss": "အမြတ်/အရှုံး",

    "menu.reporting": "အစီရင်ခံစာ",
    "menu.reporting.waysCountReport": "Way အရေအတွက် အစီရင်ခံစာ",
    "menu.reporting.activeWaysByTown": "မြို့နယ်အလိုက် Active Way အရေအတွက်",
    "menu.reporting.waysByDeliverymen": "ပို့ဆောင်သူအလိုက် Way များ",
    "menu.reporting.waysByMerchants": "ကုန်သည်အလိုက် Way များ",
    "menu.reporting.overdueWaysCount": "အချိန်ကျော် Way အရေအတွက်",
    "menu.reporting.overdueWaysByDeliveryman": "ပို့ဆောင်သူအလိုက် အချိန်ကျော် Way",
    "menu.reporting.overdueWaysByMerchant": "ကုန်သည်အလိုက် အချိန်ကျော် Way",
    "menu.reporting.totalWaysByTown": "မြို့နယ်အလိုက် Way စုစုပေါင်း",
    "menu.reporting.merchantsOrderCompare": "ကုန်သည် အော်ဒါ နှိုင်းယှဉ်",

    "menu.broadcastMessage": "အကြောင်းကြားစာ ပို့ခြင်း",
    "menu.broadcastMessage.createMessage": "မက်ဆေ့ချ် ဖန်တီး",
    "menu.broadcastMessage.messageList": "မက်ဆေ့ချ် စာရင်း",
    "menu.broadcastMessage.facebookPages": "Facebook စာမျက်နှာများ",
    "menu.broadcastMessage.viberBots": "Viber ဘော့တ်များ",
    "menu.broadcastMessage.mediaFiles": "မီဒီယာ ဖိုင်များ",

    "menu.teams": "အဖွဲ့များ",
    "menu.teams.branches": "ဘဏ်ခွဲများ",
    "menu.teams.syncUsersToHRM": "User များကို HRM နှင့် Sync လုပ်ရန်",
    "menu.teams.zoneAutoAssign": "ဇုန်နှင့် Auto Assign",
    "menu.teams.stationNetwork": "စတေးရှင်း ကွန်ယက်",
    "menu.teams.stationCoverages": "စတေးရှင်း Coverage များ",
    "menu.teams.financialCenter": "ဘဏ္ဍာရေး စင်တာ",
    "menu.teams.hrManagement": "HR စီမံခန့်ခွဲမှု",
    "menu.teams.pricingAndPackage": "စျေးနှုန်းနှင့် ပက်ကေ့ဂျ်",

    "menu.contacts": "ဆက်သွယ်ရန်များ",
    "menu.contacts.customerSupport": "ဖောက်သည် ထောက်ပံ့ရေး",

    "menu.settings": "ဆက်တင်များ",
    "menu.settings.auditLogs": "စစ်ဆေးမှတ်တမ်းများ",
    "menu.settings.termsConditions": "စည်းကမ်းနှင့် အခြေအနေများ",
    "menu.settings.logout": "ထွက်ရန်",

    "menu.executiveGroup": "အုပ်ချုပ်မှု အဓိက",
    "menu.operationalGroup": "လုပ်ငန်းလည်ပတ်ရေး",
    "menu.externalGroup": "ပြင်ပချိတ်ဆက်မှု",
    "menu.portal.finance": "ငွေကြေးဌာန",
    "menu.portal.hr": "လူ့စွမ်းအား",
    "menu.portal.operations": "လုပ်ငန်းများ",
    "menu.portal.warehouse": "ဂိုဒေါင်",
    "menu.portal.branch": "ရုံးခွဲ",
    "menu.portal.merchant": "ရောင်းချသူ",
    "menu.portal.support": "အကူအညီပေးရေး",
    "menu.userMatrix": "အသုံးပြုသူများ",
    "menu.systemOnline": "စနစ်အလုပ်လုပ်နေသည်",
    "menu.commandCenter": "ထိန်းချုပ်ရေးစင်တာ",
    "menu.userMatrices": "အသုံးပြုသူများ",
    "menu.merchantAdmin": "ကုန်သည် စီမံခန့်ခွဲမှု",
    "menu.platformSettings": "ပလက်ဖောင်း ဆက်တင်များ",
    "menu.logOut": "ထွက်မည်",
    "menu.systemAdmin": "စနစ် အက်ဒမင်"
  }
};

export function labelFor(language: "en" | "my", key: string): string {
  return adminMenuLabels[language]?.[key] || adminMenuLabels.en[key] || key;
}

export const adminSidebarMenu: MenuNode[] = [
  { key: "dashboard", labelKey: "menu.dashboard", path: "/portal/admin", icon: LayoutDashboard },
  { key: "createDelivery", labelKey: "menu.createDelivery", path: "/portal/admin/create-delivery", icon: PlusSquare },

  {
    key: "wayManagement",
    labelKey: "menu.wayManagement",
    icon: Route,
    children: [
      { key: "pickupWays", labelKey: "menu.wayManagement.pickupWays", path: "/portal/admin/way-management/pickup-ways" },
      { key: "deliverWays", labelKey: "menu.wayManagement.deliverWays", path: "/portal/admin/way-management/deliver-ways" },
      { key: "failedWays", labelKey: "menu.wayManagement.failedWays", path: "/portal/admin/way-management/failed-ways" },
      { key: "returnWays", labelKey: "menu.wayManagement.returnWays", path: "/portal/admin/way-management/return-ways" },
      { key: "parcelInOut", labelKey: "menu.wayManagement.parcelInOut", path: "/portal/admin/way-management/parcel-in-out" },
      { key: "transitRoute", labelKey: "menu.wayManagement.transitRoute", path: "/portal/admin/way-management/transit-route" },
      { key: "trackingMap", labelKey: "menu.wayManagement.trackingMap", path: "/portal/admin/way-management/tracking-map" }
    ]
  },

  {
    key: "merchants",
    labelKey: "menu.merchants",
    icon: Store,
    children: [
      { key: "merchantsAdd", labelKey: "menu.merchants.addNew", path: "/portal/admin/merchants/add-new" },
      { key: "merchantsList", labelKey: "menu.merchants.list", path: "/portal/admin/merchants/list" },
      { key: "merchantsReceipts", labelKey: "menu.merchants.receipts", path: "/portal/admin/merchants/receipts" },
      { key: "merchantsFinancialCenter", labelKey: "menu.merchants.financialCenter", path: "/portal/admin/merchants/financial-center" },
      { key: "merchantsBankAccounts", labelKey: "menu.merchants.bankAccountList", path: "/portal/admin/merchants/bank-account-list" },
      { key: "merchantsInvoiceScheduling", labelKey: "menu.merchants.invoiceScheduling", path: "/portal/admin/merchants/invoice-scheduling" }
    ]
  },

  {
    key: "deliverymen",
    labelKey: "menu.deliverymen",
    icon: Truck,
    children: [
      { key: "deliverymenAdd", labelKey: "menu.deliverymen.addNew", path: "/portal/admin/deliverymen/add-new" },
      { key: "deliverymenList", labelKey: "menu.deliverymen.list", path: "/portal/admin/deliverymen/list" },
      { key: "deliverymenFinancialCenter", labelKey: "menu.deliverymen.financialCenter", path: "/portal/admin/deliverymen/financial-center" }
    ]
  },

  {
    key: "accounting",
    labelKey: "menu.accounting",
    icon: BookOpen,
    children: [
      { key: "accounts", labelKey: "menu.accounting.accounts", path: "/portal/admin/accounting/accounts" },
      { key: "accountBalance", labelKey: "menu.accounting.accounts.balance", path: "/portal/admin/accounting/accounts/balance" },
      { key: "accountNameTitleList", labelKey: "menu.accounting.accounts.nameTitleList", path: "/portal/admin/accounting/accounts/name-title-list" },
      { key: "simpleTransaction", labelKey: "menu.accounting.transactions.simple", path: "/portal/admin/accounting/transactions/simple" },
      { key: "journalVoucherEntry", labelKey: "menu.accounting.transactions.journalVoucherEntry", path: "/portal/admin/accounting/transactions/journal-voucher-entry" },
      { key: "cashVoucherEntry", labelKey: "menu.accounting.transactions.cashVoucherEntry", path: "/portal/admin/accounting/transactions/cash-voucher-entry" },
      { key: "journalVoucherList", labelKey: "menu.accounting.transactions.journalVoucherList", path: "/portal/admin/accounting/transactions/journal-voucher-list" },
      { key: "cashVoucherList", labelKey: "menu.accounting.transactions.cashVoucherList", path: "/portal/admin/accounting/transactions/cash-voucher-list" },
      { key: "generalLedgerList", labelKey: "menu.accounting.transactions.generalLedgerList", path: "/portal/admin/accounting/transactions/general-ledger-list" },
      { key: "cashBookSummary", labelKey: "menu.accounting.financialReports.cashBookSummary", path: "/portal/admin/accounting/financial-reports/cash-book-summary" },
      { key: "journalSummary", labelKey: "menu.accounting.financialReports.journalSummary", path: "/portal/admin/accounting/financial-reports/journal-summary" },
      { key: "trialBalance", labelKey: "menu.accounting.financialReports.trialBalance", path: "/portal/admin/accounting/financial-reports/trial-balance" },
      { key: "incomeStatement", labelKey: "menu.accounting.financialReports.incomeStatement", path: "/portal/admin/accounting/financial-reports/income-statement" },
      { key: "balanceSheet", labelKey: "menu.accounting.financialReports.balanceSheet", path: "/portal/admin/accounting/financial-reports/balance-sheet" },
      { key: "profitAndLoss", labelKey: "menu.accounting.financialReports.profitAndLoss", path: "/portal/admin/accounting/financial-reports/profit-and-loss" }
    ]
  },

  {
    key: "reporting",
    labelKey: "menu.reporting",
    icon: BarChart3,
    children: [
      { key: "waysCountReport", labelKey: "menu.reporting.waysCountReport", path: "/portal/admin/reporting/ways-count-report" },
      { key: "activeWaysByTown", labelKey: "menu.reporting.activeWaysByTown", path: "/portal/admin/reporting/active-ways-by-town" },
      { key: "waysByDeliverymen", labelKey: "menu.reporting.waysByDeliverymen", path: "/portal/admin/reporting/ways-by-deliverymen" },
      { key: "waysByMerchants", labelKey: "menu.reporting.waysByMerchants", path: "/portal/admin/reporting/ways-by-merchants" },
      { key: "overdueWaysCount", labelKey: "menu.reporting.overdueWaysCount", path: "/portal/admin/reporting/overdue-ways-count" },
      { key: "overdueWaysByDeliveryman", labelKey: "menu.reporting.overdueWaysByDeliveryman", path: "/portal/admin/reporting/overdue-ways-by-deliveryman" },
      { key: "overdueWaysByMerchant", labelKey: "menu.reporting.overdueWaysByMerchant", path: "/portal/admin/reporting/overdue-ways-by-merchant" },
      { key: "totalWaysByTown", labelKey: "menu.reporting.totalWaysByTown", path: "/portal/admin/reporting/total-ways-by-town" },
      { key: "merchantsOrderCompare", labelKey: "menu.reporting.merchantsOrderCompare", path: "/portal/admin/reporting/merchants-order-compare" }
    ]
  },

  {
    key: "broadcastMessage",
    labelKey: "menu.broadcastMessage",
    icon: Megaphone,
    children: [
      { key: "createMessage", labelKey: "menu.broadcastMessage.createMessage", path: "/portal/admin/broadcast-message/create-message" },
      { key: "messageList", labelKey: "menu.broadcastMessage.messageList", path: "/portal/admin/broadcast-message/message-list" },
      { key: "facebookPages", labelKey: "menu.broadcastMessage.facebookPages", path: "/portal/admin/broadcast-message/facebook-pages" },
      { key: "viberBots", labelKey: "menu.broadcastMessage.viberBots", path: "/portal/admin/broadcast-message/viber-bots" },
      { key: "mediaFiles", labelKey: "menu.broadcastMessage.mediaFiles", path: "/portal/admin/broadcast-message/media-files" }
    ]
  },

  {
    key: "teams",
    labelKey: "menu.teams",
    icon: Users,
    children: [
      { key: "branches", labelKey: "menu.teams.branches", path: "/portal/admin/teams/branches" },
      { key: "syncUsersToHRM", labelKey: "menu.teams.syncUsersToHRM", path: "/portal/admin/teams/sync-users-to-hrm" },
      { key: "zoneAutoAssign", labelKey: "menu.teams.zoneAutoAssign", path: "/portal/admin/teams/zone-auto-assign" },
      { key: "stationNetwork", labelKey: "menu.teams.stationNetwork", path: "/portal/admin/teams/station-network" },
      { key: "stationCoverages", labelKey: "menu.teams.stationCoverages", path: "/portal/admin/teams/station-coverages" },
      { key: "teamsFinancialCenter", labelKey: "menu.teams.financialCenter", path: "/portal/admin/teams/financial-center" },
      { key: "hrManagement", labelKey: "menu.teams.hrManagement", path: "/portal/admin/teams/hr-management" },
      { key: "pricingAndPackage", labelKey: "menu.teams.pricingAndPackage", path: "/portal/admin/teams/pricing-and-package" }
    ]
  },

  {
    key: "contacts",
    labelKey: "menu.contacts",
    icon: Contact,
    children: [
      { key: "customerSupport", labelKey: "menu.contacts.customerSupport", path: "/portal/admin/contacts/customer-support" }
    ]
  },

  {
    key: "settings",
    labelKey: "menu.settings",
    icon: Settings,
    children: [
      { key: "auditLogs", labelKey: "menu.settings.auditLogs", path: "/portal/admin/settings/audit-logs" },
      { key: "termsConditions", labelKey: "menu.settings.termsConditions", path: "/portal/admin/settings/terms-conditions" }
    ]
  }
];

export const portalGroups = [
  {
    key: "executive",
    labelKey: "menu.executiveGroup",
    links: [
      { key: "finance", labelKey: "menu.portal.finance", path: "/portal/finance", icon: Landmark },
      { key: "hr", labelKey: "menu.portal.hr", path: "/portal/hr", icon: Users }
    ]
  },
  {
    key: "operational",
    labelKey: "menu.operationalGroup",
    links: [
      { key: "operations", labelKey: "menu.portal.operations", path: "/portal/operations", icon: Network },
      { key: "warehouse", labelKey: "menu.portal.warehouse", path: "/portal/warehouse", icon: Warehouse },
      { key: "branch", labelKey: "menu.portal.branch", path: "/portal/branch", icon: Building2 }
    ]
  },
  {
    key: "external",
    labelKey: "menu.externalGroup",
    links: [
      { key: "merchant", labelKey: "menu.portal.merchant", path: "/portal/merchant", icon: Store },
      { key: "support", labelKey: "menu.portal.support", path: "/portal/support", icon: Headset }
    ]
  }
];

export const adminUtilityQuickLinks = [
  { key: "users", labelKey: "menu.userMatrix", path: "/portal/admin/users", icon: ShieldCheck },
  { key: "merchantsLegacy", labelKey: "menu.merchants", path: "/portal/admin/merchants", icon: Store },
  { key: "settingsLegacy", labelKey: "menu.settings", path: "/portal/admin/settings", icon: Settings }
];

export const placeholderIcons: Record<string, any> = {
  delivery: PackageSearch,
  reporting: ClipboardList,
  accounting: DollarSign,
  pricing: Scale,
  facebook: Facebook,
  viber: MessageCircle,
  media: Image,
  file: FileText,
  settings: Settings,
  logOut: LogOut
};
