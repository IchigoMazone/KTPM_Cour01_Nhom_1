from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect, status
from psycopg2.extras import Json, RealDictCursor

from app.core.security import decode_access_token
from app.database.database import get_connection
from app.dependencies.auth import get_current_user
from app.utils.r2 import upload_file_to_r2

from app.api.home_shared import *


@router_home.post("/support-chat/upload-image")
async def upload_support_chat_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    content_type = str(file.content_type or "")
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tập tin không phải là hình ảnh hợp lệ.",
        )

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tập tin tải lên đang trống.",
            )
        image_url = upload_file_to_r2(contents, file.filename or "support-image.png", content_type)
        return {
            "success": True,
            "image_url": image_url,
            "uploaded_by": serialize(current_user["user_id"]),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tải ảnh hỗ trợ lên R2: {str(exc)}",
        ) from exc

@router_home.get("/support-tickets/full")
def get_support_tickets_full(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        is_customer = current_user.get("role") == "user"
        cursor.execute(
            """
            SELECT
                t.*,
                COALESCE(c.full_name, t.customer_name) AS resolved_customer_name,
                COALESCE(c.phone, t.customer_phone) AS resolved_customer_phone,
                COALESCE(c.image_url, customer_account.image_url, requester_account.image_url, '') AS resolved_customer_image_url,
                c.customer_code,
                COALESCE(o.order_code, t.order_code) AS resolved_order_code,
                COALESCE(a.full_name, t.assigned_name) AS resolved_assigned_name,
                COALESCE(a.image_url, t.assigned_avatar) AS resolved_assigned_avatar,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'message_id', m.message_id,
                            'sender_role', m.sender_role,
                            'sender_name', m.sender_name,
                            'sender_avatar', m.sender_avatar,
                            'content', m.content,
                            'image_url', m.image_url,
                            'file_attachment', m.file_attachment,
                            'reply_to', m.file_attachment->'_chat_meta'->'reply_to',
                            'reaction', m.file_attachment->'_chat_meta'->>'reaction',
                            'revoked', COALESCE((m.file_attachment->'_chat_meta'->>'revoked')::boolean, false),
                            'deleted_for_me', COALESCE((m.file_attachment->'_chat_meta'->'deleted_for') ? %s, false),
                            'created_at', m.created_at
                        )
                        ORDER BY m.created_at
                    ) FILTER (WHERE m.message_id IS NOT NULL),
                    '[]'::json
                ) AS messages
            FROM home_support_tickets t
            LEFT JOIN home_customers c ON c.customer_id = t.customer_id
            LEFT JOIN accounts customer_account ON customer_account.user_id = c.account_id
            LEFT JOIN accounts requester_account ON requester_account.user_id = t.requester_id
            LEFT JOIN home_orders o ON o.order_id = t.order_id
            LEFT JOIN accounts a ON a.user_id = t.assigned_to
            LEFT JOIN home_support_messages m ON m.ticket_id = t.ticket_id
            WHERE (%s = FALSE OR t.requester_id = %s)
              AND NOT (
                  t.subject = 'Trao đổi với admin'
                  AND t.note = 'Bắt đầu cuộc trò chuyện với admin.'
              )
              AND EXISTS (
                  SELECT 1
                  FROM home_support_messages cm
                  WHERE cm.ticket_id = t.ticket_id
                    AND cm.sender_role = 'customer'
                    AND cm.content ILIKE '%%đây là tin nhắn của yêu cầu hỗ trợ%%'
              )
            GROUP BY t.ticket_id, c.full_name, c.phone, c.image_url, customer_account.image_url, requester_account.image_url, c.customer_code, o.order_code, a.full_name, a.image_url
            ORDER BY t.created_at DESC
            """,
            (str(current_user["user_id"]), is_customer, current_user["user_id"]),
        )
        rows = []
        for row in cursor.fetchall():
            serialized = serialize_row(row)
            serialized["customer_name"] = serialized.pop("resolved_customer_name")
            serialized["customer_phone"] = serialized.pop("resolved_customer_phone")
            serialized["customer_image_url"] = serialized.pop("resolved_customer_image_url")
            serialized["order_code"] = serialized.pop("resolved_order_code")
            serialized["assigned_name"] = serialized.pop("resolved_assigned_name")
            serialized["assigned_avatar"] = serialized.pop("resolved_assigned_avatar")
            rows.append(serialized)
        return rows
    finally:
        cursor.close()
        connect.close()


@router_home.get("/support-tickets/orders")
def get_support_ticket_orders(
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if current_user.get("role") == "user":
            cursor.execute(
                """
                SELECT o.order_id, o.order_code, o.customer_code, o.status, o.service_name, o.created_at
                FROM home_orders o
                JOIN home_customers c ON c.customer_id = o.customer_id
                WHERE c.account_id = %s
                ORDER BY o.created_at DESC
                LIMIT 100
                """,
                (current_user["user_id"],),
            )
        else:
            cursor.execute(
                """
                SELECT order_id, order_code, customer_code, status, service_name, created_at
                FROM home_orders
                ORDER BY created_at DESC
                LIMIT 100
                """
            )
        return [serialize_row(row) for row in cursor.fetchall()]
    finally:
        cursor.close()
        connect.close()


@router_home.post("/support-tickets", status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    ticket_type = require_text(payload, "type", "Loại hỗ trợ không được để trống.")
    subject = require_text(payload, "subject", "Tiêu đề hỗ trợ không được để trống.")
    note = str(payload.get("note") or "").strip()
    order_code = require_text(payload, "order_code", "Mã đơn không được để trống.").upper()
    priority = str(payload.get("priority") or "Trung bình").strip()
    if priority not in SUPPORT_PRIORITIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Độ ưu tiên không hợp lệ.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        profile = current_user.get("profile") or {}
        customer_id = None
        customer_name = str(profile.get("full_name") or current_user.get("username") or "Khách hàng").strip()
        customer_phone = str(profile.get("phone") or "").strip() or None
        customer_code = str(payload.get("customer_code") or "").strip().upper()
        if current_user.get("role") != "user" and not customer_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã khách hàng không được để trống.")
        cursor.execute(
            """
            SELECT c.customer_id, c.customer_code, c.full_name, c.phone,
                   COALESCE(c.image_url, a.image_url) AS image_url
            FROM home_customers c
            LEFT JOIN accounts a ON a.user_id = c.account_id
            WHERE (%s <> '' AND customer_code = %s)
               OR (%s = '' AND account_id = %s)
            LIMIT 1
            """,
            (customer_code, customer_code, customer_code, current_user["user_id"]),
        )
        linked_customer = cursor.fetchone()
        if not linked_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không tồn tại khách hàng {customer_code}." if customer_code else "Tài khoản chưa liên kết khách hàng.",
            )
        customer_id = linked_customer["customer_id"]
        customer_name = linked_customer["full_name"]
        customer_phone = linked_customer.get("phone")
        customer_avatar = linked_customer.get("image_url") or profile.get("image_url")
        customer_code = linked_customer["customer_code"]

        order_id = None
        cursor.execute(
            """
            SELECT order_id, customer_id, customer_code, customer_name, customer_phone, wash_date
            FROM home_orders
            WHERE order_code = %s AND customer_id = %s
            """,
            (order_code, customer_id),
        )
        order = cursor.fetchone()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Đơn hàng {order_code} không thuộc khách hàng {customer_code}.",
            )
        order_id = order["order_id"]
        customer_name = order.get("customer_name") or customer_name
        customer_phone = order.get("customer_phone") or customer_phone

        assigned_to = None if current_user.get("role") == "user" else current_user["user_id"]
        assigned_name = None if current_user.get("role") == "user" else str(profile.get("full_name") or current_user.get("username") or "Nhân viên")
        assigned_avatar = None if current_user.get("role") == "user" else profile.get("image_url")
        ticket_code = make_support_ticket_code(cursor)
        cursor.execute(
            """
            INSERT INTO home_support_tickets (
                ticket_code, type, subject, status, priority, customer_id, customer_name,
                customer_phone, order_id, order_code, assigned_to, assigned_name,
                assigned_avatar, wash_date, note, requester_id, created_by
            )
            VALUES (
                %s, %s, %s, 'Chưa xử lý', %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
            RETURNING *
            """,
            (
                ticket_code, ticket_type, subject, priority, customer_id, customer_name,
                customer_phone, order_id, order_code, assigned_to, assigned_name,
                assigned_avatar, order.get("wash_date") or payload.get("wash_date") or None, note,
                current_user["user_id"], current_user["user_id"],
            ),
        )
        ticket = cursor.fetchone()
        initial_content = note
        if current_user.get("role") == "user":
            issue_text = note or subject or ticket_type
            initial_content = (
                f"Tôi là {customer_name} mã {customer_code}, đây là tin nhắn của yêu cầu hỗ trợ "
                f"{ticket_code} về đơn hàng {order_code} tôi phản ánh về việc "
                f"{ticket_type.lower()} của tôi: {issue_text}"
            )
        cursor.execute(
            """
            INSERT INTO home_support_messages (
                ticket_id, sender_id, sender_role, sender_name, sender_avatar, content
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                ticket["ticket_id"], current_user["user_id"],
                "customer" if current_user.get("role") == "user" else "staff",
                customer_name if current_user.get("role") == "user" else assigned_name,
                customer_avatar if current_user.get("role") == "user" else profile.get("image_url"),
                initial_content,
            ),
        )
        initial_message = cursor.fetchone()
        connect.commit()
        await support_chat_manager.broadcast({
            "type": "support_message_created",
            "ticket_id": serialize(ticket["ticket_id"]),
            "ticket_code": ticket.get("ticket_code"),
            "message": serialize_support_message(initial_message),
        })
        return serialize_row(ticket)
    except HTTPException:
        connect.rollback()
        raise
    except Exception as exc:
        connect.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        cursor.close()
        connect.close()


@router_home.put("/support-tickets/{ticket_id}")
def update_support_ticket(
    ticket_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    allowed = {
        "type", "subject", "status", "priority", "customer_code", "customer_name", "customer_phone",
        "order_code", "assigned_name", "assigned_avatar", "wash_date", "note",
    }
    data = filter_payload(payload, allowed)
    if "status" in data and data["status"] not in SUPPORT_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Trạng thái hỗ trợ không hợp lệ.")
    if "priority" in data and data["priority"] not in SUPPORT_PRIORITIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Độ ưu tiên không hợp lệ.")
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không có dữ liệu cần cập nhật.")

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT * FROM home_support_tickets
            WHERE ticket_id::text = %s OR ticket_code = %s
            """,
            (ticket_id, ticket_id),
        )
        current = cursor.fetchone()
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ticket hỗ trợ.")
        if current_user.get("role") == "user":
            if current.get("requester_id") != current_user["user_id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền sửa ticket này.")
            if current.get("status") == "Đã giải quyết":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket đã giải quyết, không thể sửa.")
            data = {key: value for key, value in data.items() if key in {"type", "subject", "priority", "order_code", "wash_date", "note"}}
            if not data:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không có dữ liệu hợp lệ để cập nhật.")
            if "order_code" in data:
                order_code = str(data.get("order_code") or "").strip().upper()
                cursor.execute(
                    """
                    SELECT order_id, wash_date
                    FROM home_orders
                    WHERE order_code = %s AND customer_id = %s
                    """,
                    (order_code, current.get("customer_id")),
                )
                order = cursor.fetchone()
                if not order:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Đơn hàng {order_code} không thuộc khách hàng của ticket này.",
                    )
                data.update({
                    "order_id": order["order_id"],
                    "order_code": order_code,
                    "wash_date": data.get("wash_date") or order.get("wash_date"),
                })
        elif "customer_code" in data or "order_code" in data:
            customer_code = str(data.pop("customer_code", "") or "").strip().upper()
            order_code = str(data.get("order_code", current.get("order_code")) or "").strip().upper()
            if not customer_code:
                cursor.execute(
                    "SELECT customer_code FROM home_customers WHERE customer_id = %s",
                    (current.get("customer_id"),),
                )
                customer = cursor.fetchone()
                customer_code = customer["customer_code"] if customer else ""
            cursor.execute(
                """
                SELECT customer_id, full_name, phone
                FROM home_customers
                WHERE customer_code = %s
                """,
                (customer_code,),
            )
            customer = cursor.fetchone()
            if not customer:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Không tồn tại khách hàng {customer_code}.")
            cursor.execute(
                """
                SELECT order_id, wash_date
                FROM home_orders
                WHERE order_code = %s AND customer_id = %s
                """,
                (order_code, customer["customer_id"]),
            )
            order = cursor.fetchone()
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Đơn hàng {order_code} không thuộc khách hàng {customer_code}.",
                )
            data.update({
                "customer_id": customer["customer_id"],
                "customer_name": customer["full_name"],
                "customer_phone": customer.get("phone"),
                "order_id": order["order_id"],
                "order_code": order_code,
                "wash_date": order.get("wash_date"),
            })

        columns = list(data)
        cursor.execute(
            f"""
            UPDATE home_support_tickets
            SET {", ".join(f"{column} = %s" for column in columns)}, updated_at = NOW()
            WHERE ticket_id = %s
            RETURNING *
            """,
            [*[data[column] for column in columns], current["ticket_id"]],
        )
        row = cursor.fetchone()
        connect.commit()
        return serialize_row(row)
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


