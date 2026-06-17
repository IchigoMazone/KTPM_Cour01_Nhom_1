from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from psycopg2.extras import Json, RealDictCursor

from app.core.security import decode_access_token
from app.database.database import get_connection
from app.dependencies.auth import get_current_user

from app.api.home_shared import *

@router_home.get("/staff/overview")
def get_staff_overview(
    limit: int = Query(default=500, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        sync_order_machine_statuses(cursor)
        connect.commit()

        return {
            "staff": select_all_or_empty(cursor, "home_staff_profiles", limit),
            "inventory": select_all_or_empty(cursor, "home_inventory_items", limit),
            "machines": select_all_or_empty(cursor, "home_machines", limit),
        }
    finally:
        cursor.close()
        connect.close()


@router_home.get("/customers")
def list_customers(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        where_sql = ""
        params = []
        if q:
            like_query = f"%{q.strip()}%"
            where_sql = """
                WHERE c.customer_code ILIKE %s
                   OR c.full_name ILIKE %s
                   OR c.phone ILIKE %s
                   OR c.email ILIKE %s
                   OR a.username ILIKE %s
            """
            params = [like_query] * 5
        cursor.execute(
            f"""
            SELECT c.*, a.username AS account_username, a.is_active AS account_active
            FROM home_customers c
            LEFT JOIN accounts a ON a.user_id = c.account_id
            {where_sql}
            ORDER BY c.created_at DESC
            LIMIT %s OFFSET %s
            """,
            [*params, limit, offset],
        )
        items = [serialize_row(row) for row in cursor.fetchall()]
        total = len(items)
        if include_count:
            cursor.execute(
                f"""
                SELECT COUNT(*)
                FROM home_customers c
                LEFT JOIN accounts a ON a.user_id = c.account_id
                {where_sql}
                """,
                params,
            )
            total = cursor.fetchone()["count"]
        return {"items": items, "total": total, "limit": limit, "offset": offset}
    finally:
        cursor.close()
        connect.close()


@router_home.get("/my-customer")
def get_my_customer(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        customer = get_current_account_order_customer(cursor, current_user)
        connect.commit()
        return serialize_row(customer)
    finally:
        cursor.close()
        connect.close()


@router_home.get("/booking-requests")
def list_booking_requests(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        where_parts = ["1=1"]
        params = []
        if current_user.get("role") != "admin":
            where_parts.append("requested_by = %s")
            params.append(current_user["user_id"])
        if q:
            like_query = f"%{q.strip()}%"
            where_parts.append(
                """
                (
                    booking_code ILIKE %s
                    OR customer_code ILIKE %s
                    OR customer_name ILIKE %s
                    OR COALESCE(customer_phone, '') ILIKE %s
                    OR COALESCE(service_name, '') ILIKE %s
                )
                """
            )
            params.extend([like_query] * 5)
        where_sql = " AND ".join(where_parts)
        cursor.execute(
            f"""
            SELECT
                booking.booking_id,
                booking.booking_code,
                booking.customer_id,
                booking.customer_code,
                booking.customer_name,
                booking.customer_phone,
                booking.pickup_address,
                booking.delivery_address,
                booking.service_id,
                booking.service_code,
                booking.service_name,
                booking.quantity,
                booking.total_amount,
                booking.status,
                booking.appointment_time,
                booking.wash_date,
                booking.due_at,
                booking.payment_method,
                booking.discount_code,
                booking.note,
                booking.extra_fields,
                booking.reviewed_at,
                booking.created_at,
                booking.updated_at,
                booking.order_id,
                orders.order_code
            FROM home_booking_requests booking
            LEFT JOIN home_orders orders ON orders.order_id = booking.order_id
            WHERE {where_sql}
            ORDER BY booking.created_at DESC
            LIMIT %s OFFSET %s
            """,
            [*params, limit, offset],
        )
        items = [serialize_booking_request_row(row) for row in cursor.fetchall()]
        total = len(items)
        if include_count:
            cursor.execute(
                f"""
                SELECT COUNT(*)
                FROM home_booking_requests
                WHERE {where_sql}
                """,
                params,
            )
            total = cursor.fetchone()["count"]
        return {"items": items, "total": total, "limit": limit, "offset": offset}
    finally:
        cursor.close()
        connect.close()


@router_home.get("/my-bookings")
def list_my_bookings(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        cursor.execute(
            """
            SELECT
                booking.booking_id AS id,
                booking.booking_code,
                booking.customer_code,
                booking.customer_name AS customer,
                COALESCE(booking.service_name, '-') AS service,
                COALESCE(booking.quantity, '-') AS quantity,
                COALESCE(booking.due_at::date, booking.wash_date, booking.created_at::date) AS delivery_date,
                COALESCE(TO_CHAR(booking.due_at, 'HH24:MI'), '-') AS delivery_time,
                COALESCE(booking.appointment_time, '') AS appointment,
                booking.total_amount AS amount,
                booking.status AS status,
                COALESCE(booking.note, '') AS note,
                COALESCE(booking.customer_phone, '') AS phone,
                COALESCE(booking.delivery_address, booking.pickup_address, '') AS address,
                booking.created_at::date AS created_at,
                COALESCE(booking.payment_method, '-') AS payment,
                COALESCE(booking.discount_code, '') AS discount,
                COALESCE(booking.extra_fields->>'serviceUnit', '') AS service_unit,
                COALESCE(booking.extra_fields->>'unitPrice', '0') AS unit_price,
                COALESCE(booking.extra_fields->>'originalAmount', '0') AS original_amount,
                COALESCE(booking.extra_fields->>'discountValue', '') AS discount_value,
                COALESCE(booking.extra_fields->>'discountAmount', '0') AS discount_amount,
                booking.extra_fields AS extra_fields,
                booking.reviewed_at,
                booking.updated_at,
                booking.order_id,
                orders.order_code
            FROM home_booking_requests booking
            LEFT JOIN home_orders orders ON orders.order_id = booking.order_id
            WHERE booking.requested_by = %s
            ORDER BY booking.created_at DESC
            """,
            (current_user["user_id"],),
        )
        return [serialize_booking_request_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.post("/booking-requests", status_code=status.HTTP_201_CREATED)
def create_booking_request(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        wash_date_value = payload.get("wash_date")
        if wash_date_value:
            try:
                wash_day = date.fromisoformat(wash_date_value) if isinstance(wash_date_value, str) else wash_date_value
                if wash_day < date.today():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Lịch đặt đã hết hạn (ngày trong quá khứ), không thể lưu.",
                    )
            except ValueError:
                pass
        customer = resolve_order_customer(
            cursor,
            payload.get("customer_id"),
            payload.get("customer_code"),
            current_user,
        )
        service = resolve_order_service(
            cursor,
            payload.get("service_id"),
            payload.get("service_code"),
        )
        extra_fields = normalize_order_extra_fields(payload.get("extra_fields"))
        promotion_submission = validate_discount_code_for_submission(
            cursor,
            current_user,
            payload.get("discount_code"),
            service,
            extra_fields,
        )
        if promotion_submission and promotion_submission.get("claim"):
            extra_fields["promotion_claim_id"] = str(promotion_submission["claim"]["claim_id"])
        booking_code = payload.get("booking_code") or make_booking_code(cursor)
        cursor.execute(
            """
            INSERT INTO home_booking_requests (
                booking_code, customer_id, customer_code, customer_name, customer_phone,
                pickup_address, delivery_address, service_id, service_code, service_name,
                quantity, total_amount, status, appointment_time, wash_date, due_at,
                payment_method, discount_code, note, extra_fields, requested_by
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, COALESCE(%s, 0), %s, %s, %s, %s,
                %s, %s, %s, COALESCE(%s, '{}'::jsonb), %s
            )
            RETURNING *
            """,
            (
                booking_code,
                customer.get("customer_id"),
                customer["customer_code"],
                customer["full_name"],
                customer.get("phone"),
                payload.get("pickup_address") or customer.get("address"),
                payload.get("delivery_address") or customer.get("address"),
                service["service_id"],
                service["service_code"],
                service["name"],
                payload.get("quantity") or None,
                payload.get("total_amount") or 0,
                "Chờ xử lý",
                payload.get("appointment_time") or None,
                payload.get("wash_date") or None,
                payload.get("due_at") or None,
                payload.get("payment_method") or None,
                payload.get("discount_code") or None,
                payload.get("note") or None,
                Json(extra_fields),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
        connect.commit()
        return serialize_booking_request_row(row)
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/booking-requests/{booking_id}")
def update_booking_request(
    booking_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        booking_uuid = parse_uuid_or_none(booking_id)
        normalized_booking_code = str(booking_id or "").strip().upper() or None
        cursor.execute(
            """
            SELECT *
            FROM home_booking_requests
            WHERE (%s IS NOT NULL AND booking_id = %s)
               OR (%s IS NOT NULL AND booking_code = %s)
            FOR UPDATE
            """,
            (booking_uuid, booking_uuid, normalized_booking_code, normalized_booking_code),
        )
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy yêu cầu đặt lịch.")
        if current_user.get("role") != "admin" and booking.get("requested_by") != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật yêu cầu này.")

        requested_status = str(payload.get("status") or booking["status"]).strip() or booking["status"]
        if requested_status not in BOOKING_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái đặt lịch không hợp lệ.")
        if current_user.get("role") != "admin" and requested_status not in {"Chờ xử lý", "Không được duyệt"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Khách hàng không thể tự duyệt lịch.")
        if current_user.get("role") == "admin" and booking.get("status") != "Chờ xử lý" and requested_status in {"Đã được duyệt", "Không được duyệt"}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Yêu cầu đặt lịch này đã được xử lý.")
        if booking.get("order_id") and requested_status == "Không được duyệt":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Yêu cầu đã được duyệt và tạo đơn hàng, không thể từ chối nữa.")

        data = {}
        if "note" in payload:
            data["note"] = payload.get("note") or None
        if "status" in payload:
            data["status"] = requested_status
        if current_user.get("role") == "admin" and requested_status in {"Đã được duyệt", "Không được duyệt"}:
            data["reviewed_by"] = current_user["user_id"]
            data["reviewed_at"] = datetime.now()

        if requested_status == "Đã được duyệt" and not booking.get("order_id"):
            order_row = insert_home_order(cursor, build_home_order_payload_from_booking(booking), current_user)
            data["order_id"] = order_row["order_id"]
        elif requested_status == "Đã được duyệt":
            cursor.execute(
                "SELECT order_code FROM home_orders WHERE order_id = %s",
                (booking["order_id"],),
            )
            order_row = cursor.fetchone()
        else:
            order_row = None

        if not data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có thay đổi hợp lệ.")

        columns = list(data.keys())
        set_sql = ", ".join([f"{column} = %s" for column in columns])
        cursor.execute(
            f"""
            UPDATE home_booking_requests
            SET {set_sql}, updated_at = NOW()
            WHERE booking_id = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], booking["booking_id"]],
        )
        updated_row = cursor.fetchone()
        connect.commit()
        payload = serialize_booking_request_row(updated_row)
        if order_row and order_row.get("order_code"):
            payload["order_code"] = order_row["order_code"]
        return payload
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.delete("/booking-requests/{booking_id}")
def delete_booking_request(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_booking_requests_table(cursor)
        booking_uuid = parse_uuid_or_none(booking_id)
        normalized_booking_code = str(booking_id or "").strip().upper() or None
        cursor.execute(
            """
            SELECT booking_id, booking_code, requested_by
            FROM home_booking_requests
            WHERE (%s IS NOT NULL AND booking_id = %s)
               OR (%s IS NOT NULL AND booking_code = %s)
            FOR UPDATE
            """,
            (booking_uuid, booking_uuid, normalized_booking_code, normalized_booking_code),
        )
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy yêu cầu đặt lịch.")
        if current_user.get("role") != "admin" and booking.get("requested_by") != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xóa yêu cầu này.")

        cursor.execute(
            """
            DELETE FROM home_booking_requests
            WHERE booking_id = %s
            RETURNING booking_id, booking_code
            """,
            (booking["booking_id"],),
        )
        deleted = cursor.fetchone()
        connect.commit()
        return {
            "success": True,
            "deleted_id": str(deleted["booking_id"]),
            "booking_code": deleted["booking_code"],
        }
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.post("/customers", status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    full_name = require_text(payload, "full_name", "Tên khách hàng không được để trống.")
    phone = require_text(payload, "phone", "Số điện thoại không được để trống.")
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        account_id = find_customer_account_id(cursor, payload.get("email"), phone)
        customer_code = payload.get("customer_code") or make_next_customer_code(cursor)
        cursor.execute(
            """
            INSERT INTO home_customers (
                customer_code, full_name, phone, email, address, birthday, rank,
                total_orders, total_spent, loyalty_points, note, image_url,
                account_id, extra_fields, created_by
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, COALESCE(%s, 'Thường'),
                COALESCE(%s, 0), COALESCE(%s, 0), COALESCE(%s, 0), %s, %s,
                %s, COALESCE(%s, '{}'::jsonb), %s
            )
            RETURNING *
            """,
            (
                customer_code,
                full_name,
                phone,
                payload.get("email") or None,
                payload.get("address") or None,
                payload.get("birthday") or None,
                payload.get("rank") or "Thường",
                payload.get("total_orders") or 0,
                payload.get("total_spent") or 0,
                payload.get("loyalty_points") or 0,
                payload.get("note") or None,
                payload.get("image_url") or None,
                account_id,
                Json(payload.get("extra_fields") or {}),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
        sync_account_avatar_from_customer(cursor, row.get("account_id"), row.get("image_url"))
        row = select_customer(cursor, str(row["customer_id"]))
        connect.commit()
        return serialize_row(row)
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/customers/{customer_id}")
def update_customer(
    customer_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    data = filter_payload(
        payload,
        {
            "full_name", "phone", "email", "address", "birthday", "rank",
            "total_orders", "total_spent", "loyalty_points", "note", "image_url",
            "extra_fields",
        },
    )
    if "full_name" in data and not str(data["full_name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên khách hàng không được để trống.")
    if "phone" in data and not str(data["phone"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Số điện thoại không được để trống.")
    if "birthday" in data and not data["birthday"]:
        data["birthday"] = None
    if "extra_fields" in data:
        data["extra_fields"] = Json(data["extra_fields"] or {})
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        customer_uuid, customer_code = resolve_customer_identifier(customer_id)
        cursor.execute(
            """
            SELECT customer_id, email, phone
            FROM home_customers
            WHERE (%s IS NOT NULL AND customer_id = %s)
               OR (%s IS NOT NULL AND customer_code = %s)
            """,
            (customer_uuid, customer_uuid, customer_code, customer_code),
        )
        current_row = cursor.fetchone()
        if not current_row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khách hàng.")
        account_id = find_customer_account_id(
            cursor,
            data.get("email", current_row["email"]),
            data.get("phone", current_row["phone"]),
            str(current_row["customer_id"]),
        )
        data["account_id"] = account_id
        columns = list(data.keys())
        set_sql = ", ".join([f"{column} = %s" for column in columns])
        cursor.execute(
            f"""
            UPDATE home_customers
            SET {set_sql}, updated_at = NOW()
            WHERE (%s IS NOT NULL AND customer_id = %s)
               OR (%s IS NOT NULL AND customer_code = %s)
            RETURNING *
            """,
            [*[data[column] for column in columns], customer_uuid, customer_uuid, customer_code, customer_code],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khách hàng.")
        sync_account_avatar_from_customer(cursor, row.get("account_id"), row.get("image_url"))
        row = select_customer(cursor, str(row["customer_id"]))
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


@router_home.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        customer_uuid, customer_code = resolve_customer_identifier(customer_id)
        cursor.execute(
            """
            DELETE FROM home_customers
            WHERE (%s IS NOT NULL AND customer_id = %s)
               OR (%s IS NOT NULL AND customer_code = %s)
            RETURNING customer_id
            """,
            (customer_uuid, customer_uuid, customer_code, customer_code),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy khách hàng.")
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


@router_home.get("/orders")
def list_orders(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    return list_home_rows(HOME_TABLES["orders"], q, limit, offset, include_count, connect)


@router_home.get("/orders/{order_id}/history")
def get_order_status_history(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT order_id
            FROM home_orders
            WHERE order_id::text = %s OR order_code = %s
            """,
            (order_id, order_id),
        )
        order = cursor.fetchone()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đơn hàng.")
        cursor.execute(
            """
            SELECT
                history.history_id,
                history.previous_status,
                history.status,
                history.changed_at,
                COALESCE(account.full_name, account.username) AS changed_by_name
            FROM home_order_status_history history
            LEFT JOIN accounts account ON account.user_id = history.changed_by
            WHERE history.order_id = %s
            ORDER BY history.changed_at ASC, history.history_id ASC
            """,
            (order["order_id"],),
        )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.get("/my-orders")
def list_my_orders(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if current_user.get("role") == "admin":
            where_sql = "o.customer_code = %s"
            params = ("QL-0001",)
        else:
            where_sql = "c.account_id = %s"
            params = (current_user["user_id"],)
        cursor.execute(
            f"""
            SELECT
                o.order_code AS id,
                o.customer_code AS customer_code,
                o.customer_name AS customer,
                COALESCE(c.image_url, a.image_url, '') AS customer_image_url,
                COALESCE(o.service_name, '-') AS service,
                COALESCE(o.quantity, '-') AS quantity,
                COALESCE(o.due_at::date, o.wash_date, o.created_at::date) AS delivery_date,
                COALESCE(TO_CHAR(o.due_at, 'HH24:MI'), '-') AS delivery_time,
                COALESCE(o.appointment_time, '') AS appointment,
                COALESCE(o.assigned_staff, '-') AS staff,
                o.total_amount AS amount,
                o.status AS status,
                COALESCE(o.note, '') AS note,
                COALESCE(o.customer_phone, '') AS phone,
                COALESCE(o.delivery_address, o.pickup_address, '') AS address,
                o.created_at::date AS created_at,
                COALESCE(o.payment_method, '-') AS payment,
                COALESCE(o.discount_code, '') AS discount,
                COALESCE(o.washer_code, '') AS washer,
                COALESCE(o.dryer_code, '') AS dryer,
                COALESCE(o.extra_fields->>'serviceUnit', '') AS service_unit,
                COALESCE(o.extra_fields->>'unitPrice', '0') AS unit_price,
                COALESCE(o.extra_fields->>'originalAmount', '0') AS original_amount,
                COALESCE(o.extra_fields->>'discountValue', '') AS discount_value,
                COALESCE(o.extra_fields->>'discountAmount', '0') AS discount_amount,
                o.extra_fields AS extra_fields
            FROM home_orders o
            LEFT JOIN home_customers c ON c.customer_id = o.customer_id
            LEFT JOIN accounts a ON a.user_id = c.account_id
            WHERE {where_sql}
            ORDER BY o.created_at DESC
            """,
            params,
        )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        wash_date_val = payload.get("wash_date")
        if wash_date_val:
            try:
                if isinstance(wash_date_val, str):
                    wd = date.fromisoformat(wash_date_val)
                else:
                    wd = wash_date_val
                if wd < date.today():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Lịch đặt đã hết hạn (ngày trong quá khứ), không thể lưu."
                    )
            except ValueError:
                pass

        row = insert_home_order(cursor, payload, current_user)
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


@router_home.put("/orders/{order_id}")
def update_order(
    order_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    data = filter_payload(
        payload,
        {
            "customer_id", "customer_code", "customer_name", "customer_phone", "pickup_address", "delivery_address",
            "service_id", "service_code", "service_name", "quantity", "total_amount", "status", "appointment_time",
            "wash_date", "due_at", "washer_code", "dryer_code", "assigned_staff",
            "payment_method", "discount_code", "payment_status", "note", "extra_fields",
        },
    )
    if "customer_name" in data and not str(data["customer_name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên khách hàng không được để trống.")
    for nullable_field in {"wash_date", "due_at"}:
        if nullable_field in data and not data[nullable_field]:
            data[nullable_field] = None
    if "extra_fields" in data:
        data["extra_fields"] = Json(normalize_order_extra_fields(data["extra_fields"]))
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    columns = list(data.keys())
    set_sql = ", ".join([f"{column} = %s" for column in columns])
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT order_id, status
            FROM home_orders
            WHERE order_id::text = %s OR order_code = %s
            """,
            (order_id, order_id),
        )
        current_order = cursor.fetchone()
        if not current_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đơn hàng.")
        if "customer_id" in data or "customer_code" in data:
            customer = resolve_order_customer(
                cursor,
                data.get("customer_id"),
                data.get("customer_code"),
                current_user,
            )
            data.update(
                {
                    "customer_id": customer.get("customer_id"),
                    "customer_code": customer["customer_code"],
                    "customer_name": customer["full_name"],
                    "customer_phone": customer.get("phone"),
                    "pickup_address": customer.get("address"),
                    "delivery_address": customer.get("address"),
                }
            )
            columns = list(data.keys())
            set_sql = ", ".join([f"{column} = %s" for column in columns])
        if "service_id" in data or "service_code" in data:
            service = resolve_order_service(
                cursor,
                data.get("service_id"),
                data.get("service_code"),
            )
            data.update(
                {
                    "service_id": service["service_id"],
                    "service_code": service["service_code"],
                    "service_name": service["name"],
                }
            )
            columns = list(data.keys())
            set_sql = ", ".join([f"{column} = %s" for column in columns])
        if "washer_code" in data:
            data["washer_code"] = resolve_order_machine(
                cursor,
                data["washer_code"],
                ["Máy giặt", "Máy giặt sấy"],
                "Máy giặt",
            )
        if "dryer_code" in data:
            data["dryer_code"] = resolve_order_machine(
                cursor,
                data["dryer_code"],
                ["Máy sấy", "Máy giặt sấy"],
                "Máy sấy",
            )
        cursor.execute(
            f"""
            UPDATE home_orders
            SET {set_sql}, updated_at = NOW()
            WHERE order_id::text = %s OR order_code = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], order_id, order_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đơn hàng.")
        if row["status"] != current_order["status"]:
            cursor.execute(
                """
                INSERT INTO home_order_status_history (
                    order_id, previous_status, status, changed_by
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    row["order_id"],
                    current_order["status"],
                    row["status"],
                    current_user["user_id"],
                ),
            )
        deduct_order_inventory(cursor, row)
        release_order_reusable_inventory(cursor, row)
        sync_order_machine_statuses(cursor)
        sync_order_finance(cursor, row, current_user["user_id"])
        sync_order_customer_credit(cursor, row)
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


@router_home.delete("/orders/{order_id}")
def delete_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT *
            FROM home_orders
            WHERE order_id::text = %s OR order_code = %s
            FOR UPDATE
            """,
            (order_id, order_id),
        )
        current_order = cursor.fetchone()
        if not current_order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đơn hàng.")
        release_order_reusable_inventory(cursor, current_order, force=True)
        cursor.execute(
            """
            DELETE FROM home_orders
            WHERE order_id::text = %s OR order_code = %s
            RETURNING order_id
            """,
            (order_id, order_id),
        )
        row = cursor.fetchone()
        sync_order_machine_statuses(cursor)
        connect.commit()
        return {"success": True, "deleted_id": str(row["order_id"])}
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.get("/services")
def list_services(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    return list_home_rows(HOME_TABLES["services"], q, limit, offset, include_count, connect)


@router_home.get("/promotions")
def list_promotions(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if not table_exists(cursor, "home_promotions"):
            return {"items": [], "total": 0, "limit": limit, "offset": offset}

        ensure_promotion_claims_table(cursor)
        sync_promotion_claim_statuses(cursor)

        where_sql = ""
        params: list = []
        if q:
            clauses = [
                "p.code::text ILIKE %s",
                "p.name::text ILIKE %s",
                "p.applied_service::text ILIKE %s",
                "p.note::text ILIKE %s",
            ]
            where_sql = "WHERE " + " OR ".join(clauses)
            params.extend([f"%{q}%"] * len(clauses))

        total = None
        if include_count:
            cursor.execute(
                f"""
                SELECT COUNT(*) AS total
                FROM home_promotions p
                {where_sql}
                """,
                params,
            )
            total = cursor.fetchone()["total"]

        cursor.execute(
            f"""
            SELECT
                p.*,
                COALESCE(claim_stats.used_count, 0) AS used_count
            FROM home_promotions p
            LEFT JOIN (
                SELECT promotion_id, COUNT(*) FILTER (WHERE status = 'Đã sử dụng') AS used_count
                FROM home_promotion_claims
                GROUP BY promotion_id
            ) claim_stats ON claim_stats.promotion_id = p.promotion_id
            {where_sql}
            ORDER BY p.promotion_id DESC
            LIMIT %s OFFSET %s
            """,
            [*params, limit, offset],
        )
        items = [serialize_row(row) for row in cursor.fetchall()]
        return {
            "items": items,
            "total": total if total is not None else offset + len(items),
            "limit": limit,
            "offset": offset,
        }
    finally:
        cursor.close()
        connect.close()


@router_home.get("/finance-records")
def list_finance_records(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    return list_home_rows(HOME_TABLES["finance-records"], q, limit, offset, include_count, connect)


@router_home.get("/daily-reports")
def list_daily_reports(
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    include_count: bool = Query(default=True),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    return list_home_rows(HOME_TABLES["daily-reports"], q, limit, offset, include_count, connect)
