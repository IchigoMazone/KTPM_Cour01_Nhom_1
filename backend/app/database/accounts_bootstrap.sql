CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.accounts (
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
    member_tier character varying(20) DEFAULT 'Thuong'::character varying,
    special_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    page_size integer DEFAULT 10,
    table_resize_mode character varying(20) DEFAULT 'fit'::character varying,
    columns_config text DEFAULT '{}'::text,
    CONSTRAINT accounts_member_tier_check CHECK (((member_tier)::text = ANY (ARRAY['Thuong'::text, 'Bac'::text, 'Vang'::text, 'Kim Cuong'::text]))),
    CONSTRAINT accounts_role_check CHECK (((role)::text = ANY (ARRAY['admin'::text, 'user'::text])))
);

ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS page_size integer DEFAULT 10;

ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS table_resize_mode character varying(20) DEFAULT 'fit'::character varying;

ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS columns_config text DEFAULT '{}'::text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounts_pkey'
          AND conrelid = 'public.accounts'::regclass
    ) THEN
        ALTER TABLE ONLY public.accounts
            ADD CONSTRAINT accounts_pkey PRIMARY KEY (user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounts_username_key'
          AND conrelid = 'public.accounts'::regclass
    ) THEN
        ALTER TABLE ONLY public.accounts
            ADD CONSTRAINT accounts_username_key UNIQUE (username);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'accounts_email_key'
          AND conrelid = 'public.accounts'::regclass
    ) THEN
        ALTER TABLE ONLY public.accounts
            ADD CONSTRAINT accounts_email_key UNIQUE (email);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_accounts_role ON public.accounts USING btree (role);
