from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from psycopg2.extras import Json, RealDictCursor

from app.core.security import decode_access_token
from app.database.database import get_connection
from app.dependencies.auth import get_current_user

from app.api.home_shared import *

@router_home.post("/services", status_code=status.HTTP_201_CREATED)
def create_service(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    name = require_text(payload, "name", "Tên dịch vụ không được để trống.")
    unit = normalize_service_unit(payload.get("unit"))
    status_value = normalize_service_status(payload.get("status"))

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        inventory_items = validate_service_inventory_items(cursor, payload.get("inventory_items"))
        service_code = payload.get("service_code") or make_sequence_code(
            cursor,
            "home_services",
            "service_code",
        )
        cursor.execute(
            """
            INSERT INTO home_services (
                service_code, name, category, description, unit, price,
                turnaround_hours, status, promotion_enabled, inventory_items, created_by
            )
            VALUES (%s, %s, %s, %s, %s, COALESCE(%s, 0),
                    COALESCE(%s, 24), %s, COALESCE(%s, FALSE), COALESCE(%s, '[]'::jsonb), %s)
            RETURNING *
            """,
            (
                service_code,
                name,
                payload.get("category"),
                payload.get("description"),
                unit,
                payload.get("price"),
                payload.get("turnaround_hours"),
                status_value,
                payload.get("promotion_enabled"),
                Json(inventory_items),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
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


@router_home.put("/services/{service_id}")
def update_service(
    service_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    data = filter_payload(
        payload,
        {
            "service_code",
            "name",
            "category",
            "description",
            "unit",
            "price",
            "turnaround_hours",
            "status",
            "promotion_enabled",
            "inventory_items",
        },
    )
    if "name" in data and not str(data["name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên dịch vụ không được để trống.")
    if "unit" in data:
        data["unit"] = normalize_service_unit(data["unit"])
    if "status" in data:
        data["status"] = normalize_service_status(data["status"])
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if "inventory_items" in data:
            data["inventory_items"] = Json(validate_service_inventory_items(cursor, data["inventory_items"]))
        columns = list(data.keys())
        set_sql = ", ".join([f"{column} = %s" for column in columns])
        cursor.execute(
            f"""
            UPDATE home_services
            SET {set_sql}, updated_at = NOW()
            WHERE service_id::text = %s OR service_code = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], service_id, service_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy dịch vụ.")
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


@router_home.delete("/services/{service_id}")
def delete_service(
    service_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_services
            WHERE service_id::text = %s OR service_code = %s
            RETURNING service_id
            """,
            (service_id, service_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy dịch vụ.")
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


@router_home.post("/promotions", status_code=status.HTTP_201_CREATED)
def create_promotion(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    code = require_text(payload, "code", "Mã giảm giá không được để trống.").upper()
    name = require_text(payload, "name", "Tên chương trình không được để trống.")
    promo_type = require_text(payload, "type", "Loại chương trình không được để trống.")
    if promo_type not in {"Phần trăm", "Số tiền"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại chương trình không hợp lệ.")
    
    value = require_text(payload, "value", "Giá trị giảm giá không được để trống.")
    
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        applied_service = validate_promotion_services(cursor, payload.get("applied_service"))
        cursor.execute("SELECT promotion_id FROM home_promotions WHERE code = %s", (code,))
        if cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá này đã tồn tại.")

        cursor.execute(
            """
            INSERT INTO home_promotions (
                code, name, type, value, applied_service, start_date,
                end_date, usage_limit, claimed, note, created_by
            )
            VALUES (%s, %s, %s, %s, COALESCE(%s, 'Tất cả dịch vụ'),
                    COALESCE(%s, CURRENT_DATE), %s, %s, COALESCE(%s, 0), %s, %s)
            RETURNING *
            """,
            (
                code,
                name,
                promo_type,
                value,
                applied_service,
                payload.get("start_date") or None,
                payload.get("end_date") or None,
                payload.get("usage_limit") or None,
                payload.get("claimed") or 0,
                payload.get("note"),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
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


@router_home.put("/promotions/{promotion_id}")
def update_promotion(
    promotion_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed_columns = {
        "code", "name", "type", "value", "applied_service",
        "start_date", "end_date", "usage_limit", "claimed", "note"
    }
    data = filter_payload(payload, allowed_columns)
    if "code" in data:
        if not str(data["code"]).strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá không được để trống.")
        data["code"] = str(data["code"]).strip().upper()
    if "name" in data and not str(data["name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên chương trình không được để trống.")
    if "type" in data and data["type"] not in {"Phần trăm", "Số tiền"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại chương trình không hợp lệ.")
    if "value" in data and not str(data["value"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Giá trị giảm giá không được để trống.")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    for date_field in ["start_date", "end_date"]:
        if date_field in data and data[date_field] == "":
            data[date_field] = None
    if "usage_limit" in data and (data["usage_limit"] == "" or data["usage_limit"] is None):
        data["usage_limit"] = None

    columns = list(data.keys())
    set_sql = ", ".join([f"{column} = %s" for column in columns])

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if "applied_service" in data:
            data["applied_service"] = validate_promotion_services(cursor, data["applied_service"])
        if "code" in data:
            cursor.execute(
                "SELECT promotion_id FROM home_promotions WHERE code = %s AND promotion_id::text != %s",
                (data["code"], promotion_id),
            )
            if cursor.fetchone():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá này đã tồn tại.")

        cursor.execute(
            f"""
            UPDATE home_promotions
            SET {set_sql}, updated_at = NOW()
            WHERE promotion_id::text = %s OR code = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], promotion_id, promotion_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã giảm giá.")
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


@router_home.delete("/promotions/{promotion_id}")
def delete_promotion(
    promotion_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_promotions
            WHERE promotion_id::text = %s OR code = %s
            RETURNING promotion_id
            """,
            (promotion_id, promotion_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã giảm giá.")
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


@router_home.post("/promotions/claim", status_code=status.HTTP_201_CREATED)
def claim_promotion(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        claimed = claim_promotion_for_user(cursor, current_user, payload.get("code"))
        connect.commit()
        return claimed
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.get("/my-promotion-claims")
def list_my_promotion_claims(
    available_only: bool = Query(default=False),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_promotion_claims_table(cursor)
        sync_promotion_claim_statuses(cursor)
        where_parts = ["claim.user_id = %s"]
        params = [current_user["user_id"]]
        if available_only:
            where_parts.append("claim.status = 'Đã nhận'")
            where_parts.append("(promotion.start_date IS NULL OR promotion.start_date <= CURRENT_DATE)")
            where_parts.append("(promotion.end_date IS NULL OR promotion.end_date >= CURRENT_DATE)")
        cursor.execute(
            f"""
            SELECT
                promotion.*,
                claim.claim_id,
                claim.status,
                claim.claimed_at,
                claim.used_at,
                claim.booking_id,
                claim.order_id,
                claim.customer_id
            FROM home_promotion_claims claim
            JOIN home_promotions promotion ON promotion.promotion_id = claim.promotion_id
            WHERE {' AND '.join(where_parts)}
            ORDER BY claim.claimed_at DESC, promotion.code
            """,
            params,
        )
        return [serialize_promotion_claim_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.delete("/my-promotion-claims/{claim_id}")
def delete_my_promotion_claim(
    claim_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_promotion_claims_table(cursor)
        claim = lock_promotion_claim_by_id(cursor, claim_id)
        if not claim or claim.get("user_id") != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã đã nhận.")

        cursor.execute(
            """
            SELECT promotion_id, end_date
            FROM home_promotions
            WHERE promotion_id = %s
            FOR UPDATE
            """,
            (claim["promotion_id"],),
        )
        promotion = cursor.fetchone()
        if not promotion:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã giảm giá.")

        end_day = coerce_date_value(promotion.get("end_date"))
        if not end_day or end_day >= date.today():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ xóa được mã đã hết hạn.")

        cursor.execute(
            """
            DELETE FROM home_promotion_claims
            WHERE claim_id = %s
            RETURNING claim_id
            """,
            (claim["claim_id"],),
        )
        connect.commit()
        return {"success": True, "deleted_id": str(claim["claim_id"])}
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.delete("/my-promotion-claims")
def delete_all_my_promotion_claims(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_promotion_claims_table(cursor)
        cursor.execute(
            """
            DELETE FROM home_promotion_claims
            WHERE user_id = %s
            RETURNING claim_id
            """,
            (current_user["user_id"],),
        )
        deleted_rows = cursor.fetchall()
        connect.commit()
        return {"success": True, "deleted_count": len(deleted_rows)}
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.post("/staff/inventory", status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    name = require_text(payload, "name", "Tên vật tư không được để trống.")
    unit = require_text(payload, "unit", "Đơn vị vật tư không được để trống.")
    inventory_type = str(payload.get("inventory_type") or "Vật tư tiêu hao").strip()
    if inventory_type not in INVENTORY_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại vật tư không hợp lệ.")
    initial_quantity = payload.get("initial_quantity") or 0
    quantity = payload.get("quantity")
    quantity = initial_quantity if quantity is None else quantity
    status_value = inventory_status(initial_quantity, quantity)

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        item_code = payload.get("item_code") or make_sequence_code(
            cursor,
            "home_inventory_items",
            "item_code",
        )
        cursor.execute(
            """
            INSERT INTO home_inventory_items (
                item_code, name, category, unit, inventory_type, initial_quantity, quantity, supplier,
                cost, status, last_restocked_at, note, created_by
            )
            VALUES (%s, %s, %s, %s, %s, COALESCE(%s, 0), COALESCE(%s, 0), %s,
                    COALESCE(%s, 0), %s, %s, %s, %s)
            RETURNING *
            """,
            (
                item_code,
                name,
                payload.get("category"),
                unit,
                inventory_type,
                initial_quantity,
                quantity,
                payload.get("supplier"),
                payload.get("cost"),
                status_value,
                payload.get("last_restocked_at"),
                payload.get("note"),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
        upsert_inventory_finance(cursor, row, current_user["user_id"])
        connect.commit()
        return serialize_row(row)
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/staff/inventory/{inventory_item_id}")
def update_inventory_item(
    inventory_item_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed_columns = {
        "item_code", "name", "category", "unit", "inventory_type", "initial_quantity", "quantity",
        "supplier", "cost", "status", "last_restocked_at", "note",
    }
    data = filter_payload(payload, allowed_columns)
    if "name" in data and not str(data["name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên vật tư không được để trống.")
    if "unit" in data and not str(data["unit"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Đơn vị vật tư không được để trống.")
    if "status" in data and data["status"] not in {"Ổn định", "Sắp hết", "Cần mua"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái vật tư không hợp lệ.")
    if "inventory_type" in data and data["inventory_type"] not in INVENTORY_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại vật tư không hợp lệ.")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    columns = list(data.keys())
    set_sql = ", ".join([f"{column} = %s" for column in columns])

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if "initial_quantity" in data or "quantity" in data:
            cursor.execute(
                """
                SELECT initial_quantity, quantity
                FROM home_inventory_items
                WHERE inventory_item_id::text = %s OR item_code = %s
                """,
                (inventory_item_id, inventory_item_id),
            )
            current = cursor.fetchone()
            if not current:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy vật tư.")
            data["status"] = inventory_status(
                data.get("initial_quantity", current["initial_quantity"]),
                data.get("quantity", current["quantity"]),
            )
            columns = list(data.keys())
            set_sql = ", ".join([f"{column} = %s" for column in columns])
        cursor.execute(
            f"""
            UPDATE home_inventory_items
            SET {set_sql}, updated_at = NOW()
            WHERE inventory_item_id::text = %s OR item_code = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], inventory_item_id, inventory_item_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy vật tư.")
        upsert_inventory_finance(cursor, row, current_user["user_id"])
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


@router_home.delete("/staff/inventory/{inventory_item_id}")
def delete_inventory_item(
    inventory_item_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_inventory_items
            WHERE inventory_item_id::text = %s OR item_code = %s
            RETURNING inventory_item_id
            """,
            (inventory_item_id, inventory_item_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy vật tư.")
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


@router_home.post("/finance-records", status_code=status.HTTP_201_CREATED)
def create_finance_record(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    type_value = str(payload.get("type") or "Doanh thu").strip()
    if not type_value or type_value in {"Tất cả", "Khác"} or len(type_value) > 30:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại giao dịch không hợp lệ.")
    status_value = FINANCE_FIXED_STATUSES.get(type_value, payload.get("status") or "Đã thu")
    if status_value not in FINANCE_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái giao dịch không hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        customer_code = str(payload.get("customer_code") or "").strip().upper() or None
        customer = str(payload.get("customer") or "").strip()
        if type_value in FINANCE_CUSTOMER_TYPES and not customer_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã khách hàng không được để trống.")
        if customer_code:
            cursor.execute(
                "SELECT customer_code, full_name FROM home_customers WHERE customer_code = %s",
                (customer_code,),
            )
            customer_row = cursor.fetchone()
            if not customer_row:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại khách hàng {customer_code}.",
                )
            customer = customer_row["full_name"]
        else:
            if not customer:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Đối tác không được để trống.")

        related_code = str(
            payload.get("related_code") or payload.get("order_code") or "-"
        ).strip().upper()
        if related_code.startswith("DH-"):
            cursor.execute(
                "SELECT 1 FROM home_orders WHERE order_code = %s",
                (related_code,),
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại đơn hàng {related_code}.",
                )
        elif related_code.startswith("VT-"):
            cursor.execute(
                "SELECT 1 FROM home_inventory_items WHERE item_code = %s",
                (related_code.removeprefix("VT-"),),
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại vật tư {related_code}.",
                )

        transaction_code = make_finance_transaction_code(cursor)
        cursor.execute(
            """
            INSERT INTO home_finance_records (
                transaction_code, transaction_date, type, customer_code, customer, related_code, order_code,
                payment_method, amount, status, owner, note, inventory_item_id, created_by
            )
            VALUES (%s, COALESCE(%s, CURRENT_DATE), %s, %s, %s, %s, %s, %s,
                    COALESCE(%s, 0), %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                transaction_code,
                payload.get("transaction_date"),
                type_value,
                customer_code,
                customer,
                related_code,
                related_code,
                payload.get("payment_method") or "Tiền mặt",
                payload.get("amount"),
                status_value,
                payload.get("owner"),
                payload.get("note"),
                payload.get("inventory_item_id"),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
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


@router_home.put("/finance-records/{finance_record_id}")
def update_finance_record(
    finance_record_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed_columns = {
        "transaction_date", "type", "customer_code", "customer", "inventory_name", "related_code", "order_code", "payment_method",
        "amount", "status", "owner", "note",
    }
    data = filter_payload(payload, allowed_columns)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT * FROM home_finance_records
            WHERE finance_record_id::text = %s OR transaction_code = %s
            """,
            (finance_record_id, finance_record_id),
        )
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy giao dịch.")

        requested_type = data.get("type", current["type"])
        if current.get("order_id") and current["type"] != "Hoàn tiền" and requested_type != "Hoàn tiền":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giao dịch từ đơn hàng chỉ được phép chuyển sang loại Hoàn tiền.",
            )
        creating_refund = bool(
            current.get("order_id")
            and current["type"] != "Hoàn tiền"
            and requested_type == "Hoàn tiền"
        )
        if current.get("order_id"):
            data["type"] = "Hoàn tiền"
            data["status"] = "Đã chi"
            data["customer_code"] = current.get("customer_code")
            data["customer"] = current["customer"]
            data["related_code"] = current["related_code"]
            data["order_code"] = current["order_code"]
        if current.get("inventory_item_id"):
            data["type"] = "Chi phí"
            data["status"] = "Đã chi"

        effective_type = data.get("type", current["type"])
        effective_type = str(effective_type or "").strip()
        if not effective_type or effective_type in {"Tất cả", "Khác"} or len(effective_type) > 30:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Loại giao dịch không hợp lệ.")
        data["type"] = effective_type
        if effective_type in FINANCE_FIXED_STATUSES:
            data["status"] = FINANCE_FIXED_STATUSES[effective_type]
        elif data.get("status", current["status"]) not in FINANCE_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái giao dịch không hợp lệ.")
        customer_code = str(data.get("customer_code", current.get("customer_code")) or "").strip().upper() or None
        if effective_type in FINANCE_CUSTOMER_TYPES and not customer_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã khách hàng không được để trống.")
        if customer_code:
            cursor.execute(
                "SELECT customer_code, full_name FROM home_customers WHERE customer_code = %s",
                (customer_code,),
            )
            customer_row = cursor.fetchone()
            if not customer_row:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại khách hàng {customer_code}.",
                )
            data["customer_code"] = customer_row["customer_code"]
            data["customer"] = customer_row["full_name"]
        else:
            data["customer_code"] = None
            if not str(data.get("customer", current["customer"]) or "").strip():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Đối tác không được để trống.")

        related_code = str(
            data.get("related_code", data.get("order_code", current["related_code"])) or "-"
        ).strip().upper()
        if related_code.startswith("DH-"):
            cursor.execute(
                "SELECT 1 FROM home_orders WHERE order_code = %s",
                (related_code,),
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại đơn hàng {related_code}.",
                )
        elif related_code.startswith("VT-"):
            cursor.execute(
                "SELECT 1 FROM home_inventory_items WHERE item_code = %s",
                (related_code.removeprefix("VT-"),),
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Không tồn tại vật tư {related_code}.",
                )
        data["related_code"] = related_code
        data["order_code"] = related_code

        if creating_refund:
            transaction_code = make_finance_transaction_code(cursor)
            cursor.execute(
                """
                INSERT INTO home_finance_records (
                    transaction_code, transaction_date, type, customer_code, customer,
                    inventory_name, related_code, order_code, payment_method, amount,
                    status, owner, note, order_id, manual_override, created_by
                )
                VALUES (
                    %s, %s, 'Hoàn tiền', %s, %s,
                    %s, %s, %s, %s, %s,
                    'Đã chi', %s, %s, %s, TRUE, %s
                )
                RETURNING *
                """,
                (
                    transaction_code,
                    data.get("transaction_date", current["transaction_date"]),
                    data.get("customer_code", current.get("customer_code")),
                    data.get("customer", current["customer"]),
                    data.get("inventory_name", current.get("inventory_name")),
                    data.get("related_code", current["related_code"]),
                    data.get("order_code", current["order_code"]),
                    data.get("payment_method", current["payment_method"]),
                    data.get("amount", current["amount"]),
                    data.get("owner", current.get("owner")),
                    data.get("note", current.get("note")),
                    current["order_id"],
                    current_user["user_id"],
                ),
            )
            row = cursor.fetchone()
        else:
            columns = list(data.keys())
            set_sql = ", ".join([f"{column} = %s" for column in columns])
            cursor.execute(
                f"""
                UPDATE home_finance_records
                SET {set_sql}, updated_at = NOW()
                WHERE finance_record_id = %s
                RETURNING *
                """,
                [*[data[column] for column in columns], current["finance_record_id"]],
            )
            row = cursor.fetchone()

        if current.get("order_id") and row["type"] == "Hoàn tiền":
            if not row.get("manual_override"):
                cursor.execute(
                    """
                    UPDATE home_finance_records
                    SET manual_override = TRUE, updated_at = NOW()
                    WHERE finance_record_id = %s
                    RETURNING *
                    """,
                    (row["finance_record_id"],),
                )
                row = cursor.fetchone()
            sync_finance_refund_customer(cursor, row)

        if row.get("inventory_item_id"):
            cursor.execute(
                """
                UPDATE home_inventory_items
                SET name = COALESCE(NULLIF(%s, ''), name),
                    supplier = NULLIF(%s, '-'),
                    cost = %s,
                    last_restocked_at = %s,
                    note = %s,
                    updated_at = NOW()
                WHERE inventory_item_id = %s
                """,
                (
                    row.get("inventory_name"),
                    row["customer"],
                    row["amount"],
                    row["transaction_date"],
                    row.get("note"),
                    row["inventory_item_id"],
                ),
            )

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


@router_home.delete("/finance-records/{finance_record_id}")
def delete_finance_record(
    finance_record_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT finance_record_id, inventory_item_id, order_id
            FROM home_finance_records
            WHERE finance_record_id::text = %s OR transaction_code = %s
            """,
            (finance_record_id, finance_record_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy giao dịch.")

        if row.get("order_id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giao dịch này được đồng bộ từ đơn hàng. Hãy đổi trạng thái hoặc xóa đơn hàng tương ứng.",
            )
        if row.get("inventory_item_id"):
            cursor.execute(
                "DELETE FROM home_inventory_items WHERE inventory_item_id = %s",
                (row["inventory_item_id"],),
            )
        else:
            cursor.execute(
                "DELETE FROM home_finance_records WHERE finance_record_id = %s",
                (row["finance_record_id"],),
            )
        connect.commit()
        return {
            "success": True,
            "deleted_id": str(row["finance_record_id"]),
            "deleted_inventory_id": str(row["inventory_item_id"]) if row.get("inventory_item_id") else None,
        }
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.post("/staff/machines", status_code=status.HTTP_201_CREATED)
def create_machine(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    name = require_text(payload, "name", "Tên thiết bị không được để trống.")
    machine_type = require_text(payload, "machine_type", "Nhóm thiết bị không được để trống.")
    status_value = payload.get("status") or "Sẵn sàng"
    if machine_type not in {"Máy giặt", "Máy sấy", "Máy giặt sấy", "Bàn hấp", "Bàn ủi"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nhóm thiết bị không hợp lệ.")
    if status_value not in {"Sẵn sàng", "Đang chạy", "Bảo trì"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái thiết bị không hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        machine_code = payload.get("machine_code") or make_sequence_code(
            cursor,
            "home_machines",
            "machine_code",
        )
        cursor.execute(
            """
            INSERT INTO home_machines (
                machine_code, name, machine_type, capacity_kg, status, location,
                note, last_maintenance_at, next_maintenance_at, created_by
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                machine_code,
                name,
                machine_type,
                payload.get("capacity_kg"),
                status_value,
                payload.get("location"),
                payload.get("note"),
                payload.get("last_maintenance_at"),
                payload.get("next_maintenance_at"),
                current_user["user_id"],
            ),
        )
        row = cursor.fetchone()
        connect.commit()
        return serialize_row(row)
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/staff/machines/{machine_id}")
def update_machine(
    machine_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed_columns = {
        "machine_code", "name", "machine_type", "capacity_kg", "status",
        "location", "note", "last_maintenance_at", "next_maintenance_at",
    }
    data = filter_payload(payload, allowed_columns)
    if "name" in data and not str(data["name"]).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên thiết bị không được để trống.")
    if "machine_type" in data and data["machine_type"] not in {"Máy giặt", "Máy sấy", "Máy giặt sấy", "Bàn hấp", "Bàn ủi"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nhóm thiết bị không hợp lệ.")
    if "status" in data and data["status"] not in {"Sẵn sàng", "Đang chạy", "Bảo trì"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái thiết bị không hợp lệ.")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload không có cột hợp lệ.")

    columns = list(data.keys())
    set_sql = ", ".join([f"{column} = %s" for column in columns])

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            f"""
            UPDATE home_machines
            SET {set_sql}, updated_at = NOW()
            WHERE machine_id::text = %s OR machine_code = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], machine_id, machine_id],
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
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


@router_home.delete("/staff/machines/{machine_id}")
def delete_machine(
    machine_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        cursor.execute(
            """
            DELETE FROM home_machines
            WHERE machine_id::text = %s OR machine_code = %s
            RETURNING machine_id
            """,
            (machine_id, machine_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy thiết bị.")
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


