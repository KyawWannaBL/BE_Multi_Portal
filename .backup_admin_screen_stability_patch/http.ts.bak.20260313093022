type JsonParams = Record<string, any>;

function buildQuery(params: JsonParams = {}) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function reportPayload(params: JsonParams = {}, items: any[] = [], summary: Record<string, any> = {}) {
  const page = Number(params.page || 1);
  const pageSize = Number(params.pageSize || 20);
  return {
    items,
    total: items.length,
    page,
    pageSize,
    summary,
  };
}

function listPayload(params: JsonParams = {}, summary: Record<string, any> = {}) {
  return reportPayload(params, [], summary);
}

function fallbackAdminEndpoint(endpoint: string, params: JsonParams = {}) {
  const zero = {};
  const map: Record<string, () => any> = {
    "/api/admin/filter-options/branches": () => [],
    "/api/admin/filter-options/merchants": () => [],
    "/api/admin/filter-options/deliverymen": () => [],

    "/api/admin/way-management/pickup-ways": () => listPayload(params, {
      totalWays: 0, assignedWays: 0, pendingWays: 0, parcelCount: 0,
    }),
    "/api/admin/way-management/deliver-ways": () => listPayload(params, {
      totalWays: 0, outForDelivery: 0, completedWays: 0, parcelCount: 0,
    }),
    "/api/admin/way-management/failed-ways": () => listPayload(params, {
      failedWays: 0, retryPending: 0, returnedWays: 0,
    }),
    "/api/admin/way-management/return-ways": () => listPayload(params, {
      returnWays: 0, processedReturns: 0, pendingReturns: 0, parcelCount: 0,
    }),
    "/api/admin/way-management/parcel-in-out": () => listPayload(params, {
      inCount: 0, outCount: 0, stationCount: 0,
    }),
    "/api/admin/way-management/transit-route": () => listPayload(params, {
      activeRoutes: 0, connectedStations: 0, vehiclesUsed: 0,
    }),
    "/api/admin/way-management/tracking-map": () => listPayload(params, {
      trackedUnits: 0, onlineUnits: 0, alerts: 0,
    }),

    "/api/admin/deliverymen/list": () => listPayload(params, {
      deliverymanCount: 0, activeCount: 0, inactiveCount: 0,
    }),
    "/api/admin/deliverymen/financial-center": () => listPayload(params, {
      totalPayable: 0, totalReceivable: 0, netBalance: 0,
    }),

    "/api/admin/accounting/accounts/account-balance": () => listPayload(params, {
      totalDebit: 0, totalCredit: 0, closingBalance: 0,
    }),
    "/api/admin/accounting/accounts/account-name-title-list": () => listPayload(params, {
      totalAccounts: 0, activeAccounts: 0,
    }),
    "/api/admin/accounting/transactions/simple-transaction": () => listPayload(params, {
      transactionCount: 0, totalAmount: 0,
    }),
    "/api/admin/accounting/transactions/journal-voucher-list": () => listPayload(params, {
      voucherCount: 0, totalDebit: 0, totalCredit: 0,
    }),
    "/api/admin/accounting/transactions/cash-voucher-list": () => listPayload(params, {
      voucherCount: 0, totalAmount: 0,
    }),
    "/api/admin/accounting/transactions/general-ledger-list": () => listPayload(params, {
      ledgerCount: 0, totalDebit: 0, totalCredit: 0,
    }),
    "/api/admin/accounting/financial-reports/cash-book-summary": () => listPayload(params, {
      openingBalance: 0, inflow: 0, outflow: 0, closingBalance: 0,
    }),
    "/api/admin/accounting/financial-reports/journal-summary": () => listPayload(params, {
      journalCount: 0, totalDebit: 0, totalCredit: 0,
    }),
    "/api/admin/accounting/financial-reports/trial-balance": () => listPayload(params, {
      totalDebit: 0, totalCredit: 0,
    }),
    "/api/admin/accounting/financial-reports/income-statement": () => listPayload(params, {
      totalIncome: 0, totalExpense: 0, netIncome: 0,
    }),
    "/api/admin/accounting/financial-reports/balance-sheet": () => listPayload(params, {
      totalAssets: 0, totalLiabilities: 0, totalEquity: 0,
    }),
    "/api/admin/accounting/financial-reports/profit-and-loss": () => listPayload(params, {
      totalRevenue: 0, totalCost: 0, netProfit: 0,
    }),

    "/api/admin/reporting/ways-count-report": () => listPayload(params, {
      totalWays: 0,
    }),
    "/api/admin/reporting/active-ways-count-by-town": () => listPayload(params, {
      activeWays: 0,
    }),
    "/api/admin/reporting/ways-by-deliverymen": () => listPayload(params, {
      totalWays: 0,
    }),
    "/api/admin/reporting/ways-by-merchants": () => listPayload(params, {
      totalWays: 0,
    }),
    "/api/admin/reporting/overdue-ways-count": () => listPayload(params, {
      overdueWays: 0,
    }),
    "/api/admin/reporting/overdue-ways-by-deliveryman": () => listPayload(params, {
      overdueWays: 0,
    }),
    "/api/admin/reporting/overdue-ways-by-merchant": () => listPayload(params, {
      overdueWays: 0,
    }),
    "/api/admin/reporting/total-ways-by-town": () => listPayload(params, {
      totalWays: 0,
    }),
    "/api/admin/reporting/merchants-order-compare": () => listPayload(params, {
      totalOrders: 0,
    }),

    "/api/admin/broadcast-message/message-list": () => listPayload(params, {
      messageCount: 0, sentCount: 0, pendingCount: 0,
    }),
    "/api/admin/broadcast-message/facebook-pages": () => listPayload(params, {
      pageCount: 0,
    }),
    "/api/admin/broadcast-message/viber-bots": () => listPayload(params, {
      botCount: 0,
    }),
    "/api/admin/broadcast-message/media-files": () => listPayload(params, {
      mediaCount: 0,
    }),

    "/api/admin/teams/branches": () => listPayload(params, {
      branchCount: 0,
    }),
    "/api/admin/teams/sync-users-to-hrm": () => listPayload(params, {
      syncedUsers: 0, pendingUsers: 0,
    }),
    "/api/admin/teams/zone-and-auto-assign": () => listPayload(params, {
      zoneCount: 0,
    }),
    "/api/admin/teams/station-network": () => listPayload(params, {
      stationCount: 0,
    }),
    "/api/admin/teams/station-coverages": () => listPayload(params, {
      coverageCount: 0,
    }),
    "/api/admin/teams/financial-center": () => listPayload(params, {
      totalPayable: 0, totalReceivable: 0, netBalance: 0,
    }),
    "/api/admin/teams/hr-management": () => listPayload(params, {
      employeeCount: 0, activeCount: 0,
    }),
    "/api/admin/teams/pricing-and-package": () => listPayload(params, {
      packageCount: 0,
    }),

    "/api/admin/contacts/customer-support": () => listPayload(params, zero),
    "/api/admin/settings/audit-logs": () => listPayload(params, zero),
    "/api/admin/settings/terms-conditions": () => listPayload(params, zero),
  };

  return map[endpoint] ? map[endpoint]() : null;
}

