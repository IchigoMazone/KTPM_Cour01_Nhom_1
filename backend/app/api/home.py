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


def ensure_inventory_demo_item(cursor, user_id):
    cursor.execute(
        """
        SELECT inventory_item_id
        FROM home_inventory_items
        WHERE name = 'Mẫu hiển thị tồn kho'
        LIMIT 1
        """
    )
    if cursor.fetchone():
        return

    item_code = make_sequence_code(cursor, "home_inventory_items", "item_code")
    cursor.execute(
        """
        INSERT INTO home_inventory_items (
            item_code, name, category, unit, inventory_type, initial_quantity, quantity, supplier,
            cost, status, last_restocked_at, note, created_by
        )
        VALUES (
            %s, 'Mẫu hiển thị tồn kho', 'Demo', 'cái', 'Vật tư tiêu hao', 100, 35, '-',
            0, 'Ổn định', NOW(), 'Dữ liệu mẫu để biểu diễn thanh còn/hết hai màu trên tổng quan.', %s
        )
        RETURNING *
        """,
        (item_code, user_id),
    )
    cursor.fetchone()


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
        ensure_inventory_demo_item(cursor, current_user["user_id"])
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
                SELECT
                    booking_id,
                    booking_code,
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
                WHERE status = 'Chờ xử lý'
                  AND (requested_by IS NULL OR requested_by <> %s)
                ORDER BY COALESCE(due_at, wash_date::timestamp, created_at), created_at DESC
                LIMIT 20
                """,
                (current_user["user_id"],),
            )
        else:
            cursor.execute(
                """
                SELECT
                    booking_id,
                    booking_code,
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
                COALESCE(c.image_url, '') AS resolved_customer_image_url,
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
                            'created_at', m.created_at
                        )
                        ORDER BY m.created_at
                    ) FILTER (WHERE m.message_id IS NOT NULL),
                    '[]'::json
                ) AS messages
            FROM home_support_tickets t
            LEFT JOIN home_customers c ON c.customer_id = t.customer_id
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
            GROUP BY t.ticket_id, c.full_name, c.phone, c.image_url, c.customer_code, o.order_code, a.full_name, a.image_url
            ORDER BY t.created_at DESC
            """,
            (is_customer, current_user["user_id"]),
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
def create_support_ticket(
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
            SELECT customer_id, customer_code, full_name, phone, image_url
            FROM home_customers
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
        customer_avatar = linked_customer.get("image_url")
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
            """,
            (
                ticket["ticket_id"], current_user["user_id"],
                "customer" if current_user.get("role") == "user" else "staff",
                customer_name if current_user.get("role") == "user" else assigned_name,
                customer_avatar if current_user.get("role") == "user" else profile.get("image_url"),
                initial_content,
            ),
        )
        connect.commit()
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
            SELECT full_name, image_url
            FROM home_customers
            WHERE customer_id = %s
            LIMIT 1
            """,
            (ticket.get("customer_id"),),
        )
        customer = cursor.fetchone()
        if customer:
            sender_name = customer.get("full_name") or sender_name
            sender_avatar = customer.get("image_url")
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
            if payload.get("type") not in {"send_support_message", "update_support_message"}:
                continue
            ticket_id = str(payload.get("ticket_id") or "").strip()
            message_id = str(payload.get("message_id") or "").strip()
            if payload.get("type") == "send_support_message" and not ticket_id:
                await websocket.send_json({"type": "support_error", "message": "Thiếu ticket_id."})
                continue
            if payload.get("type") == "update_support_message" and not message_id:
                await websocket.send_json({"type": "support_error", "message": "Thiếu message_id."})
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


@router_home.get("/staff/overview")
def get_staff_overview(
    limit: int = Query(default=500, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    connect=Depends(get_connection),
):
    cursor = connect.cursor(cursor_factory=RealDictCursor)
    try:
        ensure_inventory_demo_item(cursor, current_user["user_id"])
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