def build_support_message_attachment(payload: dict):
    attachment = payload.get("file_attachment")
    if isinstance(attachment, dict):
        result = dict(attachment)
    else:
        result = {}

    meta = dict(result.get("_chat_meta") or {}) if isinstance(result.get("_chat_meta"), dict) else {}
    reply_to = payload.get("reply_to")
    if isinstance(reply_to, dict) and reply_to.get("id"):
        meta["reply_to"] = {
            "id": str(reply_to.get("id") or ""),
            "sender": str(reply_to.get("sender") or ""),
            "content": str(reply_to.get("content") or "")[:500],
        }
    if meta:
        result["_chat_meta"] = meta
    return result or None


def serialize_support_message(row):
    serialized = serialize_row(row)
    attachment = serialized.get("file_attachment")
    meta = attachment.get("_chat_meta") if isinstance(attachment, dict) else {}
    if isinstance(meta, dict):
        serialized["reply_to"] = meta.get("reply_to")
        serialized["reaction"] = meta.get("reaction")
        serialized["revoked"] = bool(meta.get("revoked"))
        serialized["deleted_for"] = meta.get("deleted_for") if isinstance(meta.get("deleted_for"), list) else []
    if isinstance(attachment, dict) and "_chat_meta" in attachment:
        clean_attachment = {key: value for key, value in attachment.items() if key != "_chat_meta"}
        serialized["file_attachment"] = clean_attachment or None
    if serialized.get("revoked"):
        serialized["content"] = "Tin nhắn đã được thu hồi"
        serialized["image_url"] = None
        serialized["reply_to"] = None
        serialized["reaction"] = None
    return serialized


