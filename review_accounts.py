import csv
import sys
from pathlib import Path

input_file = Path(sys.argv[1] if len(sys.argv) > 1 else "accounts.csv")
out_all = Path("review_all.csv")
out_priv = Path("review_privileged.csv")
out_bulk = Path("review_bulk.csv")

if not input_file.exists():
    print(f"Missing input file: {input_file}")
    raise SystemExit(1)

with input_file.open("r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

fieldnames = rows[0].keys() if rows else [
    "email","user_id","current_role","target_role","privileged",
    "bulk_reset_candidate","must_change_password","current_status","notes"
]

with out_all.open("w", encoding="utf-8", newline="") as fa, \
     out_priv.open("w", encoding="utf-8", newline="") as fp, \
     out_bulk.open("w", encoding="utf-8", newline="") as fb:

    w_all = csv.DictWriter(fa, fieldnames=fieldnames)
    w_priv = csv.DictWriter(fp, fieldnames=fieldnames)
    w_bulk = csv.DictWriter(fb, fieldnames=fieldnames)

    w_all.writeheader()
    w_priv.writeheader()
    w_bulk.writeheader()

    for row in rows:
        w_all.writerow(row)

        privileged = (row.get("privileged") or "").strip().lower()
        bulk = (row.get("bulk_reset_candidate") or "").strip().lower()

        if privileged == "yes":
            w_priv.writerow(row)
        elif bulk == "yes":
            w_bulk.writerow(row)

print("Wrote:")
print(f"  {out_all}")
print(f"  {out_priv}")
print(f"  {out_bulk}")
