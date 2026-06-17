from datetime import date, datetime, time, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from psycopg2.extras import Json, RealDictCursor

from app.core.security import decode_access_token
from app.database.database import get_connection
from app.dependencies.auth import get_current_user


router_home = APIRouter()


class SupportChatConnectionManager:
    def __init__(self):
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, payload: dict):
        stale: list[WebSocket] = []
        for websocket in list(self.active_connections):
            try:
                await websocket.send_json(payload)
            except Exception:
                stale.append(websocket)
        for websocket in stale:
            self.disconnect(websocket)


support_chat_manager = SupportChatConnectionManager()


HOME_TABLES = {
    "customers": {
        "table": "home_customers",
        "search": ["customer_code", "full_name", "phone", "email"],
    },
    "services": {
        "table": "home_services",
        "search": ["service_code", "name", "category", "description"],
    },
    "orders": {
        "table": "home_orders",
        "search": ["order_code", "customer_code", "customer_name", "customer_phone", "status"],
    },
    "daily-reports": {
        "table": "home_daily_reports",
        "search": [],
    },
    "promotions": {
        "table": "home_promotions",
        "search": ["code", "name", "applied_service", "note"],
    },
    "finance-records": {
        "table": "home_finance_records",
        "search": ["transaction_code", "customer", "inventory_name", "order_code", "owner", "note"],
    },
}


SERVICE_UNITS = {"kg", "item", "combo"}
SERVICE_STATUSES = {"active", "inactive"}
CUSTOMER_CREDIT_STATUSES = {"Sẵn sàng giao", "Đang giao", "Hoàn thành"}
LOYALTY_VND_PER_POINT = Decimal("1000")
FINANCE_STATUSES = {"Đã thu", "Chờ thu", "Đã chi", "Quá hạn"}
FINANCE_FIXED_STATUSES = {
    "Doanh thu": "Đã thu",
    "Công nợ": "Chờ thu",
    "Chi phí": "Đã chi",
    "Hoàn tiền": "Đã chi",
}
FINANCE_CUSTOMER_TYPES = {"Doanh thu", "Công nợ", "Hoàn tiền"}
SUPPORT_STATUSES = {"Chưa xử lý", "Đang xử lý", "Đã giải quyết"}
SUPPORT_PRIORITIES = {"Cao", "Trung bình", "Thấp"}
INVENTORY_TYPES = {"Vật tư tiêu hao", "Vật tư tái sử dụng"}
BOOKING_STATUSES = {"Chờ xử lý", "Đã được duyệt", "Không được duyệt", "Quá hạn"}
PROMOTION_CLAIM_STATUSES = {"Đã nhận", "Đã sử dụng"}


def serialize(value):
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, UUID):
        return str(value)
    return value


def serialize_row(row):
    return {key: serialize(value) for key, value in dict(row).items()}


def parse_uuid_or_none(value):
    if value in (None, ""):
        return None
    try:
        return UUID(str(value).strip())
    except (TypeError, ValueError, AttributeError):
        return None


