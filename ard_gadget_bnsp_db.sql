--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Homebrew)
-- Dumped by pg_dump version 17.2 (Homebrew)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ardelinggapramestakusuma
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ardelinggapramestakusuma;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: ardelinggapramestakusuma
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CashflowType; Type: TYPE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TYPE public."CashflowType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."CashflowType" OWNER TO ardelinggapramestakusuma;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ardelinggapramestakusuma;

--
-- Name: cashflow; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.cashflow (
    id integer NOT NULL,
    type public."CashflowType" NOT NULL,
    value double precision NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.cashflow OWNER TO ardelinggapramestakusuma;

--
-- Name: cashflow_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.cashflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cashflow_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: cashflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.cashflow_id_seq OWNED BY public.cashflow.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255),
    is_deleted boolean DEFAULT false,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.categories OWNER TO ardelinggapramestakusuma;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: detail_transactions; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.detail_transactions (
    id integer NOT NULL,
    transaction_id integer,
    product_id integer,
    quantity integer,
    total_price double precision,
    total_profit double precision,
    product_json text,
    is_deleted boolean DEFAULT false,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.detail_transactions OWNER TO ardelinggapramestakusuma;

--
-- Name: detail_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.detail_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detail_transactions_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: detail_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.detail_transactions_id_seq OWNED BY public.detail_transactions.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.products (
    id integer NOT NULL,
    code character varying(255),
    name character varying(255),
    price double precision,
    profit double precision,
    category_id integer,
    stock integer,
    image_url text,
    is_deleted boolean DEFAULT false,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.products OWNER TO ardelinggapramestakusuma;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    code_transaction character varying(255),
    customer_name character varying(255),
    grand_total integer,
    total_payment integer,
    money_changes integer,
    is_deleted boolean DEFAULT false,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.transactions OWNER TO ardelinggapramestakusuma;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name_business character varying(255),
    email character varying(255),
    phone_number character varying(20),
    address text,
    password character varying(255),
    is_deleted boolean DEFAULT false,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.users OWNER TO ardelinggapramestakusuma;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ardelinggapramestakusuma;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cashflow id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.cashflow ALTER COLUMN id SET DEFAULT nextval('public.cashflow_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: detail_transactions id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.detail_transactions ALTER COLUMN id SET DEFAULT nextval('public.detail_transactions_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d205ce3a-2fd3-4a46-af2d-557f2c61739f	173a75efbbca2a5d70171e82d5c395a3589ecc9db28451781fdd845fdf269c7e	2025-03-07 22:14:10.742922+07	20250307151410_create_tables_ard_gadget_bnsp_db	\N	\N	2025-03-07 22:14:10.717469+07	1
\.


--
-- Data for Name: cashflow; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.cashflow (id, type, value, description, date, is_deleted, created_at, updated_at, user_id, uuid) FROM stdin;
1	INCOME	28000000	Income dari transaksi #TRX-1741362054564	2025-03-07 15:40:54.571	f	2025-03-07 15:40:54.572	2025-03-07 15:40:54.572	1	92faab40-327c-4b62-a26d-d704df204d15
2	INCOME	7000000	Income dari transaksi #TRX-1741362217357	2025-03-07 15:43:37.363	f	2025-03-07 15:43:37.364	2025-03-07 15:43:37.364	1	2000d595-d042-45b4-bd26-4385755ef2d7
3	INCOME	18000000	Income dari transaksi #TRX-1741362301197	2025-03-07 15:45:01.204	f	2025-03-07 15:45:01.205	2025-03-07 15:45:01.205	1	518b3319-adfc-473e-bbee-7fde3d81c05e
4	EXPENSE	10000000	Belanja bulanan beli gadget	2025-03-06 17:00:00	f	2025-03-07 15:45:43.398	2025-03-07 15:45:43.398	1	b2d42fb6-0904-4ec6-b0eb-d29dfef2c1cc
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.categories (id, name, is_deleted, updated_at, created_at, created_by, uuid) FROM stdin;
1	Smartphone	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	07b39159-6ad3-4b8c-b763-11be17e0c003
2	Laptop	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	6afd8fa7-f090-41cf-bb75-ce01f0a8f22c
3	Tablet	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	607b0113-d7f5-4214-8060-db1aae77946d
4	Aksesoris	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	2c4f9d6e-78bc-4e25-89fb-18fdaf583a9d
5	Perangkat Wearable	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	588e998b-f66d-4adc-858c-5333d9b88337
6	Perangkat Audio	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	774ae3bf-0cb6-4adb-97a9-423d1b0eba74
7	Kamera	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	a5e51c7d-429b-4972-a04c-4599f316e57b
8	Komponen PC	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	405a49d7-971f-42a0-8f56-51754dfdfbe3
9	Peralatan Jaringan	f	2025-03-07 22:14:21.71359	2025-03-07 22:14:21.71359	1	63f360e8-71ea-431f-92f2-0fa9b637bc1e
\.


--
-- Data for Name: detail_transactions; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.detail_transactions (id, transaction_id, product_id, quantity, total_price, total_profit, product_json, is_deleted, updated_at, created_at) FROM stdin;
1	1	2	2	28000000	5600000	{"id":2,"name":"Samsung Galaxy S23","price":14000000,"profit":2800000}	f	2025-03-07 15:40:54.568	2025-03-07 15:40:54.568
2	2	5	1	7000000	1400000	{"id":5,"name":"Bose QuietComfort 45","price":7000000,"profit":1400000}	f	2025-03-07 15:43:37.361	2025-03-07 15:43:37.361
3	3	4	1	18000000	3600000	{"id":4,"name":"iPad Pro 12.9-inch","price":18000000,"profit":3600000}	f	2025-03-07 15:45:01.202	2025-03-07 15:45:01.202
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.products (id, code, name, price, profit, category_id, stock, image_url, is_deleted, updated_at, created_at, created_by, uuid) FROM stdin;
1	PRD-1741361497013	iPhone 14 Pro	15000000	3000000	1	50	http://localhost:3001/storage/products/1741361497013-8395735203174096.jpg	f	2025-03-07 15:31:37.014	2025-03-07 15:31:37.014	1	e36bdb40-b8e4-409b-85ba-4d1801df71ab
2	PRD-1741361660681	Samsung Galaxy S23	14000000	2800000	1	40	http://localhost:3001/storage/products/1741361660681-810839270SCR-20250307-tmsc.png	f	2025-03-07 15:34:20.682	2025-03-07 15:34:20.682	1	bbb451f6-306d-4e55-ad33-0ec0086ecd7e
3	PRD-1741361727778	MacBook Pro 16-inch	25000000	5000000	2	30	http://localhost:3001/storage/products/1741361727778-2937069325b14c9b3-09ed-45fc-b92c-390ec72221de.jpg	f	2025-03-07 15:35:27.779	2025-03-07 15:35:27.779	1	11cde7f0-de3f-4cb3-b150-5677ad9734d1
4	PRD-1741361790510	iPad Pro 12.9-inch	18000000	3600000	3	25	http://localhost:3001/storage/products/1741361790510-523374200SCR-20250307-tnlk.jpeg	f	2025-03-07 15:36:30.511	2025-03-07 15:36:30.511	1	ecae3769-6352-4247-8def-e99f016e1e1e
5	PRD-1741361873037	Bose QuietComfort 45	7000000	1400000	4	15	http://localhost:3001/storage/products/1741361873037-534385714SCR-20250307-tnyt.jpeg	f	2025-03-07 15:37:53.038	2025-03-07 15:37:53.038	1	cda2d7b6-74de-4da4-a8a0-d7d2ab5ead57
6	PRD-1741361929340	Sony WH-1000XM5	8000000	1600000	4	20	http://localhost:3001/storage/products/1741361929340-9039486559794b917-133f-4a6c-8fb9-82b45241b356.jpg	f	2025-03-07 15:38:49.341	2025-03-07 15:38:49.341	1	3a2b8613-1154-42bf-a287-0146c788923d
7	PRD-1741362005716	Logitech G Pro X	3000000	600000	5	100	http://localhost:3001/storage/products/1741362005716-785163838SCR-20250307-tosy.jpeg	f	2025-03-07 15:40:05.717	2025-03-07 15:40:05.717	1	7f429419-84d2-400d-a727-70e73d871d85
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.transactions (id, code_transaction, customer_name, grand_total, total_payment, money_changes, is_deleted, updated_at, created_at, created_by) FROM stdin;
1	TRX-1741362054564	Arde	28000000	30000000	2000000	f	2025-03-07 15:40:54.565	2025-03-07 15:40:54.565	1
2	TRX-1741362217357	Lingga	7000000	10000000	3000000	f	2025-03-07 15:43:37.358	2025-03-07 15:43:37.358	1
3	TRX-1741362301197	Kusuma	18000000	20000000	2000000	f	2025-03-07 15:45:01.197	2025-03-07 15:45:01.197	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ardelinggapramestakusuma
--

COPY public.users (id, name_business, email, phone_number, address, password, is_deleted, updated_at, created_at, uuid) FROM stdin;
1	Toko Gadget Ardelingga	ard_gadget@gmail.com	0811321321124	Jakarta	$2b$10$.NgvnOY9jNjBJyLwuSZ.cuzgTDxFl7grrtCIfJQxSeLtg41/ykjka	f	2025-03-07 15:15:53.906	2025-03-07 15:15:53.906	cf211145-7650-4c6f-bac4-574d30fd90d9
\.


--
-- Name: cashflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.cashflow_id_seq', 4, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- Name: detail_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.detail_transactions_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.products_id_seq', 7, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.transactions_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ardelinggapramestakusuma
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: cashflow cashflow_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.cashflow
    ADD CONSTRAINT cashflow_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: detail_transactions detail_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.detail_transactions
    ADD CONSTRAINT detail_transactions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cashflow_uuid_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX cashflow_uuid_key ON public.cashflow USING btree (uuid);


--
-- Name: categories_uuid_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX categories_uuid_key ON public.categories USING btree (uuid);


--
-- Name: products_uuid_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX products_uuid_key ON public.products USING btree (uuid);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phone_number_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX users_phone_number_key ON public.users USING btree (phone_number);


--
-- Name: users_uuid_key; Type: INDEX; Schema: public; Owner: ardelinggapramestakusuma
--

CREATE UNIQUE INDEX users_uuid_key ON public.users USING btree (uuid);


--
-- Name: cashflow cashflow_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.cashflow
    ADD CONSTRAINT cashflow_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: categories categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detail_transactions detail_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.detail_transactions
    ADD CONSTRAINT detail_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: detail_transactions detail_transactions_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.detail_transactions
    ADD CONSTRAINT detail_transactions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ardelinggapramestakusuma
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ardelinggapramestakusuma
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

