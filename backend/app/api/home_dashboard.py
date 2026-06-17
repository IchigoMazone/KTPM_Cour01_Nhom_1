from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from psycopg2.extras import Json, RealDictCursor

from app.core.security import decode_access_token
from app.database.database import get_connection
from app.dependencies.auth import get_current_user

from app.api.home_shared import *

@router_home.get("/dashboard/summary")
def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        return {
            "total_orders": count_rows(cursor, "home_orders"),
            "active_orders": count_rows(cursor, "home_orders", "WHERE status <> 'Hoàn thành'"),
            "paid_revenue": serialize(sum_column(cursor, "home_orders", "total_amount", "WHERE payment_status = 'Đã thanh toán'")),
            "support_requests": count_rows(cursor, "home_support_tickets"),
            "total_customers": count_rows(cursor, "home_customers"),
            "active_staff": count_rows(cursor, "home_staff_profiles", "WHERE status = 'Đang làm'"),
            "low_inventory_items": count_rows(cursor, "home_inventory_items", "WHERE status IN ('Sắp hết', 'Cần mua')"),
        }
    finally:
        cursor.close()
        connect.close()


@router_home.get("/dashboard/revenue")
def get_dashboard_revenue(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    group_days: int = Query(default=1, ge=1, le=3650),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    range_end = end_date or date.today()
    range_start = start_date or (range_end - timedelta(days=6))
    if range_start > range_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày bắt đầu không được lớn hơn ngày kết thúc.",
        )
    if (range_end - range_start).days > 3650:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khoảng doanh thu tối đa là 3651 ngày.",
        )

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            WITH buckets AS (
                SELECT
                    %s::date + (bucket_index * %s)::int AS start_date,
                    LEAST(
                        %s::date + ((bucket_index + 1) * %s - 1)::int,
                        %s::date
                    ) AS end_date
                FROM generate_series(
                    0,
                    ((%s::date - %s::date) / %s)::int
                ) AS bucket_index
            )
            SELECT
                buckets.start_date,
                buckets.end_date,
                COALESCE(SUM(finance.amount), 0) AS revenue
            FROM buckets
            LEFT JOIN home_finance_records finance
              ON finance.transaction_date BETWEEN buckets.start_date AND buckets.end_date
             AND finance.type = 'Doanh thu'
             AND finance.status = 'Đã thu'
            GROUP BY buckets.start_date, buckets.end_date
            ORDER BY buckets.start_date
            """,
            (
                range_start,
                group_days,
                range_start,
                group_days,
                range_end,
                range_end,
                range_start,
                group_days,
            ),
        )
        return {
            "start_date": range_start.isoformat(),
            "end_date": range_end.isoformat(),
            "group_days": group_days,
            "items": [serialize_row(row) for row in cursor.fetchall()],
        }
    finally:
        cursor.close()
        connect.close()


@router_home.get("/dashboard/overview")
def get_dashboard_overview(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    range_end = end_date or date.today()
    range_start = start_date or range_end
    if range_start > range_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày bắt đầu không được lớn hơn ngày kết thúc.",
        )

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        connect.commit()

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_orders,
                COUNT(*) FILTER (
                    WHERE status NOT IN ('Hoàn thành', 'Đã hủy')
                ) AS active_orders,
                COUNT(*) FILTER (
                    WHERE status = 'Hoàn thành'
                ) AS completed_orders,
                COUNT(DISTINCT COALESCE(customer_id::text, NULLIF(customer_code, ''), NULLIF(customer_name, '')))
                    AS total_customers
            FROM home_orders
            WHERE created_at::date BETWEEN %s AND %s
            """,
            (range_start, range_end),
        )
        order_summary = cursor.fetchone()

        cursor.execute(
            """
            SELECT COALESCE(SUM(amount), 0) AS paid_revenue
            FROM home_finance_records
            WHERE transaction_date BETWEEN %s AND %s
              AND type = 'Doanh thu'
              AND status = 'Đã thu'
            """,
            (range_start, range_end),
        )
        paid_revenue = cursor.fetchone()["paid_revenue"]

        support_requests = 0
        if table_exists(cursor, "home_support_tickets"):
            cursor.execute(
                """
                SELECT COUNT(*) AS value
                FROM home_support_tickets
                WHERE created_at::date BETWEEN %s AND %s
                """,
                (range_start, range_end),
            )
            support_requests = cursor.fetchone()["value"]

        cursor.execute(
            """
            SELECT mapped_status AS name, COUNT(*) AS value
            FROM (
                SELECT CASE
                    WHEN status = 'Hoàn thành' THEN 'Hoàn thành'
                    WHEN status IN ('Đã nhận', 'Phân loại') THEN 'Mới'
                    WHEN COALESCE(due_at::date, wash_date) < CURRENT_DATE THEN 'Quá hạn'
                    ELSE 'Đang xử lý'
                END AS mapped_status
                FROM home_orders
                WHERE created_at::date BETWEEN %s AND %s
                  AND status <> 'Đã hủy'
            ) statuses
            GROUP BY mapped_status
            """,
            (range_start, range_end),
        )
        order_status_mix = [serialize_row(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT COALESCE(NULLIF(service_name, ''), 'Chưa xác định') AS name, COUNT(*) AS value
            FROM home_orders
            WHERE created_at::date BETWEEN %s AND %s
              AND status <> 'Đã hủy'
            GROUP BY COALESCE(NULLIF(service_name, ''), 'Chưa xác định')
            ORDER BY value DESC, name
            LIMIT 6
            """,
            (range_start, range_end),
        )
        service_mix = [serialize_row(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            WITH days AS (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')::date AS day
            )
            SELECT days.day, COALESCE(SUM(finance.amount), 0) AS revenue
            FROM days
            LEFT JOIN home_finance_records finance
              ON finance.transaction_date = days.day
             AND finance.type = 'Doanh thu'
             AND finance.status = 'Đã thu'
            GROUP BY days.day
            ORDER BY days.day
            """
        )
        revenue_7_days = [serialize_row(row) for row in cursor.fetchall()]

        if current_user.get("role") == "admin":
            cursor.execute(
                """
                WITH appointment_items AS (
                    SELECT
                        booking_id::text AS booking_id,
                        booking_code AS order_code,
                        customer_name,
                        COALESCE(NULLIF(service_name, ''), 'Đơn hàng') AS service_name,
                        COALESCE(NULLIF(appointment_time, ''), TO_CHAR(due_at, 'HH24:MI'), '--:--') AS appointment_time,
                        CASE
                            WHEN COALESCE(due_at::date, wash_date) = CURRENT_DATE THEN 'Hôm nay'
                            ELSE COALESCE(TO_CHAR(COALESCE(due_at::date, wash_date), 'DD/MM'), '--/--')
                        END AS date_label,
                        'Lấy đồ' AS appointment_type,
                        status,
                        wash_date,
                        due_at,
                        COALESCE(due_at, wash_date::timestamp, created_at) AS sort_at,
                        created_at
                    FROM home_booking_requests
                    WHERE status = 'Chờ xử lý'
                      AND (requested_by IS NULL OR requested_by <> %s)

                    UNION ALL

                    SELECT
                        order_id::text AS booking_id,
                        order_code AS order_code,
                        customer_name,
                        COALESCE(NULLIF(service_name, ''), 'Đơn hàng') AS service_name,
                        COALESCE(NULLIF(appointment_time, ''), TO_CHAR(due_at, 'HH24:MI'), '--:--') AS appointment_time,
                        CASE
                            WHEN COALESCE(due_at::date, wash_date) = CURRENT_DATE THEN 'Hôm nay'
                            ELSE COALESCE(TO_CHAR(COALESCE(due_at::date, wash_date), 'DD/MM'), '--/--')
                        END AS date_label,
                        CASE
                            WHEN status IN ('Sẵn sàng giao', 'Đang giao') THEN 'Giao đồ'
                            ELSE 'Theo dõi'
                        END AS appointment_type,
                        status,
                        wash_date,
                        due_at,
                        COALESCE(due_at, wash_date::timestamp, created_at) AS sort_at,
                        created_at
                    FROM home_orders
                    WHERE status NOT IN ('Hoàn thành', 'Đã hủy')
                )
                SELECT
                    booking_id,
                    order_code,
                    customer_name,
                    service_name,
                    appointment_time,
                    date_label,
                    appointment_type,
                    status,
                    wash_date,
                    due_at
                FROM appointment_items
                ORDER BY sort_at, created_at DESC
                LIMIT 20
                """,
                (current_user["user_id"],),
            )
        else:
            cursor.execute(
                """
                SELECT
                    booking_id,
                    booking_code AS order_code,
                    customer_name,
                    COALESCE(NULLIF(service_name, ''), 'Đơn hàng') AS service_name,
                    COALESCE(NULLIF(appointment_time, ''), TO_CHAR(due_at, 'HH24:MI'), '--:--') AS appointment_time,
                    CASE
                        WHEN COALESCE(due_at::date, wash_date) = CURRENT_DATE THEN 'Hôm nay'
                        ELSE COALESCE(TO_CHAR(COALESCE(due_at::date, wash_date), 'DD/MM'), '--/--')
                    END AS date_label,
                    'Lấy đồ' AS appointment_type,
                    status,
                    wash_date,
                    due_at
                FROM home_booking_requests
                WHERE requested_by = %s
                ORDER BY created_at DESC
                LIMIT 20
                """,
                (current_user["user_id"],),
            )
        appointments = [serialize_booking_request_row(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT
                machine.machine_code,
                machine.name,
                machine.machine_type,
                CASE
                    WHEN machine.status = 'Bảo trì' THEN 'Bảo trì'
                    WHEN active_order.order_code IS NOT NULL THEN 'Đang chạy'
                    ELSE 'Sẵn sàng'
                END AS status,
                active_order.order_code,
                active_order.customer_name
            FROM home_machines machine
            LEFT JOIN LATERAL (
                SELECT order_code, customer_name
                FROM home_orders
                WHERE status IN ('Đang giặt', 'Đang sấy')
                  AND (
                    regexp_replace(COALESCE(washer_code, ''), '^TB-', '')
                        = regexp_replace(machine.machine_code, '^TB-', '')
                    OR regexp_replace(COALESCE(dryer_code, ''), '^TB-', '')
                        = regexp_replace(machine.machine_code, '^TB-', '')
                  )
                ORDER BY updated_at DESC
                LIMIT 1
            ) active_order ON TRUE
            WHERE machine.machine_type IN ('Máy giặt', 'Máy sấy', 'Máy giặt sấy')
            ORDER BY machine.machine_type, machine.machine_code
            """
        )
        machines = [serialize_row(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT COUNT(DISTINCT machine_code) AS value
            FROM (
                SELECT NULLIF(regexp_replace(COALESCE(washer_code, ''), '^TB-', ''), '') AS machine_code
                FROM home_orders
                WHERE status IN ('Đang giặt', 'Đang sấy')
                UNION
                SELECT NULLIF(regexp_replace(COALESCE(dryer_code, ''), '^TB-', ''), '') AS machine_code
                FROM home_orders
                WHERE status IN ('Đang giặt', 'Đang sấy')
            ) active_machine_codes
            WHERE machine_code IS NOT NULL
            """,
        )
        used_machines = cursor.fetchone()["value"]

        cursor.execute(
            """
            SELECT
                item_code,
                name,
                unit,
                inventory_type,
                initial_quantity,
                quantity,
                CASE
                    WHEN quantity <= 0 THEN 'Cần mua'
                    WHEN initial_quantity > 0 AND quantity <= initial_quantity * 0.2 THEN 'Sắp hết'
                    ELSE 'Ổn định'
                END AS status
            FROM home_inventory_items
            ORDER BY
                quantity DESC,
                name
            LIMIT 8
            """
        )
        inventory = [serialize_row(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            (
                SELECT
                    content AS text,
                    priority AS type,
                    updated_at AS created_at
                FROM home_memos
                WHERE created_by = %s
                ORDER BY updated_at DESC
                LIMIT 6
            )
            UNION ALL
            (
                SELECT
                    note AS text,
                    CASE
                        WHEN COALESCE(due_at::date, wash_date) < CURRENT_DATE THEN 'Quan trọng'
                        ELSE 'Lưu ý'
                    END AS type,
                    created_at
                FROM home_orders
                WHERE NULLIF(BTRIM(note), '') IS NOT NULL
                  AND status NOT IN ('Hoàn thành', 'Đã hủy')
                ORDER BY created_at DESC
                LIMIT 4
            )
            UNION ALL
            (
                SELECT
                    'Bảo dưỡng ' || name || ' trước ' || TO_CHAR(next_maintenance_at, 'DD/MM/YYYY') AS text,
                    'Nhắc nhở' AS type,
                    next_maintenance_at AS created_at
                FROM home_machines
                WHERE next_maintenance_at IS NOT NULL
                  AND next_maintenance_at::date <= CURRENT_DATE + 7
                ORDER BY next_maintenance_at
                LIMIT 2
            )
            ORDER BY created_at DESC
            LIMIT 6
            """,
            (current_user["user_id"],),
        )
        reminders = [
            {"text": row["text"], "type": row["type"]}
            for row in cursor.fetchall()
        ]

        return {
            "summary": {
                "total_orders": order_summary["total_orders"],
                "active_orders": order_summary["active_orders"],
                "completed_orders": order_summary["completed_orders"],
                "paid_revenue": serialize(paid_revenue),
                "support_requests": support_requests,
                "total_customers": order_summary["total_customers"],
                "active_staff": count_rows(cursor, "home_staff_profiles", "WHERE status = 'Đang làm'"),
                "low_inventory_items": count_rows(cursor, "home_inventory_items", "WHERE status IN ('Sắp hết', 'Cần mua')"),
                "active_machines": used_machines,
                "total_machines": len(machines),
            },
            "order_status_mix": order_status_mix,
            "service_mix": service_mix,
            "revenue_7_days": revenue_7_days,
            "appointments": appointments,
            "machines": machines,
            "inventory": inventory,
            "reminders": reminders,
        }
    finally:
        cursor.close()
        connect.close()


@router_home.get("/memos")
def list_memos(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT memo_id, content, priority, created_at, updated_at
            FROM home_memos
            WHERE created_by = %s
            ORDER BY
                CASE priority WHEN 'Quan trọng' THEN 0 WHEN 'Bình thường' THEN 1 ELSE 2 END,
                updated_at DESC
            """,
            (current_user["user_id"],),
        )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.post("/memos", status_code=status.HTTP_201_CREATED)
def create_memo(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    content = require_text(payload, "content", "Nội dung ghi nhớ không được để trống.")
    priority = str(payload.get("priority") or "Bình thường").strip()
    if not priority or len(priority) > 60:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mức độ ghi nhớ không hợp lệ.")
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            INSERT INTO home_memos (content, priority, created_by)
            VALUES (%s, %s, %s)
            RETURNING memo_id, content, priority, created_at, updated_at
            """,
            (content, priority, current_user["user_id"]),
        )
        row = cursor.fetchone()
        connect.commit()
        return serialize_row(row)
    except Exception:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.put("/memos/{memo_id}")
def update_memo(
    memo_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    content = require_text(payload, "content", "Nội dung ghi nhớ không được để trống.")
    priority = str(payload.get("priority") or "Bình thường").strip()
    if not priority or len(priority) > 60:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mức độ ghi nhớ không hợp lệ.")
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            UPDATE home_memos
            SET content = %s, priority = %s, updated_at = NOW()
            WHERE memo_id::text = %s AND created_by = %s
            RETURNING memo_id, content, priority, created_at, updated_at
            """,
            (content, priority, memo_id, current_user["user_id"]),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ghi nhớ.")
        connect.commit()
        return serialize_row(row)
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.delete("/memos/{memo_id}")
def delete_memo(
    memo_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_memos
            WHERE memo_id::text = %s AND created_by = %s
            RETURNING memo_id
            """,
            (memo_id, current_user["user_id"]),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ghi nhớ.")
        connect.commit()
        return {"success": True, "deleted_id": str(row[0])}
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.get("/dashboard/recent-orders")
def get_recent_orders(
    limit: int = Query(default=5, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if not table_exists(cursor, "home_orders"):
            return []
        cursor.execute(
            """
            SELECT o.*,
                   (
                       SELECT COUNT(*)
                       FROM home_orders history
                       WHERE history.customer_id = o.customer_id
                   ) AS customer_order_count
            FROM home_orders o
            ORDER BY o.created_at DESC
            LIMIT %s
            """,
            (limit,),
        )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


def refresh_machine_maintenance_dates(cursor, machine_id: str):
    cursor.execute(
        """
        UPDATE home_machines
        SET
            last_maintenance_at = (
                SELECT MAX(maintenance_date)::timestamptz
                FROM home_machine_maintenance_records
                WHERE machine_id::text = %s
            ),
            next_maintenance_at = (
                SELECT MIN(next_maintenance_at)::timestamptz
                FROM home_machine_maintenance_records
                WHERE machine_id::text = %s
                  AND next_maintenance_at IS NOT NULL
            ),
            updated_at = NOW()
        WHERE machine_id::text = %s
        """,
        (machine_id, machine_id, machine_id),
    )


@router_home.get("/machines/{machine_id}/maintenance-records")
def get_machine_maintenance_records(
    machine_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if not table_exists(cursor, "home_machine_maintenance_records"):
            return []
        cursor.execute(
            """
            SELECT *
            FROM home_machine_maintenance_records
            WHERE machine_id::text = %s
            ORDER BY maintenance_date DESC, created_at DESC
            """,
            (machine_id,),
        )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.post("/machines/{machine_id}/maintenance-records", status_code=status.HTTP_201_CREATED)
def create_machine_maintenance_record(
    machine_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    required = ["maintenance_date", "maintenance_type"]
    if any(not payload.get(field) for field in required):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thiếu ngày hoặc loại bảo trì.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            "SELECT machine_id FROM home_machines WHERE machine_id::text = %s",
            (machine_id,),
        )
        machine = cursor.fetchone()
        if not machine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")

        cursor.execute(
            """
            INSERT INTO home_machine_maintenance_records (
                machine_id, maintenance_date, maintenance_type, next_maintenance_at,
                cost, performer, note, created_by
            )
            VALUES (%s, %s, %s, %s, COALESCE(%s, 0), %s, %s, %s)
            RETURNING *
            """,
            (
                machine["machine_id"],
                payload["maintenance_date"],
                payload["maintenance_type"],
                payload.get("next_maintenance_at"),
                payload.get("cost"),
                payload.get("performer"),
                payload.get("note"),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
        refresh_machine_maintenance_dates(cursor, machine_id)
        connect.commit()
        return serialize_row(row)
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/machines/maintenance-records/{record_id}")
def update_machine_maintenance_record(
    record_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed_columns = {
        "maintenance_date",
        "maintenance_type",
        "next_maintenance_at",
        "cost",
        "performer",
        "note",
    }
    data = filter_payload(payload, allowed_columns)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    columns = list(data.keys())
    set_sql = ", ".join([f"{column} = %s" for column in columns])

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            f"""
            UPDATE home_machine_maintenance_records
            SET {set_sql}, updated_at = NOW()
            WHERE record_id::text = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], record_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy lịch sử bảo trì.")

        refresh_machine_maintenance_dates(cursor, str(row["machine_id"]))
        connect.commit()
        return serialize_row(row)
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.delete("/machines/maintenance-records/{record_id}")
def delete_machine_maintenance_record(
    record_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_machine_maintenance_records
            WHERE record_id::text = %s
            RETURNING record_id, machine_id
            """,
            (record_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy lịch sử bảo trì.")

        refresh_machine_maintenance_dates(cursor, str(row[1]))
        connect.commit()
        return {"success": True, "deleted_id": str(row[0])}
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()

