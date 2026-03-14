Implemented:
- role-based permission checks for submit / approve / reject
- current role badge in admin shell header
- unauthorized actions hidden from row-level and bulk action areas
- bilingual unauthorized toast messages

Default role rules:
- submit: SUPER_ADMIN, SYS, APP_OWNER, FINANCE, FINANCE_ADMIN, ACCOUNTANT, SUPERVISOR, OPERATIONS_ADMIN
- approve: SUPER_ADMIN, SYS, APP_OWNER, FINANCE_ADMIN
- reject: SUPER_ADMIN, SYS, APP_OWNER, FINANCE_ADMIN
