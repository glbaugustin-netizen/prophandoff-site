-- Messagerie de support (bouton « Contacter le dev ») : tickets ouverts par les
-- visiteurs connectés, fil de discussion avec le dev. Tout passe par les routes
-- app/api/support/* avec la clé service_role ; les clés publiques n'ont accès à rien.
-- À exécuter une fois : Supabase → SQL Editor → New query → Run. Rejouable sans risque.

create table if not exists public.support_tickets (
  id            uuid primary key default gen_random_uuid(),
  -- Identifiant Auth.js (« google:<sub> », cf. auth.ts), comme downloads.user_id.
  user_id       text not null,
  user_name     text,
  user_email    text,
  kind          text not null check (kind in ('bug', 'feature', 'question')),
  subject       text not null check (char_length(subject) between 1 and 120),
  status        text not null default 'open' check (status in ('open', 'closed')),
  last_author   text not null default 'user' check (last_author in ('user', 'dev')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  user_read_at  timestamptz,
  dev_read_at   timestamptz
);

create index if not exists support_tickets_user_idx on public.support_tickets (user_id, updated_at desc);
create index if not exists support_tickets_updated_idx on public.support_tickets (updated_at desc);

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets (id) on delete cascade,
  author      text not null check (author in ('user', 'dev')),
  -- Compte qui a écrit (sert à la limite de messages par fenêtre de 10 min).
  author_id   text not null,
  body        text not null check (char_length(body) between 1 and 4000),
  created_at  timestamptz not null default now()
);

create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at);
create index if not exists support_messages_author_idx on public.support_messages (author_id, created_at desc);

-- Comptes Google qui répondent en tant que « dev », par adresse e-mail (en
-- minuscules). Pour en ajouter un :
--   insert into public.support_admins (email) values ('adresse@gmail.com');
create table if not exists public.support_admins (
  email text primary key check (email = lower(email))
);

-- Chaque message met son ticket à jour : date, dernier auteur, lecture par
-- l'auteur, et réouverture quand c'est le visiteur qui écrit.
create or replace function public.support_touch_ticket() returns trigger
language plpgsql as $$
begin
  update public.support_tickets set
    updated_at   = new.created_at,
    last_author  = new.author,
    status       = case when new.author = 'user' then 'open' else status end,
    user_read_at = case when new.author = 'user' then new.created_at else user_read_at end,
    dev_read_at  = case when new.author = 'dev' then new.created_at else dev_read_at end
  where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists support_messages_touch on public.support_messages;
create trigger support_messages_touch
  after insert on public.support_messages
  for each row execute function public.support_touch_ticket();

-- RLS sans policy et droits explicites : seule la clé service_role lit et écrit,
-- quel que soit le réglage « Automatically expose new tables ».
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_admins enable row level security;
revoke all on public.support_tickets, public.support_messages, public.support_admins from anon, authenticated;
revoke all on function public.support_touch_ticket() from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on public.support_tickets to service_role;
grant select, insert on public.support_messages to service_role;
grant select on public.support_admins to service_role;
grant execute on function public.support_touch_ticket() to service_role;
