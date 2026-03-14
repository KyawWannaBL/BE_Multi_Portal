import { supabase } from "@/lib/supabase";

function toInt(v: any, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export default async function handler(req: any, res: any) {
  try {
    const q = req.method === "GET" ? (req.query || {}) : (req.body || {});

    const payload = {
      p_page: toInt(q.page, 1),
      p_page_size: toInt(q.pageSize, 20),
      p_sort_by: String(q.sortBy || "overdue_count"),
      p_sort_order: String(q.sortOrder || "desc"),
      p_date_from: q.dateFrom || null,
      p_date_to: q.dateTo || null,
      p_branch: q.branch || null,
      p_merchant: q.merchant || null,
    };

    const { data, error } = await supabase.rpc("rpc_admin_overdue_ways_by_merchant", payload);

    if (error) {
      return res.status(500).json({
        items: [],
        total: 0,
        page: payload.p_page,
        pageSize: payload.p_page_size,
        summary: {
          overdueWays: 0,
          parcelCount: 0,
        },
        error: error.message,
      });
    }

    return res.status(200).json(
      data || {
        items: [],
        total: 0,
        page: payload.p_page,
        pageSize: payload.p_page_size,
        summary: {
          overdueWays: 0,
          parcelCount: 0,
        },
      }
    );
  } catch (err: any) {
    return res.status(500).json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      summary: {
        overdueWays: 0,
        parcelCount: 0,
      },
      error: err?.message || "Unexpected server error",
    });
  }
}