def get_ws_user(token: str):
    payload = decode_access_token(token)
    if not payload or not payload.get("user_id"):
        return None
    connect = get_connection()
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT user_id, username, role, is_active, full_name, email, phone, address, image_url
            FROM accounts
            WHERE user_id = %s
            LIMIT 1
            """,
            (payload["user_id"],),
        )
        account = cursor.fetchone()
        if not account or not account.get("is_active"):
            return None
        return {
            "user_id": account["user_id"],
            "username": account["username"],
            "role": account["role"],
            "is_active": account["is_active"],
            "profile": {
                "full_name": account.get("full_name"),
                "email": account.get("email"),
                "phone": account.get("phone"),
                "address": account.get("address"),
                "image_url": account.get("image_url"),
            },
        }
    finally:
        cursor.close()
        connect.close()


def resolve_customer_identifier(value: str | None):
    normalized = str(value or "").strip()
    return parse_uuid_or_none(normalized), (normalized.upper() or None)


def filter_payload(payload: dict, allowed_columns: set[str]):
    return {key: value for key, value in payload.items() if key in allowed_columns}


def make_sequence_code(cursor, table_name: str, column_name: str):
    cursor.execute(
        f"""
        SELECT COALESCE(MAX({column_name}::int), 0) + 1 AS next_number
        FROM {table_name}
        WHERE {column_name} ~ '^[0-9]{{4}}$'
        """
    )
    row = cursor.fetchone()
    next_number = row["next_number"] if isinstance(row, dict) else row[0]
    if next_number > 9999:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã 4 số đã vượt giới hạn 9999.",
        )
    return str(next_number).zfill(4)


def ensure_booking_requests_table(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS home_booking_requests (
            booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_code VARCHAR(20) NOT NULL UNIQUE,
            customer_id UUID REFERENCES home_customers(customer_id) ON DELETE SET NULL,
            customer_code VARCHAR(20),
            customer_name VARCHAR(160) NOT NULL,
            customer_phone VARCHAR(30),
            pickup_address TEXT,
            delivery_address TEXT,
            service_id UUID REFERENCES home_services(service_id) ON DELETE SET NULL,
            service_code VARCHAR(30),
            service_name VARCHAR(160),
            quantity VARCHAR(80),
            total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
            status VARCHAR(50) NOT NULL DEFAULT 'Chờ xử lý',
            appointment_time VARCHAR(20),
            wash_date DATE,
            due_at TIMESTAMPTZ,
            payment_method VARCHAR(50),
            discount_code VARCHAR(80),
            note TEXT,
            extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
            requested_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
            reviewed_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
            reviewed_at TIMESTAMPTZ,
            order_id UUID REFERENCES home_orders(order_id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_booking_requests_status ON home_booking_requests(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_booking_requests_requested_by ON home_booking_requests(requested_by)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_booking_requests_created_at ON home_booking_requests(created_at DESC)")


def get_booking_display_status(status_value: str | None, wash_date_value, due_at_value):
    status_text = str(status_value or "Chờ xử lý").strip() or "Chờ xử lý"
    if status_text == "Chờ xử lý":
        compare_date = None
        if isinstance(due_at_value, datetime):
            compare_date = due_at_value.date()
        elif isinstance(due_at_value, str):
            try:
                compare_date = datetime.fromisoformat(due_at_value.replace("Z", "+00:00")).date()
            except ValueError:
                compare_date = None
        elif isinstance(wash_date_value, date):
            compare_date = wash_date_value
        elif isinstance(wash_date_value, str):
            try:
                compare_date = date.fromisoformat(wash_date_value)
            except ValueError:
                compare_date = None
        if compare_date and compare_date < date.today():
            return "Quá hạn"
    return status_text


def serialize_booking_request_row(row):
    payload = serialize_row(row)
    payload["status"] = get_booking_display_status(
        payload.get("status"),
        payload.get("wash_date"),
        payload.get("due_at"),
    )
    return payload


def make_booking_code(cursor):
    cursor.execute(
        """
        SELECT COALESCE(MAX(NULLIF(regexp_replace(booking_code, '\\D', '', 'g'), '')::int), 0) + 1
        AS next_number
        FROM home_booking_requests
        """
    )
    return f"DL-{cursor.fetchone()['next_number']:04d}"


def make_finance_transaction_code(cursor):
    cursor.execute(
        """
        SELECT COALESCE(MAX(NULLIF(regexp_replace(transaction_code, '\\D', '', 'g'), '')::int), 0) + 1
        AS next_number
        FROM home_finance_records
        WHERE transaction_code ~ '^TC-[0-9]{4}$'
        """
    )
    row = cursor.fetchone()
    next_number = row["next_number"] if isinstance(row, dict) else row[0]
    if next_number > 9999:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giao dịch đã vượt giới hạn TC-9999.",
        )
    return f"TC-{next_number:04d}"


def make_support_ticket_code(cursor):
    cursor.execute(
        """
        SELECT COALESCE(MAX(NULLIF(regexp_replace(ticket_code, '\\D', '', 'g'), '')::int), 0) + 1
        AS next_number
        FROM home_support_tickets
        WHERE ticket_code ~ '^HT-[0-9]{4}$'
        """
    )
    row = cursor.fetchone()
    next_number = row["next_number"] if isinstance(row, dict) else row[0]
    if next_number > 9999:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã hỗ trợ đã vượt giới hạn HT-9999.",
        )
    return f"HT-{next_number:04d}"


def require_text(payload: dict, field: str, message: str):
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return value.strip()


def inventory_status(initial_quantity, current_quantity):
    initial = Decimal(str(initial_quantity or 0))
    current = Decimal(str(current_quantity or 0))
    if current <= 0:
        return "Cần mua"
    if initial > 0 and current <= initial * Decimal("0.2"):
        return "Sắp hết"
    return "Ổn định"


def find_customer_account_id(
    cursor,
    email: str | None,
    phone: str | None,
    current_customer_id: str | None = None,
):
    normalized_email = (email or "").strip().lower()
    normalized_phone = (phone or "").strip()
    current_customer_uuid = parse_uuid_or_none(current_customer_id)
    if not normalized_email and not normalized_phone:
        return None
    cursor.execute(
        """
        SELECT user_id
        FROM accounts
        WHERE role = 'user'
          AND NOT EXISTS (
            SELECT 1
            FROM home_customers linked
            WHERE linked.account_id = accounts.user_id
              AND (%s IS NULL OR linked.customer_id <> %s)
          )
          AND (
            (%s <> '' AND LOWER(COALESCE(email, '')) = %s)
            OR (%s <> '' AND COALESCE(phone, '') = %s)
          )
        ORDER BY
          CASE WHEN %s <> '' AND LOWER(COALESCE(email, '')) = %s THEN 0 ELSE 1 END,
          created_at
        LIMIT 1
        """,
        (
            current_customer_uuid,
            current_customer_uuid,
            normalized_email,
            normalized_email,
            normalized_phone,
            normalized_phone,
            normalized_email,
            normalized_email,
        ),
    )
    row = cursor.fetchone()
    return row["user_id"] if row else None


def select_customer(cursor, customer_id: str):
    customer_uuid, customer_code = resolve_customer_identifier(customer_id)
    cursor.execute(
        """
        SELECT c.*, a.username AS account_username, a.is_active AS account_active
        FROM home_customers c
        LEFT JOIN accounts a ON a.user_id = c.account_id
        WHERE (%s IS NOT NULL AND c.customer_id = %s)
           OR (%s IS NOT NULL AND c.customer_code = %s)
        """,
        (customer_uuid, customer_uuid, customer_code, customer_code),
    )
    return cursor.fetchone()


def sync_account_avatar_from_customer(cursor, account_id: str | None, image_url: str | None):
    if not account_id:
        return
    cursor.execute(
        """
        UPDATE accounts
        SET image_url = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = %s
        """,
        (image_url, account_id),
    )


def make_next_customer_code(cursor):
    cursor.execute(
        """
        SELECT COALESCE(MAX(NULLIF(regexp_replace(customer_code, '\\D', '', 'g'), '')::int), 0) + 1
        AS next_number
        FROM home_customers
        WHERE customer_code LIKE 'KH-%'
        """
    )
    return f"KH-{cursor.fetchone()['next_number']:04d}"


def get_current_account_order_customer(cursor, current_user: dict):
    profile = current_user.get("profile") or {}
    full_name = str(profile.get("full_name") or current_user.get("username") or "Tài khoản").strip()
    phone = str(profile.get("phone") or "").strip()
    address = str(profile.get("address") or "").strip()

    if current_user.get("role") == "admin":
        return {
            "customer_id": None,
            "customer_code": "QL-0001",
            "full_name": full_name,
            "phone": phone,
            "address": address,
        }

    cursor.execute(
        """
        SELECT customer_id, customer_code
        FROM home_customers
        WHERE account_id = %s
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (current_user["user_id"],),
    )
    customer = cursor.fetchone()
    if customer:
        return select_customer(cursor, str(customer["customer_id"]))

    cursor.execute(
        """
        INSERT INTO home_customers (
            customer_code, full_name, phone, email, address, image_url, account_id, created_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING customer_id, customer_code, full_name, phone, address
        """,
        (
            make_next_customer_code(cursor),
            full_name,
            phone or "Chưa cập nhật",
            profile.get("email") or None,
            address or None,
            profile.get("image_url") or None,
            current_user["user_id"],
            current_user["user_id"],
        ),
    )
    created_customer = cursor.fetchone()
    return select_customer(cursor, str(created_customer["customer_id"]))


