export interface ITenant {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
  maxUsers?: number;
  isActive: boolean;
  plan: TenantPlan;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export enum TenantPlan {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export class Tenant implements ITenant {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
  maxUsers?: number;
  isActive: boolean;
  plan: TenantPlan;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  constructor(data: ITenant) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.subdomain = data.subdomain;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.maxUsers = data.maxUsers;
    this.isActive = data.isActive;
    this.plan = data.plan;
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone;
    this.address = data.address;
  }

  getDisplayName(): string {
    return this.name;
  }

  getStatusBadgeColor(): string {
    switch (this.status) {
      case TenantStatus.ACTIVE:
        return 'green';
      case TenantStatus.INACTIVE:
        return 'gray';
      case TenantStatus.SUSPENDED:
        return 'red';
      case TenantStatus.PENDING:
        return 'orange';
      default:
        return 'gray';
    }
  }

  getPlanBadgeColor(): string {
    switch (this.plan) {
      case TenantPlan.BASIC:
        return 'blue';
      case TenantPlan.PREMIUM:
        return 'purple';
      case TenantPlan.ENTERPRISE:
        return 'gold';
      default:
        return 'gray';
    }
  }
}