Implemented:
- submit / approve / reject actions now call secure Supabase RPC functions
- browser no longer directly changes approval statuses
- approval decisions now enforced by backend role checks

Requires SQL already applied:
- current_app_role()
- can_submit_approval()
- can_approve_approval()
- can_reject_approval()
- rpc_submit_*
- rpc_approve_*
- rpc_reject_*
