-- Departments
insert into departments (id, name) values
  ('11111111-1111-1111-1111-111111111111','Engineering'),
  ('22222222-2222-2222-2222-222222222222','Sales');

-- Working schedule (single default 40hr/week)
insert into working_schedules (id, name, type, weekly_hours) values
  ('33333333-3333-3333-3333-333333333333','Standard 40hr','standard',40);

insert into schedule_days (schedule_id, day, start_time, end_time, break_minutes) values
  ('33333333-3333-3333-3333-333333333333','mon','09:00','18:00',60),
  ('33333333-3333-3333-3333-333333333333','tue','09:00','18:00',60),
  ('33333333-3333-3333-3333-333333333333','wed','09:00','18:00',60),
  ('33333333-3333-3333-3333-333333333333','thu','09:00','18:00',60),
  ('33333333-3333-3333-3333-333333333333','fri','09:00','18:00',60);

-- Salary structure + rules (Basic, HRA allowance, PF deduction, Gross, Net)
insert into salary_structures (id, name, active) values
  ('44444444-4444-4444-4444-444444444444','Standard Monthly','t');

insert into salary_rules (structure_id, name, code, category, sequence, computation_type, fixed_amount, percentage, percentage_of_code, formula_expression) values
  ('44444444-4444-4444-4444-444444444444','Basic Salary','BASIC','basic',10,'fixed',30000,null,null,null),
  ('44444444-4444-4444-4444-444444444444','HRA Allowance','HRA','allowance',20,'percentage',null,40,'BASIC',null),
  ('44444444-4444-4444-4444-444444444444','PF Deduction','PF','deduction',30,'percentage',null,12,'BASIC',null),
  ('44444444-4444-4444-4444-444444444444','Gross Salary','GROSS','gross',40,'formula',null,null,null,'BASIC + HRA'),
  ('44444444-4444-4444-4444-444444444444','Net Salary','NET','net',50,'formula',null,null,null,'GROSS - PF');

-- Time off types
insert into time_off_types (id, name, unit, requires_allocation, requires_approval) values
  ('55555555-5555-5555-5555-555555555555','Paid Leave','days', true, true),
  ('66666666-6666-6666-6666-666666666666','Unpaid Leave','days', false, true);

-- Employees (7)
insert into employees (id, name, email, phone, department_id, job_position, schedule_id, employee_type, status) values
  ('e1111111-0000-0000-0000-000000000001','Aarav Shah','aarav.shah@example.com','9000000001','11111111-1111-1111-1111-111111111111','Software Engineer','33333333-3333-3333-3333-333333333333','full_time','active'),
  ('e1111111-0000-0000-0000-000000000002','Priya Mehta','priya.mehta@example.com','9000000002','11111111-1111-1111-1111-111111111111','Senior Engineer','33333333-3333-3333-3333-333333333333','full_time','active'),
  ('e1111111-0000-0000-0000-000000000003','Rohan Iyer','rohan.iyer@example.com','9000000003','22222222-2222-2222-2222-222222222222','Sales Executive','33333333-3333-3333-3333-333333333333','full_time','active'),
  ('e1111111-0000-0000-0000-000000000004','Sneha Kapoor','sneha.kapoor@example.com','9000000004','22222222-2222-2222-2222-222222222222','Sales Manager','33333333-3333-3333-3333-333333333333','full_time','active'),
  ('e1111111-0000-0000-0000-000000000005','Karan Verma','karan.verma@example.com','9000000005','11111111-1111-1111-1111-111111111111','QA Engineer','33333333-3333-3333-3333-333333333333','contract','active'),
  ('e1111111-0000-0000-0000-000000000006','Anita Desai','anita.desai@example.com','9000000006','11111111-1111-1111-1111-111111111111','Intern','33333333-3333-3333-3333-333333333333','part_time','active'),
  ('e1111111-0000-0000-0000-000000000007','Vikram Nair','vikram.nair@example.com','9000000007','22222222-2222-2222-2222-222222222222','Sales Associate','33333333-3333-3333-3333-333333333333','full_time','inactive');

update employees set manager_id = 'e1111111-0000-0000-0000-000000000002' where id = 'e1111111-0000-0000-0000-000000000001';
update employees set manager_id = 'e1111111-0000-0000-0000-000000000004' where id = 'e1111111-0000-0000-0000-000000000003';

-- Contracts (active, using the seeded structure)
insert into contracts (employee_id, department_id, job_position, start_date, end_date, wage, structure_id, status) values
  ('e1111111-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Software Engineer','2025-01-01',null,30000,'44444444-4444-4444-4444-444444444444','active'),
  ('e1111111-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Senior Engineer','2024-06-01',null,45000,'44444444-4444-4444-4444-444444444444','active'),
  ('e1111111-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Sales Executive','2025-02-01',null,25000,'44444444-4444-4444-4444-444444444444','active'),
  ('e1111111-0000-0000-0000-000000000004','22222222-2222-2222-2222-222222222222','Sales Manager','2023-11-01',null,55000,'44444444-4444-4444-4444-444444444444','active'),
  ('e1111111-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','QA Engineer','2025-08-01','2026-09-25',28000,'44444444-4444-4444-4444-444444444444','active');
  -- ^ intentionally ends within 30 days of "today" in the seed's implied demo window, to populate the "contract needing attention" dashboard alert

-- Attendance rows for the current month (sample subset)
insert into attendance (employee_id, check_in, check_out, status) values
  ('e1111111-0000-0000-0000-000000000001', now() - interval '1 day' + interval '9 hour', now() - interval '1 day' + interval '18 hour', 'present'),
  ('e1111111-0000-0000-0000-000000000002', now() - interval '1 day' + interval '9 hour 20 min', now() - interval '1 day' + interval '18 hour', 'late'),
  ('e1111111-0000-0000-0000-000000000003', now() - interval '1 day' + interval '9 hour', null, 'missing_checkout'),
  ('e1111111-0000-0000-0000-000000000004', now() - interval '2 day' + interval '9 hour', now() - interval '2 day' + interval '18 hour', 'present');

-- One draft payrun so the Payruns screen isn't empty on demo day
insert into payruns (period_start, period_end, structure_id, status) values
  (date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month - 1 day')::date, '44444444-4444-4444-4444-444444444444', 'draft');
