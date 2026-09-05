-- ============================================================
-- PeoplePay360 -- initial schema
-- ============================================================
create extension if not exists "uuid-ossp";

create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table working_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'standard',
  weekly_hours numeric not null default 0
);

create table schedule_days (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid not null references working_schedules(id) on delete cascade,
  day text not null check (day in ('mon','tue','wed','thu','fri','sat','sun')),
  start_time time,
  end_time time,
  break_minutes int not null default 0
);

create table employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  phone text,
  department_id uuid references departments(id),
  manager_id uuid references employees(id),
  job_position text,
  schedule_id uuid references working_schedules(id),
  employee_type text not null default 'full_time' check (employee_type in ('full_time','part_time','contract')),
  bank_details text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id uuid references employees(id),
  role text not null check (role in ('employee','hr_payroll','admin')),
  can_edit_salary_config boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table salary_structures (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  active boolean not null default true
);

create table salary_rules (
  id uuid primary key default uuid_generate_v4(),
  structure_id uuid not null references salary_structures(id) on delete cascade,
  name text not null,
  code text not null,
  category text not null check (category in ('basic','allowance','deduction','gross','net')),
  sequence int not null default 10,
  computation_type text not null check (computation_type in ('fixed','percentage','formula')),
  fixed_amount numeric,
  percentage numeric,
  percentage_of_code text,
  formula_expression text,
  unique (structure_id, code)
);

create table contracts (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  department_id uuid references departments(id),
  job_position text,
  start_date date not null,
  end_date date,
  wage numeric not null,
  structure_id uuid references salary_structures(id),
  status text not null default 'draft' check (status in ('active','expired','draft')),
  created_at timestamptz not null default now()
);

create or replace function check_contract_overlap() returns trigger as $$
begin
  if new.status = 'active' then
    if exists (
      select 1 from contracts
      where employee_id = new.employee_id
        and status = 'active'
        and id <> coalesce(new.id, uuid_nil())
        and daterange(start_date, coalesce(end_date, 'infinity'::date), '[]')
            && daterange(new.start_date, coalesce(new.end_date, 'infinity'::date), '[]')
    ) then
      raise exception 'Overlapping active contract exists for this employee';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_contract_overlap
before insert or update on contracts
for each row execute function check_contract_overlap();

create table attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz,
  worked_hours numeric generated always as (
    case when check_out is not null
      then round(extract(epoch from (check_out - check_in)) / 3600.0, 2)
      else null end
  ) stored,
  status text not null default 'present' check (status in ('present','late','absent','missing_checkout')),
  created_at timestamptz not null default now()
);

create table time_off_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  unit text not null check (unit in ('days','hours')),
  requires_allocation boolean not null default true,
  requires_approval boolean not null default true
);

create table allocations (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  type_id uuid not null references time_off_types(id),
  allocated numeric not null default 0,
  taken numeric not null default 0,
  valid_from date not null,
  valid_to date,
  status text not null default 'pending' check (status in ('pending','approved'))
);

create table time_off_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  type_id uuid not null references time_off_types(id),
  start_date date not null,
  end_date date not null,
  duration numeric not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','refused')),
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table payruns (
  id uuid primary key default uuid_generate_v4(),
  period_start date not null,
  period_end date not null,
  structure_id uuid not null references salary_structures(id),
  status text not null default 'draft' check (status in ('draft','computed','validated','paid')),
  created_at timestamptz not null default now()
);

create table payslips (
  id uuid primary key default uuid_generate_v4(),
  payrun_id uuid not null references payruns(id) on delete cascade,
  employee_id uuid not null references employees(id),
  contract_id uuid references contracts(id),
  worked_days numeric,
  gross numeric not null default 0,
  net numeric not null default 0,
  status text not null default 'draft' check (status in ('draft','computed','validated','paid')),
  unique (payrun_id, employee_id)
);

