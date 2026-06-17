SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

SET default_tablespace = '';

SET default_table_access_method = heap;

DROP TABLE IF EXISTS
    public.home_support_messages,
    public.home_support_tickets,
    public.home_promotion_claims,
    public.home_booking_requests,
    public.home_order_status_history,
    public.home_orders,
    public.home_finance_records,
    public.home_machine_maintenance_records,
    public.home_machines,
    public.home_memos,
    public.home_staff_profiles,
    public.home_customers,
    public.home_services,
    public.home_promotions,
    public.home_inventory_items,
    public.accounts
CASCADE;

CREATE TABLE public.accounts (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    full_name character varying(100),
    email character varying(100),
    phone character varying(20),
    address text,
    image_url text,
    loyalty_points integer DEFAULT 0,
    member_tier character varying(20) DEFAULT 'Thường'::character varying,
    special_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    page_size integer DEFAULT 10,
    table_resize_mode character varying(20) DEFAULT 'fit'::character varying,
    columns_config text DEFAULT '{}'::text,
    CONSTRAINT accounts_member_tier_check CHECK (((member_tier)::text = ANY (ARRAY[('Thường'::character varying)::text, ('Bạc'::character varying)::text, ('Vàng'::character varying)::text, ('Kim Cương'::character varying)::text]))),
    CONSTRAINT accounts_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('user'::character varying)::text])))
);

CREATE TABLE public.home_staff_profiles (
    staff_id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_code character varying(30) NOT NULL,
    full_name character varying(160) NOT NULL,
    phone character varying(30),
    email character varying(160),
    role character varying(50) DEFAULT 'Nhân viên'::character varying NOT NULL,
    status character varying(30) DEFAULT 'Đang làm'::character varying NOT NULL,
    note text,
    image_url text,
    account_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_staff_profiles_status_check CHECK (((status)::text = ANY ((ARRAY['Đang làm'::character varying, 'Tạm nghỉ'::character varying, 'Nghỉ việc'::character varying])::text[])))
);

CREATE TABLE public.home_booking_requests (
    booking_id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_code character varying(20) NOT NULL,
    customer_id uuid,
    customer_code character varying(20),
    customer_name character varying(160) NOT NULL,
    customer_phone character varying(30),
    pickup_address text,
    delivery_address text,
    service_id uuid,
    service_code character varying(30),
    service_name character varying(160),
    quantity character varying(80),
    total_amount numeric(14,2) DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'Chờ xử lý'::character varying NOT NULL,
    appointment_time character varying(20),
    wash_date date,
    due_at timestamp with time zone,
    payment_method character varying(50),
    discount_code character varying(80),
    note text,
    extra_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    requested_by uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    order_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_booking_requests_total_amount_check CHECK ((total_amount >= (0)::numeric))
);

CREATE TABLE public.home_customers (
    customer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_code character varying(20) NOT NULL,
    full_name character varying(160) NOT NULL,
    phone character varying(30) NOT NULL,
    email character varying(160),
    address text,
    birthday date,
    rank character varying(30) DEFAULT 'Thường'::character varying NOT NULL,
    total_orders integer DEFAULT 0 NOT NULL,
    total_spent numeric(14,2) DEFAULT 0 NOT NULL,
    loyalty_points integer DEFAULT 0 NOT NULL,
    note text,
    image_url text,
    extra_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid,
    CONSTRAINT home_customers_loyalty_points_check CHECK ((loyalty_points >= 0)),
    CONSTRAINT home_customers_total_orders_check CHECK ((total_orders >= 0)),
    CONSTRAINT home_customers_total_spent_check CHECK ((total_spent >= (0)::numeric))
);

CREATE TABLE public.home_finance_records (
    finance_record_id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_code character varying(30) NOT NULL,
    transaction_date date DEFAULT CURRENT_DATE NOT NULL,
    type character varying(30) NOT NULL,
    customer character varying(160) NOT NULL,
    order_code character varying(40) DEFAULT '-'::character varying NOT NULL,
    payment_method character varying(30) DEFAULT 'Tiền mặt'::character varying NOT NULL,
    amount numeric(14,2) DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'Đã thu'::character varying NOT NULL,
    owner character varying(140),
    note text,
    inventory_item_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    inventory_name character varying(160),
    order_id uuid,
    related_code character varying(40) DEFAULT '-'::character varying NOT NULL,
    customer_code character varying(20),
    manual_override boolean DEFAULT false NOT NULL,
    customer_refund_applied_amount numeric(14,2) DEFAULT 0 NOT NULL,
    customer_refund_applied_points integer DEFAULT 0 NOT NULL,
    CONSTRAINT home_finance_records_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT home_finance_records_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY[''::character varying, 'Tiền mặt'::character varying, 'Chuyển khoản'::character varying])::text[]))),
    CONSTRAINT home_finance_records_status_check CHECK (((status)::text = ANY ((ARRAY['Đã thu'::character varying, 'Chờ thu'::character varying, 'Đã chi'::character varying, 'Quá hạn'::character varying])::text[])))
);

