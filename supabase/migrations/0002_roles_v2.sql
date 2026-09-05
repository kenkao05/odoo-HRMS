-- ============================================================
-- 0002_roles_v2.sql
-- Expand profiles.role from 3 values to the 5 PRD roles:
--   employee | hr_manager | hr_payroll_user | hr_payroll_manager | admin
-- Drop the can_edit_salary_config boolean (role carries that meaning).
-- Rewrite RLS helpers + policies accordingly.
-- ============================================================

-- 1) Migrate existing rows before tightening the check constraint.
--    Old hr_payroll + can_edit_salary_config=true  -> hr_payroll_manager
--    Old hr_payroll + can_edit_salary_config=false -> hr_payroll_user
update profiles
set role = case
  when role = 'hr_payroll' and can_edit_salary_config then 'hr_payroll_manager'
  when role = 'hr_payroll' then 'hr_payroll_user'
  else role
end
where role = 'hr_payroll';

-- 2) Drop the old check constraint (Postgres names it profiles_role_check by default).
alter table profiles drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in (
    'employee',
    'hr_manager',
    'hr_payroll_user',
    'hr_payroll_manager',
    'admin'
  ));

-- 3) Drop the now-redundant boolean.
alter table profiles drop column if exists can_edit_salary_config;

-- 4) Rewrite auth helpers.
create or replace function auth_role() returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function auth_employee_id() returns uuid as $$
  select employee_id from profiles where id = auth.uid();
$$ language sql stable security definer;

-- HR Manager + both payroll roles + admin can manage HR master data.
create or replace function auth_is_hr() returns boolean as $$
  select auth_role() in (
    'hr_manager',
    'hr_payroll_user',
    'hr_payroll_manager',
    'admin'
  );
$$ language sql stable security definer;

-- Only payroll roles + admin see/write payruns & payslips.
create or replace function auth_is_payroll() returns boolean as $$
  select auth_role() in (
    'hr_payroll_user',
    'hr_payroll_manager',
    'admin'
  );
$$ language sql stable security definer;

-- Only HR Payroll Manager + Admin may mutate Salary Structures/Rules
-- and delete Payruns/Payslips.
create or replace function auth_can_edit_salary() returns boolean as $$
  select auth_role() in ('hr_payroll_manager', 'admin');
$$ language sql stable security definer;

-- 5) Drop old policies and recreate with the new helpers.
-- Departments
drop policy if exists dept_write on departments;
create policy dept_write on departments for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Working schedules
drop policy if exists sched_write on working_schedules;
create policy sched_write on working_schedules for all
  using (auth_is_hr()) with check (auth_is_hr());

drop policy if exists sched_days_write on schedule_days;
create policy sched_days_write on schedule_days for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Time off types
drop policy if exists tot_write on time_off_types;
create policy tot_write on time_off_types for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Employees
drop policy if exists emp_select on employees;
create policy emp_select on employees for select using (
  auth_is_hr() or id = auth_employee_id()
);
drop policy if exists emp_write on employees;
create policy emp_write on employees for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Profiles (unchanged semantics — admin only)
-- already uses auth_role() = 'admin'

-- Contracts
drop policy if exists contracts_select on contracts;
create policy contracts_select on contracts for select using (
  auth_is_hr() or employee_id = auth_employee_id()
);
drop policy if exists contracts_write on contracts;
create policy contracts_write on contracts for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Attendance
drop policy if exists attendance_select on attendance;
create policy attendance_select on attendance for select using (
  auth_is_hr() or employee_id = auth_employee_id()
);
drop policy if exists attendance_self_insert on attendance;
create policy attendance_self_insert on attendance for insert with check (
  employee_id = auth_employee_id() or auth_is_hr()
);
drop policy if exists attendance_write on attendance;
create policy attendance_write on attendance for update
  using (auth_is_hr()) with check (auth_is_hr());
drop policy if exists attendance_delete on attendance;
create policy attendance_delete on attendance for delete
  using (auth_is_hr());

-- Allocations
drop policy if exists alloc_select on allocations;
create policy alloc_select on allocations for select using (
  auth_is_hr() or employee_id = auth_employee_id()
);
drop policy if exists alloc_write on allocations;
create policy alloc_write on allocations for all
  using (auth_is_hr()) with check (auth_is_hr());

-- Time off requests
drop policy if exists tor_select on time_off_requests;
create policy tor_select on time_off_requests for select using (
  auth_is_hr() or employee_id = auth_employee_id()
);
drop policy if exists tor_self_insert on time_off_requests;
create policy tor_self_insert on time_off_requests for insert with check (
  (employee_id = auth_employee_id() and status = 'pending') or auth_is_hr()
);
drop policy if exists tor_write on time_off_requests;
create policy tor_write on time_off_requests for update
  using (auth_is_hr()) with check (auth_is_hr());

-- Salary structures: payroll roles can read; only manager+admin write
drop policy if exists struct_select on salary_structures;
create policy struct_select on salary_structures for select using (auth_is_payroll());
drop policy if exists struct_write on salary_structures;
create policy struct_write on salary_structures for all
  using (auth_can_edit_salary()) with check (auth_can_edit_salary());

-- Salary rules
drop policy if exists rules_select on salary_rules;
create policy rules_select on salary_rules for select using (auth_is_payroll());
drop policy if exists rules_write on salary_rules;
create policy rules_write on salary_rules for all
  using (auth_can_edit_salary()) with check (auth_can_edit_salary());

-- Payruns: payroll roles get CRU; only manager+admin may delete
drop policy if exists payruns_all on payruns;
create policy payruns_select on payruns for select using (auth_is_payroll());
create policy payruns_insert on payruns for insert with check (auth_is_payroll());
create policy payruns_update on payruns for update
  using (auth_is_payroll()) with check (auth_is_payroll());
create policy payruns_delete on payruns for delete using (auth_can_edit_salary());

-- Payslips
drop policy if exists payslips_select on payslips;
create policy payslips_select on payslips for select using (
  auth_is_payroll() or employee_id = auth_employee_id()
);
drop policy if exists payslips_write on payslips;
create policy payslips_insert on payslips for insert with check (auth_is_payroll());
create policy payslips_update on payslips for update
  using (auth_is_payroll()) with check (auth_is_payroll());
create policy payslips_delete on payslips for delete using (auth_can_edit_salary());

-- Payslip lines
drop policy if exists payslip_lines_select on payslip_lines;
create policy payslip_lines_select on payslip_lines for select using (
  auth_is_payroll()
  or exists (
    select 1 from payslips p
    where p.id = payslip_id and p.employee_id = auth_employee_id()
  )
);
drop policy if exists payslip_lines_write on payslip_lines;
create policy payslip_lines_write on payslip_lines for all
  using (auth_is_payroll()) with check (auth_is_payroll());
