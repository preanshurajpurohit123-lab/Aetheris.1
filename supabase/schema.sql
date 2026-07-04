-- ============================================================================
-- AETHERIS DATABASE
-- 01_schema.sql
-- Version: 1.1
-- Description: Core database schema
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES
-- ============================================================================

create table if not exists public.profiles (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    full_name text default '',

    username text unique not null,

    avatar_url text default '',

    last_login timestamptz,

    created_at timestamptz
        default now(),

    updated_at timestamptz
        default now()

);

-- ============================================================================
-- PORTFOLIOS
-- ============================================================================

create table if not exists public.portfolios (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        not null
        unique
        references public.profiles(id)
        on delete cascade,

    currency varchar(3)
        default 'INR'
        not null,

    cash_balance numeric(15,2)
        default 1000000
        check (cash_balance >= 0),

    available_cash numeric(15,2)
        default 1000000
        check (available_cash >= 0),

    invested_amount numeric(15,2)
        default 0
        check (invested_amount >= 0),

    total_value numeric(15,2)
        default 1000000
        check (total_value >= 0),

    total_profit numeric(15,2)
        default 0,

    total_return_percent numeric(10,4)
        default 0,

    day_change numeric(15,2)
        default 0,

    day_change_percent numeric(10,4)
        default 0,

    risk_level varchar(20)
        default 'MODERATE',

    strategy varchar(50)
        default 'BALANCED',

    last_updated timestamptz
        default now(),

    created_at timestamptz
        default now(),

    updated_at timestamptz
        default now()

);

-- ============================================================================
-- HOLDINGS
-- ============================================================================

create table if not exists public.holdings (

    id uuid
        default gen_random_uuid()
        primary key,

    portfolio_id uuid
        not null
        references public.portfolios(id)
        on delete cascade,

    symbol varchar(20)
        not null,

    quantity numeric(18,6)
        default 0
        check (quantity >= 0),

    average_price numeric(15,4)
        default 0
        check (average_price >= 0),

    pnl numeric(15,2)
        default 0,

    created_at timestamptz
        default now(),

    updated_at timestamptz
        default now(),

    constraint holdings_unique
    unique(portfolio_id,symbol)

);

-- ============================================================================
-- WATCHLIST
-- ============================================================================

create table if not exists public.watchlists (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        not null
        references public.profiles(id)
        on delete cascade,

    symbol varchar(20)
        not null,

    company_name text
        default '',

    exchange varchar(20)
        default '',

    created_at timestamptz
        default now(),

    constraint watchlist_unique
    unique(user_id,symbol)

);

-- ============================================================================
-- PAPER ORDERS
-- ============================================================================

create table if not exists public.paper_orders (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        not null
        references public.profiles(id)
        on delete cascade,

    symbol varchar(20)
        not null,

    type varchar(10)
        check(type in ('BUY','SELL')),

    quantity numeric(18,6)
        not null
        check (quantity > 0),

    price numeric(15,4)
        not null
        check (price > 0),

    status varchar(20)
        default 'PENDING'
        check(status in
        ('PENDING','COMPLETED','CANCELLED','REJECTED')),

    created_at timestamptz
        default now()

);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

create table if not exists public.transactions (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        references public.profiles(id)
        on delete cascade,

    order_id uuid
        references public.paper_orders(id)
        on delete set null,

    symbol varchar(20),

    action varchar(20)
        check(action in ('BUY','SELL','REBALANCE')),

    quantity numeric(18,6)
        check (quantity > 0),

    price numeric(15,4)
        check (price > 0),

    total numeric(15,2)
        check (total >= 0),

    fees numeric(15,2)
        default 0,

    currency varchar(3)
        default 'INR',

    execution_time timestamptz
        default now(),

    created_at timestamptz
        default now()

);

-- ============================================================================
-- AI CHAT
-- ============================================================================

create table if not exists public.ai_chat_history (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        references public.profiles(id)
        on delete cascade,

    conversation_id uuid
        default gen_random_uuid(),

    role varchar(20)
        check(role in ('user','assistant','system')),

    model_name text,

    tokens_used integer
        default 0,

    message text
        not null,

    metadata jsonb
        default '{}'::jsonb,

    created_at timestamptz
        default now()

);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists public.notifications (

    id uuid
        default gen_random_uuid()
        primary key,

    user_id uuid
        references public.profiles(id)
        on delete cascade,

    title text not null,

    message text not null,

    read boolean
        default false,

    created_at timestamptz
        default now()

);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_portfolio_user
on public.portfolios(user_id);

create index if not exists idx_holding_portfolio
on public.holdings(portfolio_id);

create index if not exists idx_orders_user
on public.paper_orders(user_id);

create index if not exists idx_transactions_user
on public.transactions(user_id);

create index if not exists idx_ai_user
on public.ai_chat_history(user_id);

create index if not exists idx_notification_user
on public.notifications(user_id);

create index if not exists idx_profile_username
on public.profiles(username);

create index if not exists idx_watchlist_symbol
on public.watchlists(symbol);

create index if not exists idx_transaction_order
on public.transactions(order_id);
