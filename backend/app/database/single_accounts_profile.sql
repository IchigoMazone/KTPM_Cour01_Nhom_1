ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS member_tier VARCHAR(20) DEFAULT 'Thường',
ADD COLUMN IF NOT EXISTS special_notes TEXT;

DO $$
BEGIN
    IF to_regclass('public.user_profiles') IS NOT NULL THEN
        EXECUTE $sql$
            UPDATE public.accounts a
            SET full_name = COALESCE(NULLIF(a.full_name, ''), p.full_name),
                email = COALESCE(NULLIF(a.email, ''), p.email),
                phone = COALESCE(NULLIF(a.phone, ''), p.phone),
                address = COALESCE(NULLIF(a.address, ''), p.address),
                image_url = COALESCE(NULLIF(a.image_url, ''), p.image_url),
                loyalty_points = COALESCE(a.loyalty_points, p.loyalty_points, 0),
                member_tier = COALESCE(NULLIF(a.member_tier, ''), p.member_tier, 'Thường'),
                special_notes = COALESCE(NULLIF(a.special_notes, ''), p.special_notes)
            FROM public.user_profiles p
            WHERE a.user_id = p.user_id
        $sql$;
    END IF;

    IF to_regclass('public.admin_profiles') IS NOT NULL THEN
        EXECUTE $sql$
            UPDATE public.accounts a
            SET full_name = COALESCE(NULLIF(a.full_name, ''), p.full_name),
                email = COALESCE(NULLIF(a.email, ''), p.email),
                phone = COALESCE(NULLIF(a.phone, ''), p.phone),
                address = COALESCE(NULLIF(a.address, ''), p.address),
                image_url = COALESCE(NULLIF(a.image_url, ''), p.image_url),
                loyalty_points = COALESCE(a.loyalty_points, 0),
                member_tier = COALESCE(NULLIF(a.member_tier, ''), 'Thường')
            FROM public.admin_profiles p
            WHERE a.user_id = p.user_id
        $sql$;
    END IF;
END $$;

UPDATE public.accounts
SET full_name = COALESCE(NULLIF(full_name, ''), username),
    email = COALESCE(NULLIF(email, ''), username || '@example.com'),
    address = COALESCE(NULLIF(address, ''), 'Chưa cập nhật'),
    image_url = COALESCE(NULLIF(image_url, ''), 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif'),
    loyalty_points = COALESCE(loyalty_points, 0),
    member_tier = COALESCE(NULLIF(member_tier, ''), 'Thường');
