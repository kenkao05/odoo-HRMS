type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
};

export function DashboardIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function EmployeesIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="7" r="2.6" />
      <path d="M15.5 12.2c2.8.3 5 2.7 5 5.8" />
    </svg>
  );
}

export function ContractsIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4" />
      <path d="M9.5 12.5h6M9.5 15.5h6M9.5 9.5h3" />
    </svg>
  );
}

export function ScheduleIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function AttendanceIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8.5 14.5l2 2 4-4" />
    </svg>
  );
}

export function TimeOffIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8.5 14.5l2 2 4-4" />
    </svg>
  );
}

export function SalaryIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15c0 1.1 1.1 2 2.5 2s2.5-.8 2.5-1.9-1-1.6-2.5-2-2.5-.9-2.5-2 1.1-1.9 2.5-1.9 2.2.6 2.4 1.5" />
      <path d="M12 6v1.3M12 16.7V18" />
    </svg>
  );
}

export function PayrunIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 12a8 8 0 0 1 13.6-5.7L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.6 5.7L4 16" />
      <path d="M4 20v-4h4" />
    </svg>
  );
}

export function PayslipIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  );
}

export function UsersAdminIcon({ className = "ico" }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <circle cx="18.2" cy="16.2" r="2.6" />
      <path d="M18.2 13.8v.7M18.2 17.9v.7M20.4 16.2h-.7M16.7 16.2H16M19.7 14.7l-.5.5M17 17.2l-.5.5M19.7 17.7l-.5-.5M17 15.2l-.5-.5" />
    </svg>
  );
}