def insert_support_message(cursor, ticket_id: str, payload: dict, current_user: dict):
    content = str(payload.get("content") or "").strip()
    if not content and not payload.get("image_url") and not payload.get("file_attachment"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tin nhắn không được để trống.")

    cursor.execute(
        """
        SELECT * FROM home_support_tickets
        WHERE ticket_id::text = %s OR ticket_code = %s
        """,
        (ticket_id, ticket_id),
    )
    ticket = cursor.fetchone()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ticket hỗ trợ.")
    is_customer = current_user.get("role") == "user"
    if is_customer and str(ticket.get("requester_id")) != str(current_user["user_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền nhắn vào ticket này.")
    if ticket["status"] == "Đã giải quyết" and not is_customer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket đã giải quyết, không thể gửi thêm tin nhắn.")

    profile = current_user.get("profile") or {}
    sender_name = str(profile.get("full_name") or current_user.get("username") or "Người dùng")
    sender_avatar = profile.get("image_url")
    if is_customer:
        cursor.execute(
            """
            SELECT c.full_name, COALESCE(c.image_url, a.image_url) AS image_url
            FROM home_customers c
            LEFT JOIN accounts a ON a.user_id = c.account_id
            WHERE c.customer_id = %s
            LIMIT 1
            """,
            (ticket.get("customer_id"),),
        )
        customer = cursor.fetchone()
        if customer:
            sender_name = customer.get("full_name") or sender_name
            sender_avatar = customer.get("image_url") or sender_avatar
    attachment = build_support_message_attachment(payload)
    cursor.execute(
        """
        INSERT INTO home_support_messages (
            ticket_id, sender_id, sender_role, sender_name, sender_avatar,
            content, image_url, file_attachment
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (
            ticket["ticket_id"], current_user["user_id"],
            "customer" if is_customer else "staff", sender_name,
            sender_avatar, content, payload.get("image_url"),
            Json(attachment) if attachment else None,
        ),
    )
    message = cursor.fetchone()
    cursor.execute(
        """
        UPDATE home_support_tickets
        SET status = CASE
                WHEN %s = TRUE THEN 'Chưa xử lý'
                WHEN status = 'Chưa xử lý' THEN 'Đang xử lý'
                ELSE status
            END,
            assigned_to = CASE WHEN %s = FALSE THEN %s ELSE assigned_to END,
            assigned_name = CASE WHEN %s = FALSE THEN %s ELSE assigned_name END,
            assigned_avatar = CASE WHEN %s = FALSE THEN %s ELSE assigned_avatar END,
            updated_at = NOW()
        WHERE ticket_id = %s
        """,
        (
            is_customer, is_customer, current_user["user_id"],
            is_customer, sender_name, is_customer, profile.get("image_url"),
            ticket["ticket_id"],
        ),
    )
    return ticket, message


def update_support_message_metadata(cursor, message_id: str, payload: dict, current_user: dict):
    cursor.execute(
        """
        SELECT m.*, t.requester_id, t.ticket_code
        FROM home_support_messages m
        JOIN home_support_tickets t ON t.ticket_id = m.ticket_id
        WHERE m.message_id::text = %s
        """,
        (message_id,),
    )
    message = cursor.fetchone()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin nhắn.")

    is_customer = current_user.get("role") == "user"
    if is_customer and str(message.get("requester_id")) != str(current_user["user_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật tin nhắn này.")

    attachment = message.get("file_attachment") if isinstance(message.get("file_attachment"), dict) else {}
    attachment = dict(attachment or {})
    meta = dict(attachment.get("_chat_meta") or {}) if isinstance(attachment.get("_chat_meta"), dict) else {}
    action = str(payload.get("action") or "").strip()

    if action == "react":
        reaction = str(payload.get("reaction") or "").strip()
        meta["reaction"] = None if meta.get("reaction") == reaction else reaction[:20]
        if not meta["reaction"]:
            meta.pop("reaction", None)
    elif action == "revoke":
        if str(message.get("sender_id")) != str(current_user["user_id"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn chỉ có thể thu hồi tin nhắn của mình.")
        meta["revoked"] = True
        meta.pop("reply_to", None)
        meta.pop("reaction", None)
    elif action == "delete":
        deleted_for = meta.get("deleted_for")
        if not isinstance(deleted_for, list):
            deleted_for = []
        current_user_id = str(current_user["user_id"])
        if current_user_id not in deleted_for:
            deleted_for.append(current_user_id)
        meta["deleted_for"] = deleted_for
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thao tác tin nhắn không hợp lệ.")

    if meta:
        attachment["_chat_meta"] = meta
    else:
        attachment.pop("_chat_meta", None)

    cursor.execute(
        """
        UPDATE home_support_messages
        SET file_attachment = %s
        WHERE message_id = %s
        RETURNING *
        """,
        (Json(attachment) if attachment else None, message["message_id"]),
    )
    updated = cursor.fetchone()
    return message, updated


@router_home.post("/support-tickets/{ticket_id}/messages", status_code=status.HTTP_201_CREATED)
async def create_support_message(
    ticket_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ticket, message = insert_support_message(cursor, ticket_id, payload, current_user)
        connect.commit()
        serialized_message = serialize_support_message(message)
        await support_chat_manager.broadcast({
            "type": "support_message_created",
            "ticket_id": serialize(ticket["ticket_id"]),
            "ticket_code": ticket.get("ticket_code"),
                    "message": serialized_message,
                })
        return serialized_message
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.put("/support-messages/{message_id}")
async def update_support_message(
    message_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        source_message, message = update_support_message_metadata(cursor, message_id, payload, current_user)
        connect.commit()
        serialized_message = serialize_support_message(message)
        await support_chat_manager.broadcast({
            "type": "support_message_updated",
            "ticket_id": serialize(source_message["ticket_id"]),
            "ticket_code": source_message.get("ticket_code"),
            "message": serialized_message,
        })
        return serialized_message
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()


@router_home.websocket("/ws/support-chat")
async def support_chat_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token") or ""
    current_user = get_ws_user(token)
    if not current_user:
        await websocket.close(code=1008)
        return

    await support_chat_manager.connect(websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            if payload.get("type") not in {"send_support_message", "update_support_message", "support_typing"}:
                continue
            ticket_id = str(payload.get("ticket_id") or "").strip()
            message_id = str(payload.get("message_id") or "").strip()
            if payload.get("type") == "send_support_message" and not ticket_id:
                await websocket.send_json({"type": "support_error", "message": "Thiếu ticket_id."})
                continue
            if payload.get("type") == "update_support_message" and not message_id:
                await websocket.send_json({"type": "support_error", "message": "Thiếu message_id."})
                continue
            if payload.get("type") == "support_typing":
                if not ticket_id:
                    await websocket.send_json({"type": "support_error", "message": "Thiếu ticket_id."})
                    continue
                await support_chat_manager.broadcast({
                    "type": "support_typing",
                    "ticket_id": ticket_id,
                    "is_typing": bool(payload.get("is_typing")),
                    "sender_role": "customer" if current_user.get("role") == "user" else "staff",
                    "sender_id": serialize(current_user["user_id"]),
                })
                continue

            connect = get_connection()
            cursor = connect.cursor(cursor_factory=RealDictCursor)
            try:
                if payload.get("type") == "send_support_message":
                    ticket, message = insert_support_message(cursor, ticket_id, payload, current_user)
                    event_type = "support_message_created"
                    event_ticket_id = serialize(ticket["ticket_id"])
                    ticket_code = ticket.get("ticket_code")
                else:
                    source_message, message = update_support_message_metadata(cursor, message_id, payload, current_user)
                    event_type = "support_message_updated"
                    event_ticket_id = serialize(source_message["ticket_id"])
                    ticket_code = source_message.get("ticket_code")
                connect.commit()
                await support_chat_manager.broadcast({
                    "type": event_type,
                    "ticket_id": event_ticket_id,
                    "ticket_code": ticket_code,
                    "message": serialize_support_message(message),
                })
            except HTTPException as exc:
                connect.rollback()
                await websocket.send_json({"type": "support_error", "message": exc.detail})
            except Exception as exc:
                connect.rollback()
                await websocket.send_json({"type": "support_error", "message": str(exc)})
            finally:
                cursor.close()
                connect.close()
    except WebSocketDisconnect:
        support_chat_manager.disconnect(websocket)
    except Exception:
        support_chat_manager.disconnect(websocket)


@router_home.delete("/support-tickets/{ticket_id}")
def delete_support_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor()
    try:
        is_customer = current_user.get("role") == "user"
        cursor.execute(
            """
            SELECT ticket_id, requester_id, status
            FROM home_support_tickets
            WHERE (ticket_id::text = %s OR ticket_code = %s)
            """,
            (ticket_id, ticket_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy ticket hỗ trợ.")
        if is_customer and row[1] != current_user["user_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xóa ticket này.")
        if is_customer and row[2] != "Đã giải quyết":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ được xóa ticket đã giải quyết.")
        cursor.execute(
            """
            DELETE FROM home_support_tickets
            WHERE ticket_id = %s
            RETURNING ticket_id
            """,
            (row[0],),
        )
        deleted = cursor.fetchone()
        connect.commit()
        return {"success": True, "deleted_id": str(deleted[0])}
    except HTTPException:
        connect.rollback()
        raise
    finally:
        cursor.close()
        connect.close()
