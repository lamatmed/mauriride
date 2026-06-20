import { UserRole } from "@prisma/client";

// ── Role hierarchy ────────────────────────────────────────────
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPERVISEUR:    999,
  SUPER_ADMIN:    100,
  DIRECTOR:       80,
  AGENCY_MANAGER: 60,
  AGENT:          40,
  CASHIER:        40,
  CONTROLLER:     30,
  DRIVER:         10,
};

// ── Permission definitions ────────────────────────────────────
export const PERMISSIONS = {
  // Company
  COMPANY_VIEW:   [UserRole.SUPER_ADMIN],
  COMPANY_MANAGE: [UserRole.SUPER_ADMIN],

  // Agencies
  AGENCY_VIEW:    [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],
  AGENCY_MANAGE:  [UserRole.SUPER_ADMIN, UserRole.DIRECTOR],

  // Users
  USER_VIEW:      [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],
  USER_MANAGE:    [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],

  // Reservations
  RESERVATION_VIEW:   [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT, UserRole.CASHIER, UserRole.CONTROLLER],
  RESERVATION_CREATE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT],
  RESERVATION_CANCEL: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT],

  // Trips
  TRIP_VIEW:    [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT, UserRole.CASHIER, UserRole.CONTROLLER, UserRole.DRIVER],
  TRIP_MANAGE:  [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],

  // Buses
  BUS_VIEW:   [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],
  BUS_MANAGE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],

  // Parcels
  PARCEL_VIEW:   [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT, UserRole.CASHIER],
  PARCEL_CREATE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT],
  PARCEL_MANAGE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT],

  // Finance
  FINANCE_VIEW:   [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.CASHIER],
  FINANCE_MANAGE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.CASHIER],

  // Reports
  REPORTS_VIEW: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER],

  // Boarding
  BOARDING_VIEW:   [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.CONTROLLER, UserRole.DRIVER],
  BOARDING_MANAGE: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.CONTROLLER],

  // Dashboard
  DASHBOARD_VIEW: [UserRole.SUPER_ADMIN, UserRole.DIRECTOR, UserRole.AGENCY_MANAGER, UserRole.AGENT, UserRole.CASHIER, UserRole.CONTROLLER],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function hasMinRole(role: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

export function canAccess(role: UserRole, ...permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPERVISEUR:    "Superviseur",
  SUPER_ADMIN:    "Super Administrateur",
  DIRECTOR:       "Directeur",
  AGENCY_MANAGER: "Responsable Agence",
  AGENT:          "Guichetier",
  CASHIER:        "Caissier",
  CONTROLLER:     "Contrôleur",
  DRIVER:         "Chauffeur",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPERVISEUR:    "bg-violet-600 text-white",
  SUPER_ADMIN:    "bg-primary text-white",
  DIRECTOR:       "bg-teal-600 text-white",
  AGENCY_MANAGER: "bg-teal-500 text-white",
  AGENT:          "bg-teal-400 text-white",
  CASHIER:        "bg-slate-600 text-white",
  CONTROLLER:     "bg-slate-500 text-white",
  DRIVER:         "bg-slate-400 text-white",
};