CREATE TABLE public.home_inventory_items (
    inventory_item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_code character varying(30) NOT NULL,
    name character varying(140) NOT NULL,
    unit character varying(20) NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL,
    supplier character varying(140),
    status character varying(30) DEFAULT 'Ổn định'::character varying NOT NULL,
    last_restocked_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category character varying(80),
    cost numeric(14,2) DEFAULT 0 NOT NULL,
    note text,
    inventory_type character varying(30) DEFAULT 'Vật tư tiêu hao'::character varying NOT NULL,
    initial_quantity numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT home_inventory_items_cost_check CHECK ((cost >= (0)::numeric)),
    CONSTRAINT home_inventory_items_inventory_type_valid CHECK (((inventory_type)::text = ANY ((ARRAY['Vật tư tiêu hao'::character varying, 'Vật tư tái sử dụng'::character varying])::text[]))),
    CONSTRAINT home_inventory_items_quantity_check CHECK ((quantity >= (0)::numeric)),
    CONSTRAINT home_inventory_items_status_valid CHECK (((status)::text = ANY ((ARRAY['Ổn định'::character varying, 'Sắp hết'::character varying, 'Cần mua'::character varying])::text[])))
);

CREATE TABLE public.home_machine_maintenance_records (
    record_id uuid DEFAULT gen_random_uuid() NOT NULL,
    machine_id uuid NOT NULL,
    maintenance_date date NOT NULL,
    maintenance_type character varying(30) NOT NULL,
    cost numeric(14,2) DEFAULT 0 NOT NULL,
    performer character varying(120),
    note text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    next_maintenance_at date,
    CONSTRAINT home_machine_maintenance_records_cost_check CHECK ((cost >= (0)::numeric)),
    CONSTRAINT home_machine_maintenance_records_maintenance_type_check CHECK (((maintenance_type)::text = ANY (ARRAY[('Bảo dưỡng'::character varying)::text, ('Sửa chữa'::character varying)::text])))
);

CREATE TABLE public.home_machines (
    machine_id uuid DEFAULT gen_random_uuid() NOT NULL,
    machine_code character varying(30) NOT NULL,
    name character varying(120) NOT NULL,
    machine_type character varying(30) NOT NULL,
    capacity_kg numeric(8,2),
    status character varying(30) DEFAULT 'Sẵn sàng'::character varying NOT NULL,
    location character varying(120),
    note text,
    last_maintenance_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    next_maintenance_at timestamp with time zone,
    CONSTRAINT home_machines_capacity_kg_check CHECK (((capacity_kg IS NULL) OR (capacity_kg > (0)::numeric))),
    CONSTRAINT home_machines_machine_type_check CHECK (((machine_type)::text = ANY (ARRAY[('Máy giặt'::character varying)::text, ('Máy sấy'::character varying)::text, ('Máy giặt sấy'::character varying)::text, ('Bàn hấp'::character varying)::text, ('Bàn ủi'::character varying)::text]))),
    CONSTRAINT home_machines_status_valid CHECK (((status)::text = ANY ((ARRAY['Sẵn sàng'::character varying, 'Đang chạy'::character varying, 'Bảo trì'::character varying])::text[])))
);

CREATE TABLE public.home_memos (
    memo_id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    priority character varying(30) DEFAULT 'Bình thường'::character varying NOT NULL
);