create table payslip_lines (
  id uuid primary key default uuid_generate_v4(),
  payslip_id uuid not null references payslips(id) on delete cascade,
  rule_id uuid references salary_rules(id),
  name text not null,
  category text not null,
  amount numeric not null
);

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  user_id uuid,
  timestamp timestamptz not null default now(),
  reason text
);

create or replace function auth_role() returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth_employee_id() returns uuid as $$
  select employee_id from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth_can_edit_salary() returns boolean as $$
  select (role = 'admin') or (role = 'hr_payroll' and can_edit_salary_config)
  from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table departments enable row level security;
alter table working_schedules enable row level security;
alter table schedule_days enable row level security;
alter table employees enable row level security;
alter table profiles enable row level security;
alter table salary_structures enable row level security;
alter table salary_rules enable row level security;
alter table contracts enable row level security;
alter table attendance enable row level security;
alter table time_off_types enable row level security;
alter table allocations enable row level security;
alter table time_off_requests enable row level security;
alter table payruns enable row level security;
alter table payslips enable row level security;
alter table payslip_lines enable row level security;
alter table audit_log enable row level security;

create policy dept_select on departments for select using (auth.role() = 'authenticated');
create policy dept_write on departments for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy sched_select on working_schedules for select using (auth.role() = 'authenticated');
create policy sched_write on working_schedules for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy sched_days_select on schedule_days for select using (auth.role() = 'authenticated');
create policy sched_days_write on schedule_days for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy tot_select on time_off_types for select using (auth.role() = 'authenticated');
create policy tot_write on time_off_types for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy emp_select on employees for select using (
  auth_role() in ('hr_payroll','admin') or id = auth_employee_id()
);
create policy emp_write on employees for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy profiles_self_select on profiles for select using (id = auth.uid() or auth_role() = 'admin');
create policy profiles_admin_write on profiles for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

create policy contracts_select on contracts for select using (
  auth_role() in ('hr_payroll','admin') or employee_id = auth_employee_id()
);
create policy contracts_write on contracts for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy attendance_select on attendance for select using (
  auth_role() in ('hr_payroll','admin') or employee_id = auth_employee_id()
);
create policy attendance_self_insert on attendance for insert with check (
  employee_id = auth_employee_id() or auth_role() in ('hr_payroll','admin')
);
create policy attendance_write on attendance for update using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));
create policy attendance_delete on attendance for delete using (auth_role() in ('hr_payroll','admin'));

create policy alloc_select on allocations for select using (
  auth_role() in ('hr_payroll','admin') or employee_id = auth_employee_id()
);
create policy alloc_write on allocations for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy tor_select on time_off_requests for select using (
  auth_role() in ('hr_payroll','admin') or employee_id = auth_employee_id()
);
create policy tor_self_insert on time_off_requests for insert with check (
  (employee_id = auth_employee_id() and status = 'pending') or auth_role() in ('hr_payroll','admin')
);
create policy tor_write on time_off_requests for update using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy struct_select on salary_structures for select using (auth_role() in ('hr_payroll','admin'));
create policy struct_write on salary_structures for all using (auth_can_edit_salary()) with check (auth_can_edit_salary());

create policy rules_select on salary_rules for select using (auth_role() in ('hr_payroll','admin'));
create policy rules_write on salary_rules for all using (auth_can_edit_salary()) with check (auth_can_edit_salary());

create policy payruns_all on payruns for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy payslips_select on payslips for select using (
  auth_role() in ('hr_payroll','admin') or employee_id = auth_employee_id()
);
create policy payslips_write on payslips for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy payslip_lines_select on payslip_lines for select using (
  auth_role() in ('hr_payroll','admin')
  or exists (select 1 from payslips p where p.id = payslip_id and p.employee_id = auth_employee_id())
);
create policy payslip_lines_write on payslip_lines for all using (auth_role() in ('hr_payroll','admin')) with check (auth_role() in ('hr_payroll','admin'));

create policy audit_select on audit_log for select using (auth_role() = 'admin');
