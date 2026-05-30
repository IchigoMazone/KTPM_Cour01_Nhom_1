ALTER TABLE public.admin_profiles
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE public.admin_profiles
SET image_url = 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif'
WHERE image_url IS NULL OR image_url = '';

UPDATE public.user_profiles
SET image_url = 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif'
WHERE image_url IS NULL OR image_url = '';

UPDATE public.admin_profiles p
SET email = COALESCE(NULLIF(p.email, ''), a.username || '@example.com'),
    address = COALESCE(NULLIF(p.address, ''), 'Chưa cập nhật')
FROM public.accounts a
WHERE p.user_id = a.user_id;

UPDATE public.user_profiles p
SET email = COALESCE(NULLIF(p.email, ''), a.username || '@example.com'),
    address = COALESCE(NULLIF(p.address, ''), 'Chưa cập nhật')
FROM public.accounts a
WHERE p.user_id = a.user_id;