def resolve_order_customer(cursor, customer_id: str | None, customer_code: str | None, current_user: dict | None = None):
    if not customer_id and not customer_code:
        if current_user and current_user.get("role") != "admin":
            return get_current_account_order_customer(cursor, current_user)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn hàng bắt buộc phải chọn mã khách hàng.",
        )
    customer_uuid = parse_uuid_or_none(customer_id)
    normalized_code = str(customer_code or "").strip().upper() or None
    if current_user and normalized_code == "QL-0001" and current_user.get("role") == "admin":
        return get_current_account_order_customer(cursor, current_user)
    cursor.execute(
        """
        SELECT customer_id, customer_code, full_name, phone, address
        FROM home_customers
        WHERE (%s IS NOT NULL AND customer_id = %s)
           OR (%s IS NOT NULL AND customer_code = %s)
        LIMIT 1
        """,
        (customer_uuid, customer_uuid, normalized_code, normalized_code),
    )
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã khách hàng không hợp lệ.")
    return row


def resolve_order_service(cursor, service_id: str | None, service_code: str | None):
    if not service_id and not service_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Đơn hàng bắt buộc phải chọn dịch vụ.",
        )
    service_uuid = parse_uuid_or_none(service_id)
    normalized_code = str(service_code or "").strip().upper() or None
    cursor.execute(
        """
        SELECT service_id, service_code, name, unit, price
        FROM home_services
        WHERE status = 'active'
          AND (
            (%s IS NOT NULL AND service_id = %s)
            OR (%s IS NOT NULL AND service_code = %s)
          )
        LIMIT 1
        """,
        (service_uuid, service_uuid, normalized_code, normalized_code),
    )
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dịch vụ không hợp lệ hoặc đã tạm ngừng.")
    return row


def validate_service_inventory_items(cursor, inventory_items) -> list[str]:
    values = list(dict.fromkeys(
        str(value).strip()
        for value in (inventory_items or [])
        if str(value).strip()
    ))
    if not values:
        return []
    if "Tất cả vật tư" in values:
        return ["Tất cả vật tư"]

    codes = [value[3:] if value.upper().startswith("VT-") else value for value in values]
    cursor.execute(
        """
        SELECT item_code
        FROM home_inventory_items
        WHERE item_code = ANY(%s)
          AND status <> 'Cần mua'
          AND quantity > 0
        """,
        (codes,),
    )
    valid_codes = {str(row["item_code"]) for row in cursor.fetchall()}
    invalid_codes = [f"VT-{code}" for code in codes if code not in valid_codes]
    if invalid_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vật tư không tồn tại, đã hết hoặc đang cần mua: {', '.join(invalid_codes)}.",
        )
    return [f"VT-{code}" for code in codes]


def validate_promotion_services(cursor, applied_service) -> str:
    value = str(applied_service or "Tất cả dịch vụ").strip()
    if not value or value == "Tất cả dịch vụ":
        return "Tất cả dịch vụ"

    values = list(dict.fromkeys(part.strip() for part in value.split(",") if part.strip()))
    codes = [item[3:] if item.upper().startswith("DV-") else item for item in values]
    cursor.execute(
        """
        SELECT service_code
        FROM home_services
        WHERE service_code = ANY(%s) AND status = 'active'
        """,
        (codes,),
    )
    valid_codes = {str(row["service_code"]) for row in cursor.fetchall()}
    invalid_codes = [f"DV-{code}" for code in codes if code not in valid_codes]
    if invalid_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dịch vụ không tồn tại hoặc đã tạm ngừng: {', '.join(invalid_codes)}.",
        )
    return ", ".join(f"DV-{code}" for code in codes)


def resolve_order_machine(cursor, machine_code, allowed_types: list[str], label: str):
    if not machine_code:
        return None
    code = str(machine_code).strip()
    raw_code = code[3:] if code.upper().startswith("TB-") else code
    cursor.execute(
        """
        SELECT machine_code
        FROM home_machines
        WHERE machine_code = %s
          AND status <> 'Bảo trì'
          AND machine_type = ANY(%s)
        LIMIT 1
        """,
        (raw_code, allowed_types),
    )
    row = cursor.fetchone()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label} không hợp lệ, sai loại hoặc đang bảo trì.",
        )
    return row["machine_code"]


def normalize_promotion_code(value: str | None):
    return str(value or "").strip().upper() or None


def normalize_service_code(value: str | None):
    return str(value or "").strip().split(" · ")[0].replace("DV-", "").upper()


def coerce_date_value(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value).strip()[:10])
    except ValueError:
        return None