CREATE TABLE public.home_order_status_history (
    history_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    previous_status character varying(50),
    status character varying(50) NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.home_orders (
    order_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_code character varying(20) NOT NULL,
    customer_name character varying(160) NOT NULL,
    customer_phone character varying(30),
    pickup_address text,
    delivery_address text,
    service_name character varying(160),
    quantity character varying(80),
    total_amount numeric(14,2) DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'Đã nhận'::character varying NOT NULL,
    appointment_time character varying(20),
    wash_date date,
    due_at timestamp with time zone,
    washer_code character varying(40),
    dryer_code character varying(40),
    assigned_staff character varying(160),
    payment_method character varying(50),
    discount_code character varying(80),
    payment_status character varying(50) DEFAULT 'Chưa thanh toán'::character varying NOT NULL,
    note text,
    extra_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_id uuid,
    customer_code character varying(20),
    service_id uuid,
    service_code character varying(30),
    inventory_deducted_at timestamp with time zone,
    customer_credited_at timestamp with time zone,
    customer_credited_amount numeric(14,2) DEFAULT 0 NOT NULL,
    customer_credited_points integer DEFAULT 0 NOT NULL,
    reusable_inventory_reservations jsonb DEFAULT '{}'::jsonb NOT NULL,
    reusable_inventory_reserved_at timestamp with time zone,
    reusable_inventory_released_at timestamp with time zone,
    CONSTRAINT home_orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);

CREATE TABLE public.home_promotion_claims (
    claim_id uuid DEFAULT gen_random_uuid() NOT NULL,
    promotion_id uuid NOT NULL,
    promotion_code character varying(80) NOT NULL,
    user_id uuid NOT NULL,
    customer_id uuid,
    status character varying(30) DEFAULT 'Đã nhận'::character varying NOT NULL,
    claimed_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone,
    booking_id uuid,
    order_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_promotion_claims_status_valid CHECK (((status)::text = ANY ((ARRAY['Đã nhận'::character varying, 'Đã sử dụng'::character varying])::text[])))
);

CREATE TABLE public.home_promotions (
    promotion_id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(140) NOT NULL,
    type character varying(20) NOT NULL,
    value character varying(30) NOT NULL,
    applied_service character varying(100) DEFAULT 'Tất cả dịch vụ'::character varying NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date,
    usage_limit integer,
    claimed integer DEFAULT 0 NOT NULL,
    note text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_promotions_claimed_check CHECK ((claimed >= 0)),
    CONSTRAINT home_promotions_type_valid CHECK (((type)::text = ANY ((ARRAY['Phần trăm'::character varying, 'Số tiền'::character varying])::text[])))
);

CREATE TABLE public.home_services (
    service_id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_code character varying(30) NOT NULL,
    name character varying(140) NOT NULL,
    category character varying(100),
    description text,
    unit character varying(20) DEFAULT 'kg'::character varying NOT NULL,
    price numeric(14,2) DEFAULT 0 NOT NULL,
    turnaround_hours integer DEFAULT 24 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    promotion_enabled boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    inventory_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT home_services_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT home_services_status_valid CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT home_services_turnaround_hours_check CHECK ((turnaround_hours > 0)),
    CONSTRAINT home_services_unit_valid CHECK (((unit)::text = ANY ((ARRAY['kg'::character varying, 'item'::character varying, 'combo'::character varying])::text[])))
);

CREATE TABLE public.home_support_messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    sender_id uuid,
    sender_role character varying(20) NOT NULL,
    sender_name character varying(160) NOT NULL,
    sender_avatar text,
    content text DEFAULT ''::text NOT NULL,
    image_url text,
    file_attachment jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_support_messages_sender_role_check CHECK (((sender_role)::text = ANY ((ARRAY['customer'::character varying, 'staff'::character varying])::text[])))
);

CREATE TABLE public.home_support_tickets (
    ticket_id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_code character varying(20) NOT NULL,
    type character varying(50) NOT NULL,
    subject character varying(200) NOT NULL,
    status character varying(30) DEFAULT 'Chưa xử lý'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'Trung bình'::character varying NOT NULL,
    customer_id uuid,
    customer_name character varying(160) NOT NULL,
    customer_phone character varying(30),
    order_id uuid,
    order_code character varying(30),
    assigned_to uuid,
    assigned_name character varying(160),
    assigned_avatar text,
    wash_date date,
    note text,
    requester_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT home_support_tickets_priority_check CHECK (((priority)::text = ANY ((ARRAY['Cao'::character varying, 'Trung bình'::character varying, 'Thấp'::character varying])::text[]))),
    CONSTRAINT home_support_tickets_status_check CHECK (((status)::text = ANY ((ARRAY['Chưa xử lý'::character varying, 'Đang xử lý'::character varying, 'Đã giải quyết'::character varying])::text[])))
);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_username_key UNIQUE (username);

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_booking_code_key UNIQUE (booking_code);

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_pkey PRIMARY KEY (booking_id);

