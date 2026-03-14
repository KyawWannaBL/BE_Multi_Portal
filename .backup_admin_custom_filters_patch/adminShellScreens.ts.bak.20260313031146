const reportDefault = {
  pageSize: 20,
  pagination: true,
  sortable: true,
  exportable: true,
  printable: true,
  showTotals: true,
  datePresets: ["today", "yesterday", "thisWeek", "thisMonth", "last30Days"],
};

function withReport(config) {
  return {
    ...reportDefault,
    ...config,
  };
}

export const adminShellScreens = {
  "/portal/admin/create-delivery": {
    titleEn: "Create Delivery",
    titleMy: "ပို့ဆောင်မှု ဖန်တီးရန်",
    descriptionEn: "Create and register new delivery records.",
    descriptionMy: "ပို့ဆောင်မှုအသစ်များ ဖန်တီးပြီး မှတ်ပုံတင်ရန်။",
    endpoint: "/api/admin/create-delivery",
    filters: ["dateFrom", "dateTo", "merchant", "township", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/way-management/pickup-ways": withReport({
    titleEn: "Pickup Ways",
    titleMy: "Pickup Way များ",
    descriptionEn: "Monitor pickup way creation and assignment.",
    descriptionMy: "Pickup way များ ဖန်တီးခြင်းနှင့် တာဝန်ချထားခြင်းကို စောင့်ကြည့်ရန်။",
    endpoint: "/api/admin/way-management/pickup-ways",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "rider", "merchant", "status"],
    summaryCards: [
      { key: "totalWays", titleEn: "Total Ways", titleMy: "Way စုစုပေါင်း" },
      { key: "assignedWays", titleEn: "Assigned", titleMy: "တာဝန်ချထားပြီး" },
      { key: "pendingWays", titleEn: "Pending", titleMy: "စောင့်ဆိုင်းနေ" }
    ],
    totals: ["parcelCount"],
    columns: [
      { key: "wayNo", labelEn: "Way No", labelMy: "Way နံပါတ်" },
      { key: "pickupDate", labelEn: "Pickup Date", labelMy: "Pickup ရက်စွဲ" },
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "assignedTo", labelEn: "Assigned To", labelMy: "တာဝန်ချထားသူ" },
      { key: "parcelCount", labelEn: "Parcels", labelMy: "ပစ္စည်းအရေအတွက်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/deliver-ways": withReport({
    titleEn: "Deliver Ways",
    titleMy: "Delivery Way များ",
    descriptionEn: "Track ways currently in delivery execution.",
    descriptionMy: "လက်ရှိပို့ဆောင်နေသော way များကို လိုက်လံစစ်ဆေးရန်။",
    endpoint: "/api/admin/way-management/deliver-ways",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "deliveryman", "township", "status"],
    summaryCards: [
      { key: "totalWays", titleEn: "Total Ways", titleMy: "Way စုစုပေါင်း" },
      { key: "outForDelivery", titleEn: "Out For Delivery", titleMy: "ပို့ဆောင်နေဆဲ" },
      { key: "completedWays", titleEn: "Completed", titleMy: "ပြီးစီးပြီး" }
    ],
    totals: ["parcelCount"],
    columns: [
      { key: "wayNo", labelEn: "Way No", labelMy: "Way နံပါတ်" },
      { key: "deliveryman", labelEn: "Deliveryman", labelMy: "ပို့ဆောင်သူ" },
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "parcelCount", labelEn: "Parcels", labelMy: "ပစ္စည်းအရေအတွက်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/failed-ways": withReport({
    titleEn: "Failed Ways",
    titleMy: "မအောင်မြင်သော Way များ",
    descriptionEn: "Review failed deliveries and operational issues.",
    descriptionMy: "မအောင်မြင်သော ပို့ဆောင်မှုများနှင့် လုပ်ငန်းဆိုင်ရာပြဿနာများကို ပြန်လည်စစ်ဆေးရန်။",
    endpoint: "/api/admin/way-management/failed-ways",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "reason", "deliveryman", "merchant"],
    summaryCards: [
      { key: "failedWays", titleEn: "Failed Ways", titleMy: "မအောင်မြင်သော Way" },
      { key: "retryPending", titleEn: "Retry Pending", titleMy: "ပြန်လည်လုပ်ဆောင်ရန်" },
      { key: "returnedWays", titleEn: "Returned", titleMy: "ပြန်ပို့ပြီး" }
    ],
    columns: [
      { key: "wayNo", labelEn: "Way No", labelMy: "Way နံပါတ်" },
      { key: "failedDate", labelEn: "Failed Date", labelMy: "မအောင်မြင်သည့် ရက်စွဲ" },
      { key: "reason", labelEn: "Reason", labelMy: "အကြောင်းရင်း" },
      { key: "deliveryman", labelEn: "Deliveryman", labelMy: "ပို့ဆောင်သူ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/return-ways": withReport({
    titleEn: "Return Ways",
    titleMy: "ပြန်ပို့ရန် Way များ",
    descriptionEn: "Manage returned parcel routes and handoff status.",
    descriptionMy: "ပြန်ပို့ရမည့် ပစ္စည်းလမ်းကြောင်းများနှင့် လွှဲပြောင်းအခြေအနေကို စီမံရန်။",
    endpoint: "/api/admin/way-management/return-ways",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant", "township", "status"],
    summaryCards: [
      { key: "returnWays", titleEn: "Return Ways", titleMy: "ပြန်ပို့ရန် Way" },
      { key: "processedReturns", titleEn: "Processed", titleMy: "ပြီးစီးပြီး" },
      { key: "pendingReturns", titleEn: "Pending", titleMy: "စောင့်ဆိုင်းနေ" }
    ],
    totals: ["parcelCount"],
    columns: [
      { key: "wayNo", labelEn: "Way No", labelMy: "Way နံပါတ်" },
      { key: "returnDate", labelEn: "Return Date", labelMy: "ပြန်ပို့ရက်" },
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "parcelCount", labelEn: "Parcels", labelMy: "ပစ္စည်းအရေအတွက်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/parcel-in-out": withReport({
    titleEn: "Parcel In/Out",
    titleMy: "ပစ္စည်း ဝင်/ထွက်",
    descriptionEn: "Review parcel inbound and outbound movement logs.",
    descriptionMy: "ပစ္စည်း ဝင်/ထွက် လှုပ်ရှားမှုမှတ်တမ်းများကို စစ်ဆေးရန်။",
    endpoint: "/api/admin/way-management/parcel-in-out",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "station", "movementType", "status"],
    summaryCards: [
      { key: "inCount", titleEn: "Inbound", titleMy: "ဝင်လာသော" },
      { key: "outCount", titleEn: "Outbound", titleMy: "ထွက်သွားသော" },
      { key: "stationCount", titleEn: "Stations", titleMy: "စတေးရှင်းများ" }
    ],
    columns: [
      { key: "parcelNo", labelEn: "Parcel No", labelMy: "ပစ္စည်းနံပါတ်" },
      { key: "movementType", labelEn: "Movement", labelMy: "လှုပ်ရှားမှု" },
      { key: "station", labelEn: "Station", labelMy: "စတေးရှင်း" },
      { key: "time", labelEn: "Time", labelMy: "အချိန်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/transit-route": withReport({
    titleEn: "Transit Route",
    titleMy: "ဖြတ်သန်း လမ်းကြောင်း",
    descriptionEn: "Monitor transit route planning and handoff points.",
    descriptionMy: "ဖြတ်သန်းလမ်းကြောင်း စီစဉ်မှုနှင့် လွှဲပြောင်းနေရာများကို စောင့်ကြည့်ရန်။",
    endpoint: "/api/admin/way-management/transit-route",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "route", "station", "status"],
    summaryCards: [
      { key: "activeRoutes", titleEn: "Active Routes", titleMy: "အသက်ဝင်နေသော လမ်းကြောင်းများ" },
      { key: "connectedStations", titleEn: "Stations", titleMy: "စတေးရှင်းများ" },
      { key: "vehiclesUsed", titleEn: "Vehicles", titleMy: "ယာဉ်များ" }
    ],
    columns: [
      { key: "routeCode", labelEn: "Route Code", labelMy: "လမ်းကြောင်းကုဒ်" },
      { key: "origin", labelEn: "Origin", labelMy: "မူလနေရာ" },
      { key: "destination", labelEn: "Destination", labelMy: "ပန်းတိုင်" },
      { key: "vehicle", labelEn: "Vehicle", labelMy: "ယာဉ်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/way-management/tracking-map": withReport({
    titleEn: "Tracking Map",
    titleMy: "လိုက်လံစစ်ဆေး မြေပုံ",
    descriptionEn: "Track routes, parcels, and rider positions on the map.",
    descriptionMy: "မြေပုံပေါ်တွင် လမ်းကြောင်း၊ ပစ္စည်းနှင့် rider တည်နေရာများကို စစ်ဆေးရန်။",
    endpoint: "/api/admin/way-management/tracking-map",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "rider", "township", "status"],
    summaryCards: [
      { key: "trackedUnits", titleEn: "Tracked Units", titleMy: "စောင့်ကြည့်ထားသော ယူနစ်များ" },
      { key: "onlineUnits", titleEn: "Online Units", titleMy: "အွန်လိုင်း ယူနစ်များ" },
      { key: "alerts", titleEn: "Alerts", titleMy: "သတိပေးချက်များ" }
    ],
    columns: [
      { key: "unitName", labelEn: "Unit", labelMy: "ယူနစ်" },
      { key: "currentTownship", labelEn: "Current Township", labelMy: "လက်ရှိ မြို့နယ်" },
      { key: "lastSeen", labelEn: "Last Seen", labelMy: "နောက်ဆုံးတွေ့ရှိချိန်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/merchants/add-new": {
    titleEn: "Add New Merchant",
    titleMy: "ကုန်သည်အသစ် ထည့်ရန်",
    descriptionEn: "Merchant onboarding and account setup shell.",
    descriptionMy: "ကုန်သည် onboarding နှင့် အကောင့်စတင်သတ်မှတ်ခြင်း shell။",
    endpoint: "/api/admin/merchants/add-new",
    filters: ["dateFrom", "dateTo", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/merchants/list": withReport({
    titleEn: "Merchant List",
    titleMy: "ကုန်သည်စာရင်း",
    descriptionEn: "View and manage merchant master records.",
    descriptionMy: "ကုန်သည် master records များကို ကြည့်ရှုပြင်ဆင်ရန်။",
    endpoint: "/api/admin/merchants/list",
    filters: ["datePreset", "dateFrom", "dateTo", "status"],
    summaryCards: [
      { key: "merchantCount", titleEn: "Merchants", titleMy: "ကုန်သည်များ" },
      { key: "activeMerchants", titleEn: "Active", titleMy: "အသက်ဝင်နေ" },
      { key: "inactiveMerchants", titleEn: "Inactive", titleMy: "မအသက်ဝင်" }
    ],
    columns: [
      { key: "merchant_code", labelEn: "Merchant Code", labelMy: "ကုန်သည်ကုဒ်" },
      { key: "merchant_name", labelEn: "Merchant Name", labelMy: "ကုန်သည်အမည်" },
      { key: "contact_person", labelEn: "Contact Person", labelMy: "ဆက်သွယ်ရန်သူ" },
      { key: "email", labelEn: "Email", labelMy: "အီးမေးလ်" },
      { key: "phone", labelEn: "Phone", labelMy: "ဖုန်း" },
      { key: "business_type", labelEn: "Business Type", labelMy: "လုပ်ငန်းအမျိုးအစား" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" },
      { key: "registration_date", labelEn: "Registration Date", labelMy: "မှတ်ပုံတင်ရက်" }
    ]
  }),

  "/portal/admin/merchants/receipts": withReport({
    titleEn: "Receipts",
    titleMy: "လက်ခံပြေစာများ",
    descriptionEn: "Receipt overview for merchant collections and payments.",
    descriptionMy: "ကုန်သည်ဆိုင်ရာ လက်ခံငွေ၊ ပေးချေငွေများအတွက် ပြေစာအနှစ်ချုပ်။",
    endpoint: "/api/admin/merchants/receipts",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant", "receiptType", "status"],
    summaryCards: [
      { key: "receiptCount", titleEn: "Receipts", titleMy: "ပြေစာများ" },
      { key: "totalAmount", titleEn: "Total Amount", titleMy: "စုစုပေါင်းပမာဏ" },
      { key: "confirmedCount", titleEn: "Confirmed", titleMy: "အတည်ပြုပြီး" }
    ],
    totals: ["amount"],
    columns: [
      { key: "receiptNo", labelEn: "Receipt No", labelMy: "ပြေစာနံပါတ်" },
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" },
      { key: "receiptDate", labelEn: "Receipt Date", labelMy: "ပြေစာရက်စွဲ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/merchants/financial-center": withReport({
    titleEn: "Merchant Financial Center",
    titleMy: "ကုန်သည် ဘဏ္ဍာရေး စင်တာ",
    descriptionEn: "Merchant-level finance control and summaries.",
    descriptionMy: "ကုန်သည်အလိုက် ဘဏ္ဍာရေး ထိန်းချုပ်မှုနှင့် အနှစ်ချုပ်များ။",
    endpoint: "/api/admin/merchants/financial-center",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant", "status"],
    summaryCards: [
      { key: "totalPayable", titleEn: "Payable", titleMy: "ပေးရန်" },
      { key: "totalReceivable", titleEn: "Receivable", titleMy: "ရရန်" },
      { key: "netBalance", titleEn: "Net Balance", titleMy: "လက်ကျန်စုစုပေါင်း" }
    ],
    totals: ["payable", "receivable", "balance"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "payable", labelEn: "Payable", labelMy: "ပေးရန်" },
      { key: "receivable", labelEn: "Receivable", labelMy: "ရရန်" },
      { key: "balance", labelEn: "Balance", labelMy: "လက်ကျန်" }
    ]
  }),

  "/portal/admin/merchants/bank-account-list": withReport({
    titleEn: "Bank Account List",
    titleMy: "ဘဏ်အကောင့် စာရင်း",
    descriptionEn: "Merchant bank account registry.",
    descriptionMy: "ကုန်သည် ဘဏ်အကောင့် မှတ်ပုံတင်စာရင်း။",
    endpoint: "/api/admin/merchants/bank-account-list",
    filters: ["merchant", "bank", "status"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "bankName", labelEn: "Bank", labelMy: "ဘဏ်" },
      { key: "accountName", labelEn: "Account Name", labelMy: "အကောင့်အမည်" },
      { key: "accountNo", labelEn: "Account No", labelMy: "အကောင့်နံပါတ်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/merchants/invoice-scheduling": withReport({
    titleEn: "Invoice Scheduling",
    titleMy: "အင်ဗွိုက် အချိန်ဇယား",
    descriptionEn: "Invoice schedule management for billing cycles.",
    descriptionMy: "ဘီလ်စက်ကွင်းအတွက် အင်ဗွိုက် အချိန်ဇယား စီမံခန့်ခွဲမှု။",
    endpoint: "/api/admin/merchants/invoice-scheduling",
    filters: ["merchant", "frequency", "status"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "frequency", labelEn: "Frequency", labelMy: "အကြိမ်နှုန်း" },
      { key: "nextInvoiceDate", labelEn: "Next Invoice Date", labelMy: "နောက်အင်ဗွိုက်ရက်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/deliverymen/add-new": {
    titleEn: "Add New Deliveryman",
    titleMy: "ပို့ဆောင်သူအသစ် ထည့်ရန်",
    descriptionEn: "Deliveryman onboarding shell.",
    descriptionMy: "ပို့ဆောင်သူ onboarding shell။",
    endpoint: "/api/admin/deliverymen/add-new",
    filters: ["dateFrom", "dateTo", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/deliverymen/list": withReport({
    titleEn: "Deliveryman List",
    titleMy: "ပို့ဆောင်သူစာရင်း",
    descriptionEn: "View and manage deliveryman records.",
    descriptionMy: "ပို့ဆောင်သူ records များကို ကြည့်ရှုစီမံရန်။",
    endpoint: "/api/admin/deliverymen/list",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "deliveryman", "status"],
    summaryCards: [
      { key: "deliverymanCount", titleEn: "Deliverymen", titleMy: "ပို့ဆောင်သူများ" },
      { key: "activeCount", titleEn: "Active", titleMy: "အသက်ဝင်နေ" },
      { key: "inactiveCount", titleEn: "Inactive", titleMy: "မအသက်ဝင်" }
    ],
    columns: [
      { key: "staffCode", labelEn: "Staff Code", labelMy: "ဝန်ထမ်းကုဒ်" },
      { key: "name", labelEn: "Name", labelMy: "အမည်" },
      { key: "branch", labelEn: "Branch", labelMy: "ရုံးခွဲ" },
      { key: "phone", labelEn: "Phone", labelMy: "ဖုန်း" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/deliverymen/financial-center": withReport({
    titleEn: "Deliveryman Financial Center",
    titleMy: "ပို့ဆောင်သူ ဘဏ္ဍာရေး စင်တာ",
    descriptionEn: "Payment and settlement overview for deliverymen.",
    descriptionMy: "ပို့ဆောင်သူများအတွက် ငွေပေးချေမှုနှင့် ဖြေရှင်းမှု အနှစ်ချုပ်။",
    endpoint: "/api/admin/deliverymen/financial-center",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "deliveryman", "status"],
    summaryCards: [
      { key: "deliverymanTotal", titleEn: "Deliverymen", titleMy: "ပို့ဆောင်သူများ" },
      { key: "deliveryCount", titleEn: "Deliveries", titleMy: "ပို့ဆောင်မှုများ" },
      { key: "payoutAmount", titleEn: "Payout", titleMy: "ပေးချေရန်" }
    ],
    totals: ["deliveries", "amount"],
    columns: [
      { key: "name", labelEn: "Name", labelMy: "အမည်" },
      { key: "deliveries", labelEn: "Deliveries", labelMy: "ပို့ဆောင်မှုများ" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/accounts": withReport({
    titleEn: "Accounts",
    titleMy: "အကောင့်များ",
    descriptionEn: "Chart of account and account maintenance.",
    descriptionMy: "Chart of account နှင့် အကောင့်ထိန်းသိမ်းမှု။",
    endpoint: "/api/admin/accounting/accounts",
    filters: ["accountType", "status"],
    columns: [
      { key: "accountCode", labelEn: "Account Code", labelMy: "အကောင့်ကုဒ်" },
      { key: "accountName", labelEn: "Account Name", labelMy: "အကောင့်အမည်" },
      { key: "accountType", labelEn: "Account Type", labelMy: "အကောင့်အမျိုးအစား" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/accounts/balance": withReport({
    titleEn: "Account Balance",
    titleMy: "အကောင့်လက်ကျန်",
    descriptionEn: "Account balance review screen.",
    descriptionMy: "အကောင့်လက်ကျန် စစ်ဆေးမှု မျက်နှာပြင်။",
    endpoint: "/api/admin/accounting/accounts/balance",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "account"],
    summaryCards: [
      { key: "openingBalance", titleEn: "Opening", titleMy: "အစလက်ကျန်" },
      { key: "debitTotal", titleEn: "Debit", titleMy: "ဒက်ဘစ်" },
      { key: "creditTotal", titleEn: "Credit", titleMy: "ခရက်ဒစ်" },
      { key: "closingBalance", titleEn: "Closing", titleMy: "အဆုံးလက်ကျန်" }
    ],
    totals: ["debit", "credit", "balance"],
    columns: [
      { key: "accountCode", labelEn: "Account Code", labelMy: "အကောင့်ကုဒ်" },
      { key: "accountName", labelEn: "Account Name", labelMy: "အကောင့်အမည်" },
      { key: "debit", labelEn: "Debit", labelMy: "ဒက်ဘစ်" },
      { key: "credit", labelEn: "Credit", labelMy: "ခရက်ဒစ်" },
      { key: "balance", labelEn: "Balance", labelMy: "လက်ကျန်" }
    ]
  }),

  "/portal/admin/accounting/accounts/name-title-list": withReport({
    titleEn: "Account Name / Title List",
    titleMy: "အကောင့်အမည်/ခေါင်းစဉ် စာရင်း",
    descriptionEn: "Maintain account titles and grouping.",
    descriptionMy: "အကောင့်ခေါင်းစဉ်များနှင့် အုပ်စုသတ်မှတ်မှုကို ထိန်းသိမ်းရန်။",
    endpoint: "/api/admin/accounting/accounts/name-title-list",
    filters: ["group", "status"],
    columns: [
      { key: "titleCode", labelEn: "Title Code", labelMy: "ခေါင်းစဉ်ကုဒ်" },
      { key: "titleName", labelEn: "Title Name", labelMy: "ခေါင်းစဉ်အမည်" },
      { key: "group", labelEn: "Group", labelMy: "အုပ်စု" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/transactions/simple": withReport({
    titleEn: "Simple Transaction",
    titleMy: "ရိုးရိုး ငွေလွှဲ",
    descriptionEn: "Simple accounting transaction entry and review.",
    descriptionMy: "ရိုးရိုး စာရင်းကိုင်ငွေလွှဲ ထည့်သွင်းခြင်းနှင့် စစ်ဆေးခြင်း။",
    endpoint: "/api/admin/accounting/transactions/simple",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "account", "status"],
    totals: ["amount"],
    columns: [
      { key: "transactionNo", labelEn: "Transaction No", labelMy: "ငွေလွှဲနံပါတ်" },
      { key: "transactionDate", labelEn: "Date", labelMy: "ရက်စွဲ" },
      { key: "accountName", labelEn: "Account", labelMy: "အကောင့်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/transactions/journal-voucher-entry": {
    titleEn: "Journal Voucher Entry",
    titleMy: "ဂျာနယ်ဗောင်ချာ ထည့်သွင်း",
    descriptionEn: "Journal voucher data entry shell.",
    descriptionMy: "ဂျာနယ်ဗောင်ချာ ထည့်သွင်းမှု shell။",
    endpoint: "/api/admin/accounting/transactions/journal-voucher-entry",
    filters: ["dateFrom", "dateTo", "voucherNo", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/accounting/transactions/cash-voucher-entry": {
    titleEn: "Cash Voucher Entry",
    titleMy: "ငွေသားဗောင်ချာ ထည့်သွင်း",
    descriptionEn: "Cash voucher entry shell.",
    descriptionMy: "ငွေသားဗောင်ချာ ထည့်သွင်းမှု shell။",
    endpoint: "/api/admin/accounting/transactions/cash-voucher-entry",
    filters: ["dateFrom", "dateTo", "voucherNo", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/accounting/transactions/journal-voucher-list": withReport({
    titleEn: "Journal Voucher List",
    titleMy: "ဂျာနယ်ဗောင်ချာ စာရင်း",
    descriptionEn: "Review journal voucher records.",
    descriptionMy: "ဂျာနယ်ဗောင်ချာ မှတ်တမ်းများကို စစ်ဆေးရန်။",
    endpoint: "/api/admin/accounting/transactions/journal-voucher-list",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "voucherNo", "status"],
    totals: ["amount"],
    columns: [
      { key: "voucherNo", labelEn: "Voucher No", labelMy: "ဗောင်ချာနံပါတ်" },
      { key: "voucherDate", labelEn: "Voucher Date", labelMy: "ဗောင်ချာရက်" },
      { key: "description", labelEn: "Description", labelMy: "ဖော်ပြချက်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/transactions/cash-voucher-list": withReport({
    titleEn: "Cash Voucher List",
    titleMy: "ငွေသားဗောင်ချာ စာရင်း",
    descriptionEn: "Review cash voucher records.",
    descriptionMy: "ငွေသားဗောင်ချာ မှတ်တမ်းများကို စစ်ဆေးရန်။",
    endpoint: "/api/admin/accounting/transactions/cash-voucher-list",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "voucherNo", "status"],
    totals: ["amount"],
    columns: [
      { key: "voucherNo", labelEn: "Voucher No", labelMy: "ဗောင်ချာနံပါတ်" },
      { key: "voucherDate", labelEn: "Voucher Date", labelMy: "ဗောင်ချာရက်" },
      { key: "description", labelEn: "Description", labelMy: "ဖော်ပြချက်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/accounting/transactions/general-ledger-list": withReport({
    titleEn: "General Ledger List",
    titleMy: "General Ledger စာရင်း",
    descriptionEn: "Review ledger entries by account and date.",
    descriptionMy: "အကောင့်နှင့် ရက်စွဲအလိုက် ledger entries များကို စစ်ဆေးရန်။",
    endpoint: "/api/admin/accounting/transactions/general-ledger-list",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "account"],
    totals: ["debit", "credit"],
    columns: [
      { key: "entryDate", labelEn: "Entry Date", labelMy: "Entry ရက်" },
      { key: "accountName", labelEn: "Account", labelMy: "အကောင့်" },
      { key: "referenceNo", labelEn: "Reference No", labelMy: "ရည်ညွှန်းနံပါတ်" },
      { key: "debit", labelEn: "Debit", labelMy: "ဒက်ဘစ်" },
      { key: "credit", labelEn: "Credit", labelMy: "ခရက်ဒစ်" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/cash-book-summary": withReport({
    titleEn: "Cash Book Summary",
    titleMy: "ငွေစာအုပ် အနှစ်ချုပ်",
    descriptionEn: "Cash book report summary.",
    descriptionMy: "ငွေစာအုပ် အစီရင်ခံစာ အနှစ်ချုပ်။",
    endpoint: "/api/admin/accounting/financial-reports/cash-book-summary",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    summaryCards: [
      { key: "openingBalance", titleEn: "Opening", titleMy: "အစလက်ကျန်" },
      { key: "receipts", titleEn: "Receipts", titleMy: "လက်ခံငွေ" },
      { key: "payments", titleEn: "Payments", titleMy: "ပေးချေငွေ" },
      { key: "closingBalance", titleEn: "Closing", titleMy: "အဆုံးလက်ကျန်" }
    ],
    totals: ["opening", "receipts", "payments", "closing"],
    columns: [
      { key: "accountName", labelEn: "Account", labelMy: "အကောင့်" },
      { key: "opening", labelEn: "Opening", labelMy: "အစလက်ကျန်" },
      { key: "receipts", labelEn: "Receipts", labelMy: "လက်ခံငွေ" },
      { key: "payments", labelEn: "Payments", labelMy: "ပေးချေငွေ" },
      { key: "closing", labelEn: "Closing", labelMy: "အဆုံးလက်ကျန်" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/journal-summary": withReport({
    titleEn: "Journal Summary",
    titleMy: "ဂျာနယ် အနှစ်ချုပ်",
    descriptionEn: "Journal posting summary.",
    descriptionMy: "ဂျာနယ်တင်သွင်းမှု အနှစ်ချုပ်။",
    endpoint: "/api/admin/accounting/financial-reports/journal-summary",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    totals: ["entryCount", "debit", "credit"],
    columns: [
      { key: "journalCode", labelEn: "Journal", labelMy: "ဂျာနယ်" },
      { key: "entryCount", labelEn: "Entries", labelMy: "Entries အရေအတွက်" },
      { key: "debit", labelEn: "Debit", labelMy: "ဒက်ဘစ်" },
      { key: "credit", labelEn: "Credit", labelMy: "ခရက်ဒစ်" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/trial-balance": withReport({
    titleEn: "Trial Balance",
    titleMy: "စမ်းသပ်လက်ကျန်စာရင်း",
    descriptionEn: "Trial balance by account.",
    descriptionMy: "အကောင့်အလိုက် စမ်းသပ်လက်ကျန်စာရင်း။",
    endpoint: "/api/admin/accounting/financial-reports/trial-balance",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    totals: ["debit", "credit"],
    columns: [
      { key: "accountCode", labelEn: "Account Code", labelMy: "အကောင့်ကုဒ်" },
      { key: "accountName", labelEn: "Account Name", labelMy: "အကောင့်အမည်" },
      { key: "debit", labelEn: "Debit", labelMy: "ဒက်ဘစ်" },
      { key: "credit", labelEn: "Credit", labelMy: "ခရက်ဒစ်" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/income-statement": withReport({
    titleEn: "Income Statement",
    titleMy: "ဝင်ငွေ/ထွက်ငွေ စာရင်း",
    descriptionEn: "Income statement report view.",
    descriptionMy: "ဝင်ငွေ/ထွက်ငွေ အစီရင်ခံစာ view။",
    endpoint: "/api/admin/accounting/financial-reports/income-statement",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    summaryCards: [
      { key: "totalIncome", titleEn: "Total Income", titleMy: "စုစုပေါင်း ဝင်ငွေ" },
      { key: "totalExpense", titleEn: "Total Expense", titleMy: "စုစုပေါင်း ကုန်ကျစရိတ်" },
      { key: "netIncome", titleEn: "Net Income", titleMy: "အသားတင်ဝင်ငွေ" }
    ],
    totals: ["amount"],
    columns: [
      { key: "accountName", labelEn: "Account", labelMy: "အကောင့်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/balance-sheet": withReport({
    titleEn: "Balance Sheet",
    titleMy: "လက်ကျန်စာရင်း",
    descriptionEn: "Balance sheet report view.",
    descriptionMy: "လက်ကျန်စာရင်း အစီရင်ခံစာ view။",
    endpoint: "/api/admin/accounting/financial-reports/balance-sheet",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    summaryCards: [
      { key: "assets", titleEn: "Assets", titleMy: "ပိုင်ဆိုင်မှု" },
      { key: "liabilities", titleEn: "Liabilities", titleMy: "တာဝန်ယူရငွေ" },
      { key: "equity", titleEn: "Equity", titleMy: "မူပိုင်" }
    ],
    totals: ["amount"],
    columns: [
      { key: "accountName", labelEn: "Account", labelMy: "အကောင့်" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" }
    ]
  }),

  "/portal/admin/accounting/financial-reports/profit-and-loss": withReport({
    titleEn: "Profit And Loss",
    titleMy: "အမြတ်/အရှုံး",
    descriptionEn: "Profit and loss report view.",
    descriptionMy: "အမြတ်/အရှုံး အစီရင်ခံစာ view။",
    endpoint: "/api/admin/accounting/financial-reports/profit-and-loss",
    filters: ["datePreset", "dateFrom", "dateTo", "branch"],
    summaryCards: [
      { key: "revenue", titleEn: "Revenue", titleMy: "ဝင်ငွေ" },
      { key: "expense", titleEn: "Expense", titleMy: "ကုန်ကျစရိတ်" },
      { key: "profit", titleEn: "Profit", titleMy: "အမြတ်" }
    ],
    totals: ["amount"],
    columns: [
      { key: "category", labelEn: "Category", labelMy: "အမျိုးအစား" },
      { key: "amount", labelEn: "Amount", labelMy: "ပမာဏ" }
    ]
  }),

  "/portal/admin/reporting/ways-count-report": withReport({
    titleEn: "Ways Count Report",
    titleMy: "Way အရေအတွက် အစီရင်ခံစာ",
    descriptionEn: "Aggregate shipment/way counts grouped by merchant, township, status, type, and report date.",
    descriptionMy: "Merchant၊ township၊ status၊ type နှင့် report date အလိုက် shipment/way အရေအတွက် အစုစည်းအစီရင်ခံစာ။",
    endpoint: "/api/admin/reporting/ways-count-report",
    filters: ["datePreset", "dateFrom", "dateTo", "township"],
    summaryCards: [
      { key: "totalWays", titleEn: "Total Ways", titleMy: "Way စုစုပေါင်း" },
      { key: "totalCodAmount", titleEn: "Total COD", titleMy: "COD စုစုပေါင်း" },
      { key: "totalWeight", titleEn: "Total Weight", titleMy: "အလေးချိန်စုစုပေါင်း" },
      { key: "totalDeliveryFee", titleEn: "Total Delivery Fee", titleMy: "ပို့ခ စုစုပေါင်း" }
    ],
    totals: ["count", "total_cod_amount", "total_weight", "total_delivery_fee"],
    columns: [
      { key: "merchant_name", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "township", labelEn: "Township / Area", labelMy: "မြို့နယ် / နေရာဒေသ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" },
      { key: "type", labelEn: "Type", labelMy: "အမျိုးအစား" },
      { key: "count", labelEn: "Count", labelMy: "အရေအတွက်" },
      { key: "total_cod_amount", labelEn: "Total COD", labelMy: "COD စုစုပေါင်း" },
      { key: "total_weight", labelEn: "Total Weight", labelMy: "အလေးချိန်စုစုပေါင်း" },
      { key: "total_delivery_fee", labelEn: "Total Delivery Fee", labelMy: "ပို့ခ စုစုပေါင်း" },
      { key: "report_date", labelEn: "Report Date", labelMy: "အစီရင်ခံစာ ရက်စွဲ" }
    ]
  }),

  "/portal/admin/reporting/active-ways-by-town": withReport({
    titleEn: "Active Ways Count By Town",
    titleMy: "မြို့နယ်အလိုက် Active Way အရေအတွက်",
    descriptionEn: "Township-based active way counts.",
    descriptionMy: "မြို့နယ်အလိုက် active way အရေအတွက်။",
    endpoint: "/api/admin/reporting/active-ways-by-town",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "township"],
    totals: ["activeCount"],
    columns: [
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "activeCount", labelEn: "Active Count", labelMy: "Active အရေအတွက်" }
    ]
  }),

  "/portal/admin/reporting/ways-by-deliverymen": withReport({
    titleEn: "Ways By Deliverymen",
    titleMy: "ပို့ဆောင်သူအလိုက် Way များ",
    descriptionEn: "Deliveryman-based way reporting.",
    descriptionMy: "ပို့ဆောင်သူအလိုက် way အစီရင်ခံစာ။",
    endpoint: "/api/admin/reporting/ways-by-deliverymen",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "deliveryman"],
    totals: ["count", "completed"],
    columns: [
      { key: "deliveryman", labelEn: "Deliveryman", labelMy: "ပို့ဆောင်သူ" },
      { key: "count", labelEn: "Count", labelMy: "အရေအတွက်" },
      { key: "completed", labelEn: "Completed", labelMy: "ပြီးစီး" }
    ]
  }),

  "/portal/admin/reporting/ways-by-merchants": withReport({
    titleEn: "Ways By Merchants",
    titleMy: "ကုန်သည်အလိုက် Way များ",
    descriptionEn: "Merchant-based way reporting.",
    descriptionMy: "ကုန်သည်အလိုက် way အစီရင်ခံစာ။",
    endpoint: "/api/admin/reporting/ways-by-merchants",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant"],
    totals: ["count", "completed"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "count", labelEn: "Count", labelMy: "အရေအတွက်" },
      { key: "completed", labelEn: "Completed", labelMy: "ပြီးစီး" }
    ]
  }),

  "/portal/admin/reporting/overdue-ways-count": withReport({
    titleEn: "Overdue Ways Count",
    titleMy: "အချိန်ကျော် Way အရေအတွက်",
    descriptionEn: "Overdue way count summary.",
    descriptionMy: "အချိန်ကျော် way အရေအတွက် အနှစ်ချုပ်။",
    endpoint: "/api/admin/reporting/overdue-ways-count",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "township", "merchant"],
    totals: ["overdueCount"],
    columns: [
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "overdueCount", labelEn: "Overdue Count", labelMy: "အချိန်ကျော် အရေအတွက်" }
    ]
  }),

  "/portal/admin/reporting/overdue-ways-by-deliveryman": withReport({
    titleEn: "Overdue Ways By Deliveryman",
    titleMy: "ပို့ဆောင်သူအလိုက် အချိန်ကျော် Way",
    descriptionEn: "Overdue ways grouped by deliveryman.",
    descriptionMy: "ပို့ဆောင်သူအလိုက် အချိန်ကျော် way များ။",
    endpoint: "/api/admin/reporting/overdue-ways-by-deliveryman",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "deliveryman"],
    totals: ["overdueCount"],
    columns: [
      { key: "deliveryman", labelEn: "Deliveryman", labelMy: "ပို့ဆောင်သူ" },
      { key: "overdueCount", labelEn: "Overdue Count", labelMy: "အချိန်ကျော် အရေအတွက်" }
    ]
  }),

  "/portal/admin/reporting/overdue-ways-by-merchant": withReport({
    titleEn: "Overdue Ways By Merchant",
    titleMy: "ကုန်သည်အလိုက် အချိန်ကျော် Way",
    descriptionEn: "Overdue ways grouped by merchant.",
    descriptionMy: "ကုန်သည်အလိုက် အချိန်ကျော် way များ။",
    endpoint: "/api/admin/reporting/overdue-ways-by-merchant",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant"],
    totals: ["overdueCount"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "overdueCount", labelEn: "Overdue Count", labelMy: "အချိန်ကျော် အရေအတွက်" }
    ]
  }),

  "/portal/admin/reporting/total-ways-by-town": withReport({
    titleEn: "Total Ways By Town",
    titleMy: "မြို့နယ်အလိုက် Way စုစုပေါင်း",
    descriptionEn: "Total way count by township.",
    descriptionMy: "မြို့နယ်အလိုက် way စုစုပေါင်း။",
    endpoint: "/api/admin/reporting/total-ways-by-town",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "township"],
    totals: ["count"],
    columns: [
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "count", labelEn: "Count", labelMy: "အရေအတွက်" }
    ]
  }),

  "/portal/admin/reporting/merchants-order-compare": withReport({
    titleEn: "Merchants Order Compare",
    titleMy: "ကုန်သည် အော်ဒါ နှိုင်းယှဉ်",
    descriptionEn: "Merchant order comparison reporting screen.",
    descriptionMy: "ကုန်သည်အော်ဒါ နှိုင်းယှဉ် အစီရင်ခံစာ မျက်နှာပြင်။",
    endpoint: "/api/admin/reporting/merchants-order-compare",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "merchant"],
    totals: ["currentPeriod", "previousPeriod", "difference"],
    columns: [
      { key: "merchantName", labelEn: "Merchant", labelMy: "ကုန်သည်" },
      { key: "currentPeriod", labelEn: "Current Period", labelMy: "လက်ရှိကာလ" },
      { key: "previousPeriod", labelEn: "Previous Period", labelMy: "ယခင်ကာလ" },
      { key: "difference", labelEn: "Difference", labelMy: "ကွာခြားချက်" }
    ]
  }),

  "/portal/admin/broadcast-message/create-message": {
    titleEn: "Create Message",
    titleMy: "မက်ဆေ့ချ် ဖန်တီး",
    descriptionEn: "Broadcast message composition shell.",
    descriptionMy: "Broadcast message ရေးသားမှု shell။",
    endpoint: "/api/admin/broadcast-message/create-message",
    filters: ["channel", "status"],
    formShell: true,
    columns: []
  },

  "/portal/admin/broadcast-message/message-list": withReport({
    titleEn: "Message List",
    titleMy: "မက်ဆေ့ချ် စာရင်း",
    descriptionEn: "Broadcast message history.",
    descriptionMy: "Broadcast message မှတ်တမ်းစာရင်း။",
    endpoint: "/api/admin/broadcast-message/message-list",
    filters: ["datePreset", "dateFrom", "dateTo", "channel", "status"],
    columns: [
      { key: "messageTitle", labelEn: "Message Title", labelMy: "မက်ဆေ့ချ်ခေါင်းစဉ်" },
      { key: "channel", labelEn: "Channel", labelMy: "ချန်နယ်" },
      { key: "sentAt", labelEn: "Sent At", labelMy: "ပို့သည့်အချိန်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/broadcast-message/facebook-pages": withReport({
    titleEn: "Facebook Pages",
    titleMy: "Facebook စာမျက်နှာများ",
    descriptionEn: "Facebook page connection and campaign shell.",
    descriptionMy: "Facebook page ချိတ်ဆက်မှုနှင့် campaign shell။",
    endpoint: "/api/admin/broadcast-message/facebook-pages",
    filters: ["page", "status"],
    columns: [
      { key: "pageName", labelEn: "Page Name", labelMy: "စာမျက်နှာအမည်" },
      { key: "pageId", labelEn: "Page ID", labelMy: "စာမျက်နှာ ID" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/broadcast-message/viber-bots": withReport({
    titleEn: "Viber Bots",
    titleMy: "Viber ဘော့တ်များ",
    descriptionEn: "Viber bot integration shell.",
    descriptionMy: "Viber bot integration shell။",
    endpoint: "/api/admin/broadcast-message/viber-bots",
    filters: ["bot", "status"],
    columns: [
      { key: "botName", labelEn: "Bot Name", labelMy: "Bot အမည်" },
      { key: "channelId", labelEn: "Channel ID", labelMy: "Channel ID" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/broadcast-message/media-files": withReport({
    titleEn: "Media Files",
    titleMy: "မီဒီယာ ဖိုင်များ",
    descriptionEn: "Media library shell for message assets.",
    descriptionMy: "Message assets များအတွက် media library shell။",
    endpoint: "/api/admin/broadcast-message/media-files",
    filters: ["type", "datePreset", "dateFrom", "dateTo", "status"],
    columns: [
      { key: "fileName", labelEn: "File Name", labelMy: "ဖိုင်အမည်" },
      { key: "fileType", labelEn: "Type", labelMy: "အမျိုးအစား" },
      { key: "uploadedAt", labelEn: "Uploaded At", labelMy: "တင်ခဲ့သည့်အချိန်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/branches": withReport({
    titleEn: "Branches",
    titleMy: "ဘဏ်ခွဲများ",
    descriptionEn: "Branch master and operational setup.",
    descriptionMy: "ရုံးခွဲ master နှင့် operational setup။",
    endpoint: "/api/admin/teams/branches",
    filters: ["branch", "township", "status"],
    columns: [
      { key: "branchCode", labelEn: "Branch Code", labelMy: "ရုံးခွဲကုဒ်" },
      { key: "branchName", labelEn: "Branch Name", labelMy: "ရုံးခွဲအမည်" },
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/sync-users-to-hrm": withReport({
    titleEn: "Sync Users To HRM",
    titleMy: "User များကို HRM နှင့် Sync လုပ်ရန်",
    descriptionEn: "User synchronization shell with HRM.",
    descriptionMy: "HRM နှင့် user synchronization shell။",
    endpoint: "/api/admin/teams/sync-users-to-hrm",
    filters: ["datePreset", "dateFrom", "dateTo", "status"],
    columns: [
      { key: "userCode", labelEn: "User Code", labelMy: "User ကုဒ်" },
      { key: "name", labelEn: "Name", labelMy: "အမည်" },
      { key: "hrmStatus", labelEn: "HRM Status", labelMy: "HRM အခြေအနေ" },
      { key: "lastSyncAt", labelEn: "Last Sync At", labelMy: "နောက်ဆုံး Sync အချိန်" }
    ]
  }),

  "/portal/admin/teams/zone-auto-assign": withReport({
    titleEn: "Zone And Auto Assign",
    titleMy: "ဇုန်နှင့် Auto Assign",
    descriptionEn: "Configure zone mapping and auto-assignment logic.",
    descriptionMy: "ဇုန် mapping နှင့် auto assignment logic ကို ဆက်တင်ပြုလုပ်ရန်။",
    endpoint: "/api/admin/teams/zone-auto-assign",
    filters: ["zone", "branch", "status"],
    columns: [
      { key: "zoneCode", labelEn: "Zone Code", labelMy: "ဇုန်ကုဒ်" },
      { key: "zoneName", labelEn: "Zone Name", labelMy: "ဇုန်အမည်" },
      { key: "branchName", labelEn: "Branch", labelMy: "ရုံးခွဲ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/station-network": withReport({
    titleEn: "Station Network",
    titleMy: "စတေးရှင်း ကွန်ယက်",
    descriptionEn: "Manage station connectivity and hierarchy.",
    descriptionMy: "စတေးရှင်း ချိတ်ဆက်မှုနှင့် hierarchy ကို စီမံရန်။",
    endpoint: "/api/admin/teams/station-network",
    filters: ["station", "region", "status"],
    columns: [
      { key: "stationCode", labelEn: "Station Code", labelMy: "စတေးရှင်းကုဒ်" },
      { key: "stationName", labelEn: "Station Name", labelMy: "စတေးရှင်းအမည်" },
      { key: "region", labelEn: "Region", labelMy: "ဒေသ" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/station-coverages": withReport({
    titleEn: "Station Coverages",
    titleMy: "စတေးရှင်း Coverage များ",
    descriptionEn: "Station coverage assignment and township mapping.",
    descriptionMy: "စတေးရှင်း coverage assignment နှင့် မြို့နယ် mapping။",
    endpoint: "/api/admin/teams/station-coverages",
    filters: ["station", "township", "status"],
    columns: [
      { key: "stationName", labelEn: "Station", labelMy: "စတေးရှင်း" },
      { key: "township", labelEn: "Township", labelMy: "မြို့နယ်" },
      { key: "coverageType", labelEn: "Coverage Type", labelMy: "Coverage အမျိုးအစား" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/financial-center": withReport({
    titleEn: "Financial Center",
    titleMy: "ဘဏ္ဍာရေး စင်တာ",
    descriptionEn: "Financial center shell under teams.",
    descriptionMy: "Teams အောက်ရှိ ဘဏ္ဍာရေး စင်တာ shell။",
    endpoint: "/api/admin/teams/financial-center",
    filters: ["datePreset", "dateFrom", "dateTo", "branch", "status"],
    totals: ["payable", "receivable", "balance"],
    columns: [
      { key: "branchName", labelEn: "Branch", labelMy: "ရုံးခွဲ" },
      { key: "payable", labelEn: "Payable", labelMy: "ပေးရန်" },
      { key: "receivable", labelEn: "Receivable", labelMy: "ရရန်" },
      { key: "balance", labelEn: "Balance", labelMy: "လက်ကျန်" }
    ]
  }),

  "/portal/admin/teams/hr-management": withReport({
    titleEn: "HR Management",
    titleMy: "HR စီမံခန့်ခွဲမှု",
    descriptionEn: "HR management shell for team operations.",
    descriptionMy: "အဖွဲ့ဆိုင်ရာ HR စီမံခန့်ခွဲမှု shell။",
    endpoint: "/api/admin/teams/hr-management",
    filters: ["department", "status"],
    columns: [
      { key: "employeeCode", labelEn: "Employee Code", labelMy: "ဝန်ထမ်းကုဒ်" },
      { key: "employeeName", labelEn: "Employee Name", labelMy: "ဝန်ထမ်းအမည်" },
      { key: "department", labelEn: "Department", labelMy: "ဌာန" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/teams/pricing-and-package": withReport({
    titleEn: "Pricing And Package",
    titleMy: "စျေးနှုန်းနှင့် ပက်ကေ့ဂျ်",
    descriptionEn: "Pricing and package shell.",
    descriptionMy: "စျေးနှုန်းနှင့် ပက်ကေ့ဂျ် shell။",
    endpoint: "/api/admin/teams/pricing-and-package",
    filters: ["packageType", "status"],
    totals: ["price"],
    columns: [
      { key: "packageName", labelEn: "Package Name", labelMy: "ပက်ကေ့ဂျ်အမည်" },
      { key: "packageType", labelEn: "Type", labelMy: "အမျိုးအစား" },
      { key: "price", labelEn: "Price", labelMy: "စျေးနှုန်း" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/contacts/customer-support": withReport({
    titleEn: "Customer Support",
    titleMy: "ဖောက်သည် ထောက်ပံ့ရေး",
    descriptionEn: "Customer support shell with searchable ticket/contact view.",
    descriptionMy: "ရှာဖွေနိုင်သော ticket/contact view ပါသော customer support shell။",
    endpoint: "/api/admin/contacts/customer-support",
    filters: ["datePreset", "dateFrom", "dateTo", "channel", "status"],
    columns: [
      { key: "ticketNo", labelEn: "Ticket No", labelMy: "Ticket နံပါတ်" },
      { key: "customerName", labelEn: "Customer", labelMy: "ဖောက်သည်" },
      { key: "channel", labelEn: "Channel", labelMy: "ချန်နယ်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  }),

  "/portal/admin/settings/audit-logs": withReport({
    titleEn: "Audit Logs",
    titleMy: "စစ်ဆေးမှတ်တမ်းများ",
    descriptionEn: "System audit trail review screen.",
    descriptionMy: "စနစ် audit trail စစ်ဆေးမှု မျက်နှာပြင်။",
    endpoint: "/api/admin/settings/audit-logs",
    filters: ["datePreset", "dateFrom", "dateTo", "user", "module"],
    columns: [
      { key: "eventTime", labelEn: "Event Time", labelMy: "ဖြစ်ပွားချိန်" },
      { key: "userName", labelEn: "User", labelMy: "အသုံးပြုသူ" },
      { key: "module", labelEn: "Module", labelMy: "မော်ဂျူး" },
      { key: "action", labelEn: "Action", labelMy: "လုပ်ဆောင်ချက်" }
    ]
  }),

  "/portal/admin/settings/terms-conditions": withReport({
    titleEn: "Terms & Conditions",
    titleMy: "စည်းကမ်းနှင့် အခြေအနေများ",
    descriptionEn: "Terms and conditions content management shell.",
    descriptionMy: "စည်းကမ်းနှင့် အခြေအနေများ content management shell။",
    endpoint: "/api/admin/settings/terms-conditions",
    filters: ["version", "status"],
    columns: [
      { key: "version", labelEn: "Version", labelMy: "ဗားရှင်း" },
      { key: "effectiveDate", labelEn: "Effective Date", labelMy: "စတင်အသက်ဝင်သည့်ရက်" },
      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" }
    ]
  })
};
