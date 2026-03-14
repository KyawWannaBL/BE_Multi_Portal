type PrivilegeDef = {
  code: string;
  module: string;
  labelEn: string;
  labelMy: string;
};

const RAW_PRIVILEGES = `
Accounting account balance download
Accounting account balance read
Accounting account create
Accounting account delete
Accounting account list
Accounting account update
Accounting balance sheet download
Accounting balance sheet read
Accounting daily accounting download
Accounting daily accounting read
Accounting income statement download
Accounting income statement read
Accounting journal summary download
Accounting journal summary read
Accounting journal vouccher list download
Accounting journal voucher create
Accounting journal voucher list
Accounting ledger list
Accounting ledger list download
Accounting profit and loss download
Accounting profit and loss read
Accounting simple transaction create
Accounting trial balance read
Accouting trial balance download
Address create
Address delete
Address read
Address update
Allow pos service
Allow received from / pay to branch
Chat add member
Chat group rename
Chat message delete
Chat message read
Chat message write
Chat remove member
Chat search people and groups
Comment create
Comment delete
Comment read
Deliver accept
Deliver allow price update
Deliver allow way update
Deliver assign
Deliver cancel
Deliver create/update
Deliver delete
Deliver management level read
Deliver read
Deliver visible all deliver ways
Deliver way allow failed to deliver
Deliver way allow to complete
Deliver way force action
Deliver way processing
Department create
Department delete
Department read
Department update
Fianance received from merchant download
Fianance received from merchant list
Fiance pricing delete
Finance COD from deliveryman list
Finance COD from deliveryman list download
Finance COD received from deliveryman
Finance pricing create
Finance pricing exclusive create
Finance pricing exclusive delete
Finance pricing exclusive list
Finance pricing exclusive update
Finance pricing list
Finance pricing read
Finance pricing update
Finance received from merchant create
Finance refund to merchant create
Finance refund to merchant list
Finance refund to merchant list download
Finance visible all deliver ways
Finance visible all pickup ways
Logs read
Notification delete
Notification read
Pickup accept
Pickup assign
Pickup cancel
Pickup create
Pickup delete
Pickup merchant direct order read
Pickup read
Pickup update
Pickup visible all pickup ways
Pickup way force action
Pickup way processing
Promotion cashback create
Promotion cashback generate reports
Promotion cashback list
Promotion cashback list report download
Promotion cashback list reports
Promotion cashback update
Promotion code check validity
Promotion code create
Promotion code list
Promotion code list download
Promotion create
Promotion delete
Promotion list
Promotion read
Promotion update
Setting global create
Setting global delete
Setting global read
Setting global update
Setting local create
Setting local delete
Setting local read
Setting local update
Station bucket create
Station bucket delete
Station bucket list
Station bucket update
Station create
Station inbound list
Station list
Station outbound list
Station read
Station schedule create
Station schedule delete
Station schedule list
Station schedule update
Station update
User account create
User account deliveryman list
User account merchant list
User account Sync to HR Management
User deliveryman account create
User merchant account create
User role change
User role create
User role list by privileges
User role update
User track the deliverymen
User visible all deliverymen
User visible all merchants
Zone create
Zone delete
Zone list
Zone read
Zone update
`;

const OVERRIDES: Record<string, { code: string; module: string }> = {
  "allow pos service": {
    code: "system.pos_service.allow",
    module: "system",
  },
  "allow received from / pay to branch": {
    code: "system.received_from_pay_to_branch.allow",
    module: "system",
  },
  "accounting journal vouccher list download": {
    code: "accounting.journal_voucher.download",
    module: "accounting",
  },
  "accounting ledger list download": {
    code: "accounting.ledger.download",
    module: "accounting",
  },
  "accouting trial balance download": {
    code: "accounting.trial_balance.download",
    module: "accounting",
  },
  "fianance received from merchant download": {
    code: "finance.received_from_merchant.download",
    module: "finance",
  },
  "fianance received from merchant list": {
    code: "finance.received_from_merchant.list",
    module: "finance",
  },
  "fiance pricing delete": {
    code: "finance.pricing.delete",
    module: "finance",
  },
  "finance cod received from deliveryman": {
    code: "finance.cod_from_deliveryman.receive",
    module: "finance",
  },
  "promotion cashback list report download": {
    code: "promotion.cashback_report.download",
    module: "promotion",
  },
  "promotion cashback list reports": {
    code: "promotion.cashback_report.list",
    module: "promotion",
  },
  "user role list by privileges": {
    code: "user.role.list_by_privileges",
    module: "user",
  },
  "user account sync to hr management": {
    code: "user.account.sync_to_hr_management",
    module: "user",
  },
};

const MULTI_WORD_ACTIONS = [
  ["check", "validity"],
  ["generate", "reports"],
  ["add", "member"],
  ["remove", "member"],
  ["group", "rename"],
  ["force", "action"],
  ["create", "update"],
];

function normalizeLine(input: string) {
  return input
    .trim()
    .replace(/^Accouting\b/i, "Accounting")
    .replace(/^Fianance\b/i, "Finance")
    .replace(/^Fiance\b/i, "Finance")
    .replace(/vouccher/gi, "voucher");
}

function buildPrivilege(line: string): PrivilegeDef {
  const fixed = normalizeLine(line);
  const lower = fixed.toLowerCase();

  if (OVERRIDES[lower]) {
    return {
      code: OVERRIDES[lower].code,
      module: OVERRIDES[lower].module,
      labelEn: fixed,
      labelMy: fixed,
    };
  }

  const words = lower.replace(/\//g, " or ").split(/\s+/).filter(Boolean);
  const module = words[0];

  let action = words[words.length - 1];
  let actionLength = 1;

  const matchedAction = MULTI_WORD_ACTIONS.find(
    (parts) => words.slice(-parts.length).join(" ") === parts.join(" ")
  );

  if (matchedAction) {
    action = matchedAction.join("_");
    actionLength = matchedAction.length;
  }

  const resourceWords = words.slice(1, words.length - actionLength);
  const resource = resourceWords.join("_") || "general";

  return {
    code: `${module}.${resource}.${action}`.replace(/_+/g, "_"),
    module,
    labelEn: fixed,
    labelMy: fixed,
  };
}

export const PRIVILEGES: PrivilegeDef[] = RAW_PRIVILEGES.trim()
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map(buildPrivilege);

export const PRIVILEGE_GROUPS = Object.entries(
  PRIVILEGES.reduce((acc, item) => {
    acc[item.module] ||= [];
    acc[item.module].push(item);
    return acc;
  }, {} as Record<string, PrivilegeDef[]>)
).map(([module, items]) => ({
  module,
  items: items.sort((a, b) => a.code.localeCompare(b.code)),
}));