ALTER TABLE ONLY public.home_customers
    ADD CONSTRAINT home_customers_customer_code_key UNIQUE (customer_code);

ALTER TABLE ONLY public.home_customers
    ADD CONSTRAINT home_customers_pkey PRIMARY KEY (customer_id);

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_inventory_item_id_key UNIQUE (inventory_item_id);

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_pkey PRIMARY KEY (finance_record_id);

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_transaction_code_key UNIQUE (transaction_code);

ALTER TABLE ONLY public.home_inventory_items
    ADD CONSTRAINT home_inventory_items_item_code_key UNIQUE (item_code);

ALTER TABLE ONLY public.home_inventory_items
    ADD CONSTRAINT home_inventory_items_pkey PRIMARY KEY (inventory_item_id);

ALTER TABLE ONLY public.home_machine_maintenance_records
    ADD CONSTRAINT home_machine_maintenance_records_pkey PRIMARY KEY (record_id);

ALTER TABLE ONLY public.home_machines
    ADD CONSTRAINT home_machines_machine_code_key UNIQUE (machine_code);

ALTER TABLE ONLY public.home_machines
    ADD CONSTRAINT home_machines_pkey PRIMARY KEY (machine_id);

ALTER TABLE ONLY public.home_memos
    ADD CONSTRAINT home_memos_pkey PRIMARY KEY (memo_id);

ALTER TABLE ONLY public.home_staff_profiles
    ADD CONSTRAINT home_staff_profiles_pkey PRIMARY KEY (staff_id);

ALTER TABLE ONLY public.home_staff_profiles
    ADD CONSTRAINT home_staff_profiles_staff_code_key UNIQUE (staff_code);

ALTER TABLE ONLY public.home_order_status_history
    ADD CONSTRAINT home_order_status_history_pkey PRIMARY KEY (history_id);

ALTER TABLE ONLY public.home_orders
    ADD CONSTRAINT home_orders_order_code_key UNIQUE (order_code);

ALTER TABLE ONLY public.home_orders
    ADD CONSTRAINT home_orders_pkey PRIMARY KEY (order_id);

ALTER TABLE ONLY public.home_promotion_claims
    ADD CONSTRAINT home_promotion_claims_pkey PRIMARY KEY (claim_id);

ALTER TABLE ONLY public.home_promotion_claims
    ADD CONSTRAINT home_promotion_claims_user_id_promotion_id_key UNIQUE (user_id, promotion_id);

ALTER TABLE ONLY public.home_promotions
    ADD CONSTRAINT home_promotions_code_key UNIQUE (code);

ALTER TABLE ONLY public.home_promotions
    ADD CONSTRAINT home_promotions_pkey PRIMARY KEY (promotion_id);

ALTER TABLE ONLY public.home_services
    ADD CONSTRAINT home_services_pkey PRIMARY KEY (service_id);

ALTER TABLE ONLY public.home_services
    ADD CONSTRAINT home_services_service_code_key UNIQUE (service_code);

ALTER TABLE ONLY public.home_support_messages
    ADD CONSTRAINT home_support_messages_pkey PRIMARY KEY (message_id);

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_pkey PRIMARY KEY (ticket_id);

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_ticket_code_key UNIQUE (ticket_code);

CREATE INDEX idx_accounts_role ON public.accounts USING btree (role);

CREATE INDEX idx_home_booking_requests_created_at ON public.home_booking_requests USING btree (created_at DESC);

CREATE INDEX idx_home_booking_requests_requested_by ON public.home_booking_requests USING btree (requested_by);

CREATE INDEX idx_home_booking_requests_status ON public.home_booking_requests USING btree (status);

CREATE UNIQUE INDEX idx_home_customers_account_id ON public.home_customers USING btree (account_id) WHERE (account_id IS NOT NULL);

CREATE INDEX idx_home_customers_full_name ON public.home_customers USING btree (full_name);

CREATE INDEX idx_home_customers_phone ON public.home_customers USING btree (phone);

CREATE INDEX idx_home_finance_records_date ON public.home_finance_records USING btree (transaction_date DESC);

CREATE INDEX idx_home_finance_records_inventory ON public.home_finance_records USING btree (inventory_item_id);

CREATE UNIQUE INDEX idx_home_finance_records_order ON public.home_finance_records USING btree (order_id) WHERE ((order_id IS NOT NULL) AND ((type)::text <> 'Hoàn tiền'::text));

CREATE INDEX idx_home_finance_records_type ON public.home_finance_records USING btree (type);

