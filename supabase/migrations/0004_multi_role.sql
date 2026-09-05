-- ============================================================
-- 0004_multi_role.sql
-- Spec: "When creating a user, link the account to the relevant
-- employee and assign one or more roles." profiles.role only
-- ever stored a single value. Add a real roles array as the
-- source of truth for what a user can do, while keeping `role`
-- around (auto-derived) as the single "primary" role used for
-- nav/landing-page purposes only.
--
-- Note: every existing permission check in this app (API route
-- gating, RLS helpers like auth_is_hr()/auth_is_payroll(), the
-- sidebar) is a single-role check against a set that happens to
-- be an upward-closed prefix of one strict privilege order
-- (admin > hr_payroll_manager > hr_payroll_user > hr_manager >
-- employee). As long as `role` is kept in sync as the HIGHEST-
-- PRIORITY entry in `roles`, all of those existing checks keep
-- giving the correct answer even when a profile has multiple
-- roles — so none of them need to change. Only user creation/
-- editing needed to move to the array.
-- ============================================================

alter table profiles add column if not exists roles text[] not null default '{}';

update profiles set roles = array[role] where roles = '{}';

alter table profiles
  add constraint profiles_roles_check
  check (roles <@ array['employee','hr_manager','hr_payroll_user','hr_payroll_manager','admin']::text[]);

alter table profiles
  add constraint profiles_roles_not_empty
  check (array_length(roles, 1) > 0);

create or replace function sync_primary_role() returns trigger as $$
declare
  priority text[] := array['admin','hr_payroll_manager','hr_payroll_user','hr_manager','employee'];
  r text;
begin
  foreach r in array priority loop
    if r = any(new.roles) then
      new.role := r;
      return new;
    end if;
  end loop;
  new.role := new.roles[1];
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_sync_primary_role on profiles;
create trigger profiles_sync_primary_role
  before insert or update of roles on profiles
  for each row execute function sync_primary_role();