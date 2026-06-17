--
-- PostgreSQL database dump
--

\restrict pFF8kKUJWyxzVgOtCM3ONsYBQZ5Z3BgveFwWN6s9Swio3yfNUbubQ2SBFfUfFqX

-- Dumped from database version 17.10 (98a80fa)
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-1.pgdg24.04+1)

-- Started on 2026-06-13 22:41:23 +07

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 73728)
-- Name: accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

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
    CONSTRAINT accounts_member_tier_check CHECK (((member_tier)::text = ANY ((ARRAY['Thường'::character varying, 'Bạc'::character varying, 'Vàng'::character varying, 'Kim Cương'::character varying])::text[]))),
    CONSTRAINT accounts_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])))
);


ALTER TABLE public.accounts OWNER TO neondb_owner;

--
-- TOC entry 3415 (class 0 OID 73728)
-- Dependencies: 218
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.accounts (user_id, username, password, role, is_active, full_name, email, phone, address, image_url, loyalty_points, member_tier, special_notes, created_at, updated_at) FROM stdin;
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22	manager_user1	$2b$12$Gy61pzXsDY8szmmky5WwKu1lDsCir10YfMRcOUqD9oE/nwnC0UAzm	admin	t	\N	\N	\N	\N	\N	0	Thường	\N	2026-06-09 14:10:31.157475+00	2026-06-09 14:10:31.157475+00
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33	staff_user1	$2b$12$Pttv3d5HOTG8jWRC/nopJeIH3JEu/HYAijeUwcgSVTnS7xc8igQXe	user	t	\N	\N	\N	\N	\N	0	Thường	\N	2026-06-09 14:10:31.157475+00	2026-06-09 14:10:31.157475+00
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44	driver_user1	$2b$12$2WA6N3l5sy4HDq5Tf3D8Q.wiMo.NR9pyfDDECaialGRX0iBnxyZju	user	t	\N	\N	\N	\N	\N	0	Thường	\N	2026-06-09 14:10:31.157475+00	2026-06-09 14:10:31.157475+00
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55	customer_user1	$2b$12$ri8leoxMmO5iSIZxnK2Az.EYWC6kO.r8mQRi2CXsCfh5PqBWOTv9m	user	t	\N	\N	\N	\N	\N	0	Thường	\N	2026-06-09 14:10:31.157475+00	2026-06-09 14:10:31.157475+00
596e0d21-41e5-4cc1-bf8a-067156cdfb87	sun_962005	$2b$12$c5zhJJ9ttQJq8HCeUNBsJuOm3qDmCg4mLwJ.owkSnh4wsKUKb866.	user	t	t vn	abc@gmail.com	0123456789	Chưa cập nhật	https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif	0	Thường	\N	2026-06-10 04:27:44.431684+00	2026-06-10 04:27:44.431684+00
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11	admin_user1	$2b$12$admqZd2OIevRab9nUuLnju0t1XR6/44ATNzkyi9FI.oHYiDTw50TK	admin	t	Nguyễn Diệu Lynh	admin_user1@example.com		Chưa cập nhật	https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif	0	Thường	\N	2026-06-09 14:10:31.157475+00	2026-06-13 12:21:23.94588+00
\.


--
-- TOC entry 3264 (class 2606 OID 73747)
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- TOC entry 3266 (class 2606 OID 73743)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3268 (class 2606 OID 73745)
-- Name: accounts accounts_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_username_key UNIQUE (username);


--
-- TOC entry 3269 (class 1259 OID 74181)
-- Name: idx_accounts_role; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_accounts_role ON public.accounts USING btree (role);


-- Completed on 2026-06-13 22:41:57 +07

--
-- PostgreSQL database dump complete
--

\unrestrict pFF8kKUJWyxzVgOtCM3ONsYBQZ5Z3BgveFwWN6s9Swio3yfNUbubQ2SBFfUfFqX
