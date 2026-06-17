#!/usr/bin/env python3
import json
import sys
import time
import uuid
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib import error, request


BASE_API = "http://127.0.0.1:8000/api"


def api_request(token: str, method: str, path: str, body: dict[str, Any] | None = None, timeout: int = 12):
    payload = None if body is None else json.dumps(body).encode("utf-8")
    req = request.Request(f"{BASE_API}{path}", data=payload, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    started = time.time()
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            return True, resp.status, (json.loads(raw) if raw else None), time.time() - started
    except error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = raw
        return False, exc.code, parsed, time.time() - started
    except Exception as exc:
        return False, -1, {"error": f"{type(exc).__name__}: {exc}"}, time.time() - started


def log(result_name: str, ok: bool, status: int, elapsed: float, detail: str = ""):
    state = "PASS" if ok else "FAIL"
    suffix = f" {detail}" if detail else ""
    print(f"{state} {status:>3} {elapsed:.2f}s {result_name}{suffix}")


def expect(results: list[tuple[str, bool, int, str]], name: str, ok: bool, status: int, detail: str = ""):
    results.append((name, ok, status, detail))


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: comprehensive_api_smoke.py /tmp/full_api_smoke_setup.json", file=sys.stderr)
        return 2

    setup = json.loads(Path(sys.argv[1]).read_text())
    admin = setup["admin_token"]
    user = setup["user_token"]
    suffix = uuid.uuid4().hex[:6].upper()
    today = date.today().isoformat()
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    state: dict[str, Any] = {}
    results: list[tuple[str, bool, int, str]] = []

    def run(role: str, method: str, path: str, body: dict[str, Any] | None = None, timeout: int = 12):
        token = admin if role == "admin" else user
        ok, status, data, elapsed = api_request(token, method, path, body, timeout)
        detail = ""
        if not ok:
            detail = str(data)[:400]
        log(f"{method} {path}", ok, status, elapsed, detail)
        expect(results, f"{method} {path}", ok, status, detail)
        return ok, status, data

    for role, path in [
        ("admin", "/auth/me"),
        ("admin", "/home/dashboard/summary"),
        ("admin", "/home/dashboard/revenue?range=this_month"),
        ("admin", "/home/dashboard/overview?range=this_month"),
        ("admin", "/home/memos"),
        ("admin", "/home/staff/overview?limit=50"),
        ("admin", "/home/services?limit=50&offset=0&include_count=true"),
        ("admin", "/home/promotions?limit=50&offset=0&include_count=true"),
        ("admin", "/home/finance-records?limit=50&offset=0&include_count=true"),
        ("admin", "/home/customers?limit=50&offset=0&include_count=true"),
        ("admin", "/home/orders?limit=50&offset=0&include_count=true"),
        ("admin", "/home/daily-reports?limit=50&offset=0&include_count=true"),
        ("admin", "/home/support-tickets/full"),
        ("admin", "/home/support-tickets/orders"),
        ("admin", "/home/booking-requests?limit=50&offset=0&include_count=true"),
        ("user", "/auth/me"),
        ("user", "/home/my-customer"),
        ("user", "/home/my-orders"),
        ("user", "/home/my-bookings"),
        ("user", "/home/my-promotion-claims"),
        ("user", "/home/support-tickets/full"),
    ]:
        run(role, "GET", path)

    ok, _, data = run("admin", "POST", "/home/memos", {"content": f"Smoke memo {suffix}", "priority": "Bình thường"})
    if ok:
        state["memo_id"] = data["memo_id"]
        run("admin", "PUT", f"/home/memos/{state['memo_id']}", {"content": f"Smoke memo updated {suffix}", "priority": "Quan trọng"})

    ok, _, data = run("admin", "POST", "/home/services", {
        "name": f"Smoke Service {suffix}",
        "category": "Test",
        "description": "API smoke test service",
        "unit": "kg",
        "price": 25000,
        "turnaround_hours": 24,
        "status": "active",
        "promotion_enabled": True,
        "inventory_items": [],
    })
    if ok:
        state["service_id"] = data["service_id"]
        state["service_code"] = data["service_code"]
        run("admin", "PUT", f"/home/services/{state['service_id']}", {
            "description": f"Updated {suffix}",
            "price": 27000,
            "promotion_enabled": False,
        })

    ok, _, data = run("admin", "POST", "/home/promotions", {
        "code": f"SMOKE{suffix}",
        "name": f"Smoke Promotion {suffix}",
        "type": "Số tiền",
        "value": "5000",
        "applied_service": "Tất cả dịch vụ",
        "start_date": today,
        "usage_limit": 5,
        "note": "API smoke",
    })
    if ok:
        state["promotion_id"] = data["promotion_id"]
        state["promotion_code"] = data["code"]
        run("admin", "PUT", f"/home/promotions/{state['promotion_id']}", {"note": f"Updated {suffix}", "usage_limit": 7})

    ok, _, data = run("admin", "POST", "/home/customers", {
        "full_name": f"Smoke Customer {suffix}",
        "phone": f"09{suffix[:6]}",
        "email": f"smoke_customer_{suffix.lower()}@example.com",
        "address": "Test address",
        "note": "API smoke",
    })
    if ok:
        state["customer_id"] = data["customer_id"]
        run("admin", "PUT", f"/home/customers/{state['customer_id']}", {"note": f"Updated {suffix}", "address": "Updated address"})

    if state.get("service_id"):
        ok, _, data = run("admin", "POST", "/home/orders", {
            "customer_id": setup["customer_id"],
            "customer_code": setup["customer_code"],
            "customer_name": setup["full_name"],
            "customer_phone": setup["phone"],
            "pickup_address": "Test pickup",
            "delivery_address": "Test delivery",
            "service_id": state["service_id"],
            "service_code": state["service_code"],
            "service_name": f"Smoke Service {suffix}",
            "quantity": "2",
            "total_amount": 54000,
            "status": "Đã nhận",
            "appointment_time": "09:00",
            "wash_date": tomorrow,
            "due_at": f"{tomorrow}T10:00:00",
            "assigned_staff": "Admin User",
            "payment_method": "Tiền mặt",
            "note": f"Order smoke {suffix}",
            "extra_fields": {
                "serviceUnit": "kg",
                "unitPrice": "27000",
                "originalAmount": "54000",
                "discountValue": "",
                "discountAmount": "0",
            },
        })
        if ok:
            state["order_id"] = data["order_id"]
            state["order_code"] = data["order_code"]
            run("admin", "PUT", f"/home/orders/{state['order_id']}", {
                "quantity": "3",
                "total_amount": 81000,
                "status": "Phân loại",
                "note": f"Order updated {suffix}",
                "extra_fields": {
                    "serviceUnit": "kg",
                    "unitPrice": "27000",
                    "originalAmount": "81000",
                    "discountValue": "",
                    "discountAmount": "0",
                },
            })
            run("admin", "GET", f"/home/orders/{state['order_id']}/history")

    ok, _, data = run("admin", "POST", "/home/finance-records", {
        "transaction_date": tomorrow,
        "type": "Chi phí",
        "customer": f"Nhà cung cấp {suffix}",
        "related_code": "-",
        "payment_method": "Tiền mặt",
        "amount": 123000,
        "status": "Đã chi",
        "owner": "Admin User",
        "note": "Smoke finance",
    })
    if ok:
        state["finance_id"] = data["finance_record_id"]
        run("admin", "PUT", f"/home/finance-records/{state['finance_id']}", {
            "amount": 124000,
            "note": f"Updated {suffix}",
            "customer": f"Nhà cung cấp {suffix}",
        })

    if state.get("promotion_code"):
        run("user", "POST", "/home/promotions/claim", {"code": state["promotion_code"]})

    if state.get("service_id"):
        ok, _, data = run("user", "POST", "/home/booking-requests", {
            "customer_id": setup["customer_id"],
            "customer_code": setup["customer_code"],
            "service_id": state["service_id"],
            "service_code": state["service_code"],
            "quantity": "1",
            "total_amount": 27000,
            "appointment_time": "08:30",
            "wash_date": tomorrow,
            "due_at": f"{tomorrow}T09:30:00",
            "payment_method": "Tiền mặt",
            "note": f"Booking smoke {suffix}",
        })
        if ok:
            state["booking_id"] = data["booking_id"]
            run("user", "PUT", f"/home/booking-requests/{state['booking_id']}", {"note": f"Booking updated {suffix}"})

    if state.get("order_code"):
        ok, _, data = run("user", "POST", "/home/support-tickets", {
            "type": "Hỏng đồ",
            "subject": f"Smoke support {suffix}",
            "note": "Khách báo lỗi test",
            "order_code": state["order_code"],
            "priority": "Trung bình",
        })
        if ok:
            state["ticket_id"] = data["ticket_id"]
            run("user", "POST", f"/home/support-tickets/{state['ticket_id']}/messages", {"content": f"User message {suffix}"})
            run("admin", "POST", f"/home/support-tickets/{state['ticket_id']}/messages", {"content": f"Admin reply {suffix}"})
            run("admin", "GET", "/home/support-tickets/full")

    for role, path in [
        ("admin", f"/home/support-tickets/{state.get('ticket_id')}") if state.get("ticket_id") else None,
        ("admin", f"/home/booking-requests/{state.get('booking_id')}") if state.get("booking_id") else None,
        ("admin", f"/home/finance-records/{state.get('finance_id')}") if state.get("finance_id") else None,
        ("admin", f"/home/orders/{state.get('order_id')}") if state.get("order_id") else None,
        ("admin", f"/home/customers/{state.get('customer_id')}") if state.get("customer_id") else None,
        ("admin", f"/home/promotions/{state.get('promotion_id')}") if state.get("promotion_id") else None,
        ("admin", f"/home/services/{state.get('service_id')}") if state.get("service_id") else None,
        ("admin", f"/home/memos/{state.get('memo_id')}") if state.get("memo_id") else None,
    ]:
        if role and path:
            run(role, "DELETE", path)

    failed = [item for item in results if not item[1]]
    print(f"\nSUMMARY total={len(results)} failed={len(failed)}")
    for name, _, status, detail in failed:
      print(f"FAILED {status} {name} {detail}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