async function parseJsonOrFallback(response: Response, endpoint: string, params: JsonParams = {}) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (contentType.includes("application/json")) {
    return raw ? JSON.parse(raw) : {};
  }

  const trimmed = String(raw || "").trim();
  const looksLikeHtml =
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<");

  if (looksLikeHtml) {
    const fallback = fallbackAdminEndpoint(endpoint, params);
    if (fallback !== null) return fallback;
    throw new Error(`Endpoint returned HTML instead of JSON: ${endpoint}`);
  }

  return raw ? JSON.parse(raw) : {};
}

export async function getJson(path: string, params: JsonParams = {}) {
  const url = `${path}${buildQuery(params)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const fallback = fallbackAdminEndpoint(path, params);
      if (fallback !== null) return fallback;
      throw new Error(`GET ${path} failed with status ${response.status}`);
    }

    return await parseJsonOrFallback(response, path, params);
  } catch (err) {
    const fallback = fallbackAdminEndpoint(path, params);
    if (fallback !== null) return fallback;
    throw err;
  }
}

export async function postJson(path: string, body: JsonParams = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(data?.error || `POST ${path} failed with status ${response.status}`);
  }

  return data;
}

export async function patchJson(path: string, body: JsonParams = {}) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(data?.error || `PATCH ${path} failed with status ${response.status}`);
  }

  return data;
}