CREATE INDEX idx_home_inventory_items_item_code ON public.home_inventory_items USING btree (item_code);

CREATE INDEX idx_home_inventory_items_status ON public.home_inventory_items USING btree (status);

CREATE INDEX idx_home_machine_maintenance_records_date ON public.home_machine_maintenance_records USING btree (maintenance_date DESC);

CREATE INDEX idx_home_machine_maintenance_records_machine_id ON public.home_machine_maintenance_records USING btree (machine_id);

CREATE INDEX idx_home_machines_machine_code ON public.home_machines USING btree (machine_code);

CREATE INDEX idx_home_machines_status ON public.home_machines USING btree (status);

CREATE INDEX idx_home_memos_created_by ON public.home_memos USING btree (created_by, updated_at DESC);

CREATE UNIQUE INDEX idx_home_staff_profiles_account_id ON public.home_staff_profiles USING btree (account_id) WHERE (account_id IS NOT NULL);

CREATE INDEX idx_home_staff_profiles_status ON public.home_staff_profiles USING btree (status);

CREATE INDEX idx_home_order_status_history_order ON public.home_order_status_history USING btree (order_id, changed_at);

CREATE INDEX idx_home_orders_created_at ON public.home_orders USING btree (created_at DESC);

CREATE INDEX idx_home_orders_customer_id ON public.home_orders USING btree (customer_id);

CREATE INDEX idx_home_orders_customer_name ON public.home_orders USING btree (customer_name);

CREATE INDEX idx_home_orders_service_id ON public.home_orders USING btree (service_id);

CREATE INDEX idx_home_orders_status ON public.home_orders USING btree (status);

CREATE INDEX idx_home_promotion_claims_promotion_id ON public.home_promotion_claims USING btree (promotion_id);

CREATE INDEX idx_home_promotion_claims_status ON public.home_promotion_claims USING btree (status);

CREATE INDEX idx_home_promotion_claims_user_id ON public.home_promotion_claims USING btree (user_id);

CREATE INDEX idx_home_promotions_code ON public.home_promotions USING btree (code);

CREATE INDEX idx_home_services_service_code ON public.home_services USING btree (service_code);

CREATE INDEX idx_home_services_status ON public.home_services USING btree (status);

CREATE INDEX idx_home_support_messages_ticket ON public.home_support_messages USING btree (ticket_id, created_at);

CREATE INDEX idx_home_support_tickets_requester ON public.home_support_tickets USING btree (requester_id);

CREATE INDEX idx_home_support_tickets_status ON public.home_support_tickets USING btree (status);

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.home_customers(customer_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.home_orders(order_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_booking_requests
    ADD CONSTRAINT home_booking_requests_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.home_services(service_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_customers
    ADD CONSTRAINT home_customers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.home_inventory_items(inventory_item_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_finance_records
    ADD CONSTRAINT home_finance_records_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.home_orders(order_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_inventory_items
    ADD CONSTRAINT home_inventory_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_machine_maintenance_records
    ADD CONSTRAINT home_machine_maintenance_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_machine_maintenance_records
    ADD CONSTRAINT home_machine_maintenance_records_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES public.home_machines(machine_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_machines
    ADD CONSTRAINT home_machines_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_memos
    ADD CONSTRAINT home_memos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_staff_profiles
    ADD CONSTRAINT home_staff_profiles_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_order_status_history
    ADD CONSTRAINT home_order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_order_status_history
    ADD CONSTRAINT home_order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.home_orders(order_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_orders
    ADD CONSTRAINT home_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_orders
    ADD CONSTRAINT home_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.home_customers(customer_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_orders
    ADD CONSTRAINT home_orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.home_services(service_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_promotion_claims
    ADD CONSTRAINT home_promotion_claims_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.home_customers(customer_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_promotion_claims
    ADD CONSTRAINT home_promotion_claims_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.home_promotions(promotion_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_promotion_claims
    ADD CONSTRAINT home_promotion_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.accounts(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_promotions
    ADD CONSTRAINT home_promotions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_services
    ADD CONSTRAINT home_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_messages
    ADD CONSTRAINT home_support_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_messages
    ADD CONSTRAINT home_support_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.home_support_tickets(ticket_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.home_customers(customer_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.home_orders(order_id) ON DELETE SET NULL;

ALTER TABLE ONLY public.home_support_tickets
    ADD CONSTRAINT home_support_tickets_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.accounts(user_id) ON DELETE SET NULL;
