export const formatCurrency = (val: number) => new Intl.NumberFormat('en-MM').format(val) + ' MMK';
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
export const USER_ROLES = { APP_OWNER: 'APP_OWNER', SUPER_ADMIN: 'SUPER_ADMIN', RIDER: 'RIDER', STAFF: 'STAFF' };
