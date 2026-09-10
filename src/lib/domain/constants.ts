export const ROLES = ["Admin Master", "Owner", "User"] as const;
export const TEMPERATURES = ["Cold", "Warm", "Hot"] as const;
export const PAYMENT_STATUSES = ["Pendente", "Pago", "Atrasado", "Cancelado"] as const;
export const DROPDOWN_TYPES = ["fonte_contato", "follow_up", "temperatura", "status_pagamento"] as const;
export const DASHBOARDS = ["leads", "finance"] as const;

export type Role = (typeof ROLES)[number];
export type Temperature = (typeof TEMPERATURES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
