Reporting SQL scaffolding

Purpose
- provide backend-ready SQL templates for report generation
- support date range filters
- support branch filter
- support pagination and sorting
- support KPI summary cards
- adapt table names and joins to your live schema before executing

Files
- report_views_template.sql
- report_api_pattern.sql

Expected frontend query params
- page
- pageSize
- sortBy
- sortOrder
- datePreset
- dateFrom
- dateTo
- branch
- merchant
- deliveryman
- township
- status
- voucherNo
- account
- module
