-- Table des téléchargements : alimentée par app/api/download/[addon]/route.ts,
-- lue par app/dashboard/page.tsx, toujours avec la clé service_role côté serveur.
-- À exécuter une fois : Supabase → SQL Editor → New query → Run. Rejouable sans risque.

create table if not exists public.downloads (
  id          uuid primary key default gen_random_uuid(),
  -- Identifiant Auth.js (« google:<sub> », cf. auth.ts), pas un utilisateur
  -- Supabase Auth : d'où `text` et aucune clé étrangère vers auth.users.
  user_id     text not null,
  addon_slug  text not null,
  version     text not null,
  created_at  timestamptz not null default now()
);

-- Requête du dashboard : where user_id = … order by created_at desc
create index if not exists downloads_user_id_created_at_idx
  on public.downloads (user_id, created_at desc);

-- RLS activée sans aucune policy : les clés anon / authenticated n'ont accès à rien,
-- seule la clé service_role (qui contourne la RLS) lit et écrit. Les droits sont
-- donnés explicitement pour ne pas dépendre de l'option « Automatically expose new tables ».
alter table public.downloads enable row level security;
revoke all on public.downloads from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert on public.downloads to service_role;