def ensure_promotion_claims_table(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS home_promotion_claims (
            claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            promotion_id UUID NOT NULL REFERENCES home_promotions(promotion_id) ON DELETE CASCADE,
            promotion_code VARCHAR(80) NOT NULL,
            user_id UUID NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
            customer_id UUID REFERENCES home_customers(customer_id) ON DELETE SET NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'Đã nhận'
                CONSTRAINT home_promotion_claims_status_valid CHECK (status IN ('Đã nhận', 'Đã sử dụng')),
            claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            used_at TIMESTAMPTZ,
            booking_id UUID,
            order_id UUID,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, promotion_id)
        )
        """
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_promotion_claims_user_id ON home_promotion_claims(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_promotion_claims_promotion_id ON home_promotion_claims(promotion_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_home_promotion_claims_status ON home_promotion_claims(status)")


def lock_promotion_by_code(cursor, code: str | None):
    normalized_code = normalize_promotion_code(code)
    if not normalized_code:
        return None
    cursor.execute(
        """
        SELECT *
        FROM home_promotions
        WHERE UPPER(code) = %s
        FOR UPDATE
        """,
        (normalized_code,),
    )
    return cursor.fetchone()


def lock_promotion_claim(cursor, user_id, promotion_id):
    ensure_promotion_claims_table(cursor)
    cursor.execute(
        """
        SELECT *
        FROM home_promotion_claims
        WHERE user_id = %s AND promotion_id = %s
        FOR UPDATE
        """,
        (user_id, promotion_id),
    )
    return cursor.fetchone()


def lock_promotion_claim_by_id(cursor, claim_id):
    claim_uuid = parse_uuid_or_none(claim_id)
    if not claim_uuid:
        return None
    ensure_promotion_claims_table(cursor)
    cursor.execute(
        """
        SELECT *
        FROM home_promotion_claims
        WHERE claim_id = %s
        FOR UPDATE
        """,
        (claim_uuid,),
    )
    return cursor.fetchone()


def promotion_is_active(promotion_row: dict, target_day: date | None = None):
    day = target_day or date.today()
    start_day = coerce_date_value(promotion_row.get("start_date"))
    end_day = coerce_date_value(promotion_row.get("end_date"))
    if start_day and day < start_day:
        return False
    if end_day and day > end_day:
        return False
    return True


def promotion_applies_to_service(promotion_row: dict, service_row: dict | None):
    if not service_row:
        return True
    applied_services = [
        str(value).strip()
        for value in str(promotion_row.get("applied_service") or "").split(",")
        if str(value).strip()
    ]
    if not applied_services:
        return False
    if any(value == "Tất cả dịch vụ" for value in applied_services):
        return True
    service_code = normalize_service_code(service_row.get("service_code"))
    service_name = str(service_row.get("name") or "").strip()
    for value in applied_services:
        if normalize_service_code(value) == service_code:
            return True
        if value.split(" · ")[-1].strip() == service_name:
            return True
    return False


def serialize_promotion_claim_row(row):
    payload = serialize_row(row)
    payload["claim_status"] = payload.pop("status", None)
    return payload


def claim_promotion_for_user(cursor, current_user: dict, code: str | None):
    promotion = lock_promotion_by_code(cursor, code)
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy mã giảm giá.")
    if not promotion_is_active(promotion):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá đã hết hạn hoặc chưa bắt đầu.")
    usage_limit = promotion.get("usage_limit")
    claimed_count = int(promotion.get("claimed") or 0)
    if usage_limit is not None and claimed_count >= int(usage_limit):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá đã hết lượt phát.")

    current_claim = lock_promotion_claim(cursor, current_user["user_id"], promotion["promotion_id"])
    if current_claim:
        if current_claim.get("status") == "Đã sử dụng":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản này đã dùng mã giảm giá này rồi.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tài khoản này đã nhận mã giảm giá này rồi.")

    customer = get_current_account_order_customer(cursor, current_user)
    cursor.execute(
        """
        INSERT INTO home_promotion_claims (
            promotion_id, promotion_code, user_id, customer_id, status
        )
        VALUES (%s, %s, %s, %s, 'Đã nhận')
        RETURNING *
        """,
        (
            promotion["promotion_id"],
            promotion["code"],
            current_user["user_id"],
            customer.get("customer_id"),
        ),
    )
    claim_row = cursor.fetchone()
    cursor.execute(
        """
        UPDATE home_promotions
        SET claimed = claimed + 1,
            updated_at = NOW()
        WHERE promotion_id = %s
        RETURNING *
        """,
        (promotion["promotion_id"],),
    )
    updated_promotion = cursor.fetchone()
    return {
        **serialize_promotion_claim_row({**updated_promotion, **claim_row}),
        "code": updated_promotion["code"],
    }


def validate_discount_code_for_submission(
    cursor,
    current_user: dict,
    discount_code: str | None,
    service_row: dict | None = None,
    extra_fields: dict | None = None,
):
    normalized_code = normalize_promotion_code(discount_code)
    if not normalized_code:
        return None

    promotion = lock_promotion_by_code(cursor, normalized_code)
    if not promotion:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá không tồn tại.")
    if not promotion_is_active(promotion):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá đã hết hạn hoặc chưa bắt đầu.")
    if not promotion_applies_to_service(promotion, service_row):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá không áp dụng cho dịch vụ này.")

    claim_id = extra_fields.get("promotion_claim_id") if isinstance(extra_fields, dict) else None
    if claim_id:
        claim_row = lock_promotion_claim_by_id(cursor, claim_id)
        if not claim_row or claim_row.get("promotion_id") != promotion["promotion_id"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thông tin mã giảm giá đã lưu không hợp lệ.")
        if claim_row.get("status") == "Đã sử dụng":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá này đã được dùng rồi.")
        return {"promotion": promotion, "claim": claim_row}

    if current_user.get("role") != "admin":
        claim_row = lock_promotion_claim(cursor, current_user["user_id"], promotion["promotion_id"])
        if not claim_row:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bạn chưa thêm mã giảm giá này vào tài khoản.")
        if claim_row.get("status") == "Đã sử dụng":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá này đã được dùng rồi.")
        return {"promotion": promotion, "claim": claim_row}

    usage_limit = promotion.get("usage_limit")
    if usage_limit is not None and int(promotion.get("claimed") or 0) >= int(usage_limit):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã giảm giá đã hết lượt phát.")
    return {"promotion": promotion, "claim": None}


def mark_promotion_claim_used(
    cursor,
    claim_row: dict | None,
    *,
    booking_id=None,
    order_id=None,
    customer_id=None,
):
    if not claim_row:
        return None
    if claim_row.get("status") == "Đã sử dụng":
        return claim_row
    cursor.execute(
        """
        UPDATE home_promotion_claims
        SET status = 'Đã sử dụng',
            used_at = NOW(),
            booking_id = COALESCE(%s, booking_id),
            order_id = COALESCE(%s, order_id),
            customer_id = COALESCE(%s, customer_id),
            updated_at = NOW()
        WHERE claim_id = %s
        RETURNING *
        """,
        (booking_id, order_id, customer_id, claim_row["claim_id"]),
    )
    return cursor.fetchone()


def sync_promotion_claim_statuses(cursor):
    ensure_promotion_claims_table(cursor)
    cursor.execute(
        """
        SELECT claim_id, promotion_id, promotion_code, user_id, customer_id, status, used_at, order_id
        FROM home_promotion_claims
        ORDER BY claimed_at ASC
        """
    )
    claims = cursor.fetchall()
    for claim in claims:
        if not claim.get("customer_id") or not claim.get("promotion_code"):
            continue
        cursor.execute(
            """
            SELECT order_id, customer_id, created_at
            FROM home_orders
            WHERE customer_id = %s
              AND UPPER(COALESCE(discount_code, '')) = UPPER(%s)
            ORDER BY created_at ASC
            LIMIT 1
            """,
            (claim["customer_id"], claim["promotion_code"]),
        )
        matched_order = cursor.fetchone()
        if matched_order:
            cursor.execute(
                """
                UPDATE home_promotion_claims
                SET status = 'Đã sử dụng',
                    used_at = COALESCE(used_at, %s),
                    order_id = %s,
                    updated_at = NOW()
                WHERE claim_id = %s
                  AND (
                    status <> 'Đã sử dụng'
                    OR order_id IS DISTINCT FROM %s
                    OR used_at IS NULL
                  )
                """,
                (
                    matched_order.get("created_at") or datetime.now(),
                    matched_order["order_id"],
                    claim["claim_id"],
                    matched_order["order_id"],
                ),
            )
            continue
        cursor.execute(
            """
            UPDATE home_promotion_claims
            SET status = 'Đã nhận',
                used_at = NULL,
                order_id = NULL,
                updated_at = NOW()
            WHERE claim_id = %s
              AND (
                status <> 'Đã nhận'
                OR used_at IS NOT NULL
                OR order_id IS NOT NULL
              )
            """,
            (claim["claim_id"],),
        )


def normalize_order_extra_fields(extra_fields) -> dict:
    if not isinstance(extra_fields, dict):
        return {}
    return {
        key: "0" if key.startswith("consumption_") and not str(value or "").strip() else value
        for key, value in extra_fields.items()
    }


def build_home_order_payload_from_booking(booking_row: dict):
    return {
        "customer_id": booking_row.get("customer_id"),
        "customer_code": booking_row.get("customer_code"),
        "customer_name": booking_row.get("customer_name"),
        "customer_phone": booking_row.get("customer_phone"),
        "pickup_address": booking_row.get("pickup_address"),
        "delivery_address": booking_row.get("delivery_address"),
        "service_id": booking_row.get("service_id"),
        "service_code": booking_row.get("service_code"),
        "service_name": booking_row.get("service_name"),
        "quantity": booking_row.get("quantity"),
        "total_amount": booking_row.get("total_amount"),
        "status": "Đã nhận",
        "appointment_time": booking_row.get("appointment_time"),
        "wash_date": booking_row.get("wash_date"),
        "due_at": booking_row.get("due_at"),
        "payment_method": booking_row.get("payment_method"),
        "discount_code": booking_row.get("discount_code"),
        "payment_status": "Chưa thanh toán",
        "note": booking_row.get("note"),
        "extra_fields": booking_row.get("extra_fields") or {},
    }


def insert_home_order(cursor, payload: dict, current_user: dict):
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
    washer_code = resolve_order_machine(
        cursor,
        payload.get("washer_code"),
        ["Máy giặt", "Máy giặt sấy"],
        "Máy giặt",
    )
    dryer_code = resolve_order_machine(
        cursor,
        payload.get("dryer_code"),
        ["Máy sấy", "Máy giặt sấy"],
        "Máy sấy",
    )
    cursor.execute(
        """
        SELECT COALESCE(MAX(NULLIF(regexp_replace(order_code, '\\D', '', 'g'), '')::int), 0) + 1
        AS next_number
        FROM home_orders
        """
    )
    order_code = payload.get("order_code") or f"DH-{cursor.fetchone()['next_number']:04d}"
    cursor.execute(
        """
        INSERT INTO home_orders (
            order_code, customer_id, customer_code, customer_name, customer_phone, pickup_address, delivery_address,
            service_id, service_code, service_name, quantity, total_amount, status, appointment_time, wash_date,
            due_at, washer_code, dryer_code, assigned_staff, payment_method,
            discount_code, payment_status, note, extra_fields, created_by
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, 0), COALESCE(%s, 'Đã nhận'),
            %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, 'Chưa thanh toán'),
            %s, COALESCE(%s, '{}'::jsonb), %s
        )
        RETURNING *
        """,
        (
            order_code, customer.get("customer_id"), customer["customer_code"],
            customer["full_name"], customer.get("phone"),
            payload.get("pickup_address") or customer.get("address"),
            payload.get("delivery_address") or customer.get("address"),
            service["service_id"], service["service_code"], service["name"],
            payload.get("quantity") or None,
            payload.get("total_amount") or 0, payload.get("status") or "Đã nhận",
            payload.get("appointment_time") or None, payload.get("wash_date") or None,
            payload.get("due_at") or None, washer_code,
            dryer_code, payload.get("assigned_staff") or None,
            payload.get("payment_method") or None, payload.get("discount_code") or None,
            payload.get("payment_status") or "Chưa thanh toán", payload.get("note") or None,
            Json(extra_fields), current_user["user_id"],
        ),
    )
    row = cursor.fetchone()
    mark_promotion_claim_used(
        cursor,
        promotion_submission.get("claim") if promotion_submission else None,
        order_id=row["order_id"],
        customer_id=customer.get("customer_id"),
    )
    cursor.execute(
        """
        INSERT INTO home_order_status_history (
            order_id, previous_status, status, changed_by, changed_at
        )
        VALUES (%s, NULL, %s, %s, %s)
        """,
        (row["order_id"], row["status"], current_user["user_id"], row["created_at"]),
    )
    deduct_order_inventory(cursor, row)
    release_order_reusable_inventory(cursor, row)
    sync_order_machine_statuses(cursor)
    sync_order_finance(cursor, row, current_user["user_id"])
    sync_order_customer_credit(cursor, row)
    return row


def ensure_order_inventory_tracking_columns(cursor):
    cursor.execute(
        """
        ALTER TABLE home_orders
            ADD COLUMN IF NOT EXISTS reusable_inventory_reservations JSONB NOT NULL DEFAULT '{}'::jsonb,
            ADD COLUMN IF NOT EXISTS reusable_inventory_reserved_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS reusable_inventory_released_at TIMESTAMPTZ
        """
    )


def deduct_order_inventory(cursor, order_row: dict):
    order_status = order_row.get("status")
    reusable_processing_statuses = {"Đang giặt", "Đang sấy", "Gấp đồ"}
    reusable_reservation_statuses = {
        *reusable_processing_statuses,
        "Sẵn sàng giao",
        "Đang giao",
        "Hoàn thành",
    }
    consumable_deduction_statuses = {"Sẵn sàng giao", "Đang giao", "Hoàn thành"}
    if order_status not in reusable_reservation_statuses:
        return
    ensure_order_inventory_tracking_columns(cursor)
    deduct_consumables = (
        order_status in consumable_deduction_statuses
        and not order_row.get("inventory_deducted_at")
    )
    reserve_reusables = (
        not order_row.get("reusable_inventory_reserved_at")
        or (
            order_status in reusable_processing_statuses
            and order_row.get("reusable_inventory_released_at")
        )
    )
    if not deduct_consumables and not reserve_reusables:
        return

    consumptions = []
    reusable_reservations = {}
    for key, value in (order_row.get("extra_fields") or {}).items():
        if not key.startswith("consumption_"):
            continue
        try:
            amount = Decimal(str(value or 0))
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Số lượng tiêu hao của {key.replace('consumption_', '')} không hợp lệ.",
            ) from exc
        if amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Số lượng tiêu hao của {key.replace('consumption_', '')} không được âm.",
            )
        if amount == 0:
            continue
        code = key.replace("consumption_", "")
        consumptions.append((code[3:] if code.upper().startswith("VT-") else code, amount))

    for item_code, amount in consumptions:
        cursor.execute(
            """
            SELECT item_code, name, inventory_type, quantity, initial_quantity
            FROM home_inventory_items
            WHERE item_code = %s
            FOR UPDATE
            """,
            (item_code,),
        )
        inventory = cursor.fetchone()
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không tìm thấy vật tư VT-{item_code} để xuất kho.",
            )
        should_deduct = (
            inventory["inventory_type"] == "Vật tư tiêu hao" and deduct_consumables
        ) or (
            inventory["inventory_type"] == "Vật tư tái sử dụng" and reserve_reusables
        )
        if not should_deduct:
            continue
        if inventory["quantity"] < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Vật tư VT-{item_code} ({inventory['name']}) không đủ tồn kho. "
                    f"Còn {inventory['quantity']}, cần {amount}."
                ),
            )
        cursor.execute(
            """
            UPDATE home_inventory_items
            SET quantity = quantity - %s,
                status = CASE
                    WHEN quantity - %s <= 0 THEN 'Cần mua'
                    WHEN initial_quantity > 0 AND quantity - %s <= initial_quantity * 0.2 THEN 'Sắp hết'
                    ELSE 'Ổn định'
                END,
                updated_at = NOW()
            WHERE item_code = %s
            """,
            (amount, amount, amount, item_code),
        )
        if inventory["inventory_type"] == "Vật tư tái sử dụng":
            reusable_reservations[f"VT-{item_code}"] = str(amount)

    cursor.execute(
        """
        UPDATE home_orders
        SET inventory_deducted_at = CASE
                WHEN %s THEN COALESCE(inventory_deducted_at, NOW())
                ELSE inventory_deducted_at
            END,
            reusable_inventory_reservations = CASE
                WHEN %s THEN %s
                ELSE reusable_inventory_reservations
            END,
            reusable_inventory_reserved_at = CASE
                WHEN %s THEN COALESCE(reusable_inventory_reserved_at, NOW())
                ELSE reusable_inventory_reserved_at
            END,
            reusable_inventory_released_at = NULL,
            updated_at = NOW()
        WHERE order_id = %s
        RETURNING inventory_deducted_at, reusable_inventory_reservations,
                  reusable_inventory_reserved_at, reusable_inventory_released_at
        """,
        (
            deduct_consumables,
            reserve_reusables,
            Json(reusable_reservations),
            reserve_reusables,
            order_row["order_id"],
        ),
    )
    deducted = cursor.fetchone()
    if deducted:
        order_row["inventory_deducted_at"] = deducted["inventory_deducted_at"]
        order_row["reusable_inventory_reservations"] = deducted["reusable_inventory_reservations"]
        order_row["reusable_inventory_reserved_at"] = deducted["reusable_inventory_reserved_at"]
        order_row["reusable_inventory_released_at"] = deducted["reusable_inventory_released_at"]


def release_order_reusable_inventory(cursor, order_row: dict, force=False):
    if not force and order_row.get("status") not in {"Sẵn sàng giao", "Đang giao", "Hoàn thành"}:
        return
    ensure_order_inventory_tracking_columns(cursor)
    if not order_row.get("reusable_inventory_reserved_at"):
        return
    if order_row.get("reusable_inventory_released_at"):
        return

    reservations = order_row.get("reusable_inventory_reservations") or {}
    if not isinstance(reservations, dict):
        reservations = {}

    for code, raw_amount in reservations.items():
        try:
            amount = Decimal(str(raw_amount or 0))
        except Exception:
            continue
        if amount <= 0:
            continue
        item_code = str(code).replace("VT-", "", 1)
        cursor.execute(
            """
            UPDATE home_inventory_items
            SET quantity = quantity + %s,
                status = CASE
                    WHEN quantity + %s <= 0 THEN 'Cần mua'
                    WHEN initial_quantity > 0 AND quantity + %s <= initial_quantity * 0.2 THEN 'Sắp hết'
                    ELSE 'Ổn định'
                END,
                updated_at = NOW()
            WHERE item_code = %s
              AND inventory_type = 'Vật tư tái sử dụng'
            """,
            (amount, amount, amount, item_code),
        )

    cursor.execute(
        """
        UPDATE home_orders
        SET reusable_inventory_released_at = NOW(), updated_at = NOW()
        WHERE order_id = %s
          AND reusable_inventory_released_at IS NULL
        RETURNING reusable_inventory_released_at
        """,
        (order_row["order_id"],),
    )
    released = cursor.fetchone()
    if released:
        order_row["reusable_inventory_released_at"] = released["reusable_inventory_released_at"]


def sync_order_machine_statuses(cursor):
    cursor.execute(
        """
        UPDATE home_machines machine
        SET status = CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM home_orders orders
                    WHERE orders.status IN ('Đang giặt', 'Đang sấy')
                      AND (
                        regexp_replace(COALESCE(orders.washer_code, ''), '^TB-', '')
                            = regexp_replace(machine.machine_code, '^TB-', '')
                        OR regexp_replace(COALESCE(orders.dryer_code, ''), '^TB-', '')
                            = regexp_replace(machine.machine_code, '^TB-', '')
                      )
                ) THEN 'Đang chạy'
                ELSE 'Sẵn sàng'
            END,
            updated_at = NOW()
        WHERE machine.status <> 'Bảo trì'
        """
    )


def sync_order_finance(cursor, order_row: dict, user_id):
    order_status = order_row.get("status")
    if order_status not in {"Sẵn sàng giao", "Đang giao", "Hoàn thành"}:
        cursor.execute(
            "DELETE FROM home_finance_records WHERE order_id = %s AND type <> 'Hoàn tiền'",
            (order_row["order_id"],),
        )
        return

    is_paid = order_status == "Hoàn thành"
    cursor.execute(
        """
        SELECT transaction_code
        FROM home_finance_records
        WHERE order_id = %s AND type <> 'Hoàn tiền'
        """,
        (order_row["order_id"],),
    )
    current = cursor.fetchone()
    transaction_code = current["transaction_code"] if current else make_finance_transaction_code(cursor)
    cursor.execute(
        """
        INSERT INTO home_finance_records (
            transaction_code, transaction_date, type, customer_code, customer, related_code, order_code,
            payment_method, amount, status, owner, note, order_id, created_by
        )
        VALUES (
            %s, COALESCE(%s, CURRENT_DATE), %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (order_id) WHERE order_id IS NOT NULL AND type <> 'Hoàn tiền' DO UPDATE SET
            transaction_date = EXCLUDED.transaction_date,
            type = EXCLUDED.type,
            customer_code = EXCLUDED.customer_code,
            customer = EXCLUDED.customer,
            related_code = EXCLUDED.related_code,
            order_code = EXCLUDED.order_code,
            payment_method = EXCLUDED.payment_method,
            amount = EXCLUDED.amount,
            status = EXCLUDED.status,
            owner = EXCLUDED.owner,
            note = EXCLUDED.note,
            order_id = EXCLUDED.order_id,
            updated_at = NOW()
        """,
        (
            transaction_code,
            order_row.get("wash_date") or order_row.get("created_at"),
            "Doanh thu" if is_paid else "Công nợ",
            order_row.get("customer_code"),
            order_row["customer_name"],
            order_row["order_code"],
            order_row["order_code"],
            order_row.get("payment_method") or "Tiền mặt",
            order_row.get("total_amount") or 0,
            "Đã thu" if is_paid else "Chờ thu",
            order_row.get("assigned_staff") or "Đồng bộ đơn hàng",
            order_row.get("note"),
            order_row["order_id"],
            user_id,
        ),
    )


def sync_order_customer_credit(cursor, order_row: dict):
    customer_id = order_row.get("customer_id")
    if not customer_id:
        return

    is_eligible = order_row.get("status") in CUSTOMER_CREDIT_STATUSES
    next_amount = Decimal(str(order_row.get("total_amount") or 0)) if is_eligible else Decimal("0")
    next_points = int(next_amount // LOYALTY_VND_PER_POINT) if is_eligible else 0

    cursor.execute(
        """
        UPDATE home_orders
        SET customer_credited_at = CASE WHEN %s THEN COALESCE(customer_credited_at, NOW()) ELSE NULL END,
            customer_credited_amount = %s,
            customer_credited_points = %s,
            updated_at = NOW()
        WHERE order_id = %s
        RETURNING customer_credited_at, customer_credited_amount, customer_credited_points
        """,
        (is_eligible, next_amount, next_points, order_row["order_id"]),
    )
    credited = cursor.fetchone()
    if credited:
        order_row.update(credited)

    cursor.execute(
        """
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(total_amount), 0) AS total_spent,
            COALESCE(SUM(FLOOR(total_amount / %s)), 0) AS loyalty_points
        FROM home_orders
        WHERE customer_id = %s
          AND status = ANY(%s)
        """,
        (LOYALTY_VND_PER_POINT, customer_id, list(CUSTOMER_CREDIT_STATUSES)),
    )
    totals = cursor.fetchone()

    cursor.execute(
        """
        SELECT
            COALESCE(SUM(finance.customer_refund_applied_amount), 0) AS refunded_amount,
            COALESCE(SUM(finance.customer_refund_applied_points), 0) AS refunded_points
        FROM home_finance_records finance
        JOIN home_orders orders ON orders.order_id = finance.order_id
        WHERE orders.customer_id = %s
          AND finance.type = 'Hoàn tiền'
        """,
        (customer_id,),
    )
    refunds = cursor.fetchone()

    total_spent = max(
        Decimal("0"),
        Decimal(str(totals["total_spent"] or 0))
        - Decimal(str(refunds["refunded_amount"] or 0)),
    )
    loyalty_points = max(
        0,
        int(totals["loyalty_points"] or 0)
        - int(refunds["refunded_points"] or 0),
    )
    cursor.execute(
        """
        UPDATE home_customers
        SET total_orders = %s,
            total_spent = %s,
            loyalty_points = %s,
            updated_at = NOW()
        WHERE customer_id = %s
        RETURNING account_id, loyalty_points
        """,
        (int(totals["total_orders"] or 0), total_spent, loyalty_points, customer_id),
    )
    customer = cursor.fetchone()
    if customer and customer.get("account_id"):
        cursor.execute(
            """
            UPDATE accounts
            SET loyalty_points = %s,
                updated_at = NOW()
            WHERE user_id = %s
            """,
            (customer["loyalty_points"], customer["account_id"]),
        )


def sync_finance_refund_customer(cursor, finance_row: dict):
    if not finance_row.get("order_id") or finance_row.get("type") != "Hoàn tiền":
        return

    cursor.execute(
        """
        SELECT o.customer_id, o.total_amount
        FROM home_orders o
        WHERE o.order_id = %s
        """,
        (finance_row["order_id"],),
    )
    order = cursor.fetchone()
    if not order or not order.get("customer_id"):
        return

    refund_amount = Decimal(str(finance_row.get("amount") or 0))
    cursor.execute(
        """
        SELECT COALESCE(SUM(amount), 0) AS refunded_amount
        FROM home_finance_records
        WHERE order_id = %s
          AND type = 'Hoàn tiền'
          AND finance_record_id <> %s
        """,
        (finance_row["order_id"], finance_row["finance_record_id"]),
    )
    other_refunds = Decimal(str(cursor.fetchone()["refunded_amount"] or 0))
    if other_refunds + refund_amount > Decimal(str(order.get("total_amount") or 0)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tổng tiền hoàn không được lớn hơn giá trị đơn hàng.",
        )
    previous_amount = Decimal(str(finance_row.get("customer_refund_applied_amount") or 0))
    previous_points = int(finance_row.get("customer_refund_applied_points") or 0)
    refund_points = int(refund_amount // LOYALTY_VND_PER_POINT)
    amount_delta = refund_amount - previous_amount
    points_delta = refund_points - previous_points

    if amount_delta == 0 and points_delta == 0:
        return

    cursor.execute(
        """
        UPDATE home_customers
        SET total_spent = GREATEST(0, total_spent - %s),
            loyalty_points = GREATEST(0, loyalty_points - %s),
            updated_at = NOW()
        WHERE customer_id = %s
        RETURNING account_id, loyalty_points
        """,
        (amount_delta, points_delta, order["customer_id"]),
    )
    customer = cursor.fetchone()
    if customer and customer.get("account_id"):
        cursor.execute(
            """
            UPDATE accounts
            SET loyalty_points = %s, updated_at = NOW()
            WHERE user_id = %s
            """,
            (customer["loyalty_points"], customer["account_id"]),
        )

    cursor.execute(
        """
        UPDATE home_finance_records
        SET customer_refund_applied_amount = %s,
            customer_refund_applied_points = %s,
            updated_at = NOW()
        WHERE finance_record_id = %s
        RETURNING *
        """,
        (refund_amount, refund_points, finance_row["finance_record_id"]),
    )
    updated = cursor.fetchone()
    if updated:
        finance_row.update(updated)


def upsert_inventory_finance(cursor, inventory_row: dict, user_id):
    transaction_date = inventory_row.get("last_restocked_at") or date.today()
    cursor.execute(
        "SELECT transaction_code FROM home_finance_records WHERE inventory_item_id = %s",
        (inventory_row["inventory_item_id"],),
    )
    current = cursor.fetchone()
    transaction_code = current["transaction_code"] if current else make_finance_transaction_code(cursor)
    cursor.execute(
        """
        INSERT INTO home_finance_records (
            transaction_code, transaction_date, type, customer, inventory_name, related_code, order_code,
            payment_method, amount, status, owner, note, inventory_item_id, created_by
        )
        VALUES (
            %s, %s, 'Chi phí', %s, %s, %s, %s, '', %s, 'Đã chi',
            'Đồng bộ vật tư', %s, %s, %s
        )
        ON CONFLICT (inventory_item_id) DO UPDATE SET
            transaction_date = EXCLUDED.transaction_date,
            type = 'Chi phí',
            customer = EXCLUDED.customer,
            inventory_name = EXCLUDED.inventory_name,
            related_code = EXCLUDED.related_code,
            order_code = EXCLUDED.order_code,
            payment_method = EXCLUDED.payment_method,
            amount = EXCLUDED.amount,
            status = 'Đã chi',
            note = EXCLUDED.note,
            updated_at = NOW()
        RETURNING *
        """,
        (
            transaction_code,
            transaction_date,
            inventory_row.get("supplier") or "",
            inventory_row["name"],
            f"VT-{inventory_row['item_code']}",
            f"VT-{inventory_row['item_code']}",
            inventory_row.get("cost") or 0,
            inventory_row.get("note"),
            inventory_row["inventory_item_id"],
            user_id,
        ),
    )
    return cursor.fetchone()


def normalize_service_unit(unit: str | None):
    unit_map = {
        "kg": "kg",
        "món": "item",
        "mon": "item",
        "item": "item",
        "bộ": "combo",
        "bo": "combo",
        "combo": "combo",
    }
    return unit_map.get(str(unit or "kg").strip().lower(), "kg")


def normalize_service_status(status_value: str | None):
    status_map = {
        "active": "active",
        "inactive": "inactive",
        "Đang hoạt động": "active",
        "Tạm ngừng": "inactive",
    }
    return status_map.get(str(status_value or "active").strip(), "active")


def table_exists(cursor, table_name: str):
    cursor.execute("SELECT to_regclass(%s) AS table_name", (table_name,))
    row = cursor.fetchone()
    if not row:
        return False
    if isinstance(row, dict):
        return row["table_name"] is not None
    return row[0] is not None


def count_rows(cursor, table_name: str, where_sql: str | None = None):
    if not table_exists(cursor, table_name):
        return 0
    cursor.execute(
        f"SELECT COUNT(*) AS total FROM {table_name} {where_sql or ''}"
    )
    row = cursor.fetchone()
    return row["total"] if isinstance(row, dict) else row[0]


def sum_column(cursor, table_name: str, column_name: str, where_sql: str | None = None):
    if not table_exists(cursor, table_name):
        return 0
    cursor.execute(
        f"SELECT COALESCE(SUM({column_name}), 0) AS total FROM {table_name} {where_sql or ''}"
    )
    row = cursor.fetchone()
    return row["total"] if isinstance(row, dict) else row[0]


def select_all_or_empty(cursor, table_name: str, limit: int):
    if not table_exists(cursor, table_name):
        return []
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 0")
    colnames = [desc[0] for desc in cursor.description]
    order_by = "created_at DESC" if "created_at" in colnames else "1 DESC"
    cursor.execute(
        f"SELECT * FROM {table_name} ORDER BY {order_by} LIMIT %s",
        (limit,),
    )
    return [serialize_row(row) for row in cursor.fetchall()]


def list_home_rows(
    config: dict,
    q: str | None,
    limit: int,
    offset: int,
    include_count: bool,
    connect,
):
    table = config["table"]
    search_columns = config["search"]

    where_sql = ""
    params: list = []
    if q and search_columns:
        clauses = [f"{column}::text ILIKE %s" for column in search_columns]
        where_sql = "WHERE " + " OR ".join(clauses)
        params.extend([f"%{q}%"] * len(search_columns))

    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        if not table_exists(cursor, table):
            return {
                "items": [],
                "total": 0,
                "limit": limit,
                "offset": offset,
            }

        total = None
        if include_count:
            cursor.execute(f"SELECT COUNT(*) AS total FROM {table} {where_sql}", params)
            total = cursor.fetchone()["total"]

        cursor.execute(
            f"SELECT * FROM {table} {where_sql} ORDER BY 1 DESC LIMIT %s OFFSET %s",
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

