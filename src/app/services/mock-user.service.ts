import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  User,
  ITenant,
  Role,
  TenantConfig,
  IContextRelative,
} from '../interfaces';
import { MockDataService } from './mock-data.service';
import { SubscriptionMockService as MockSubscriptionService } from './subscription-mock.service';
import { determineContextSelectionRequired } from '../utils/tenant.utils';

@Injectable({
  providedIn: 'root',
})
export class MockUserService {
  private mockUsersUrl = 'assets/data/mock-user-data.json';

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService,
    private mockSubscriptionService: MockSubscriptionService
  ) {}

  /**
   * Get all mock users from JSON file
   */
  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(this.mockUsersUrl);
  }

  /**
   * Get a specific user by ID
   */
  getUserById(userId: number): Observable<User | undefined> {
    return new Observable((observer) => {
      this.getUsers().subscribe((data) => {
        const user = data.users.find((u) => u.UserId === userId);
        observer.next(user);
        observer.complete();
      });
    });
  }

  /**
   * Get a user by ID with tenants populated based on mockTenantConfig
   * This is the method to use when logging in a user
   */
  getUserWithTenants(userId: number): Observable<User | undefined> {
    return this.getUsers().pipe(
      map((data) => {
        const user = data.users.find((u) => u.UserId === userId);
        if (!user) return undefined;

        // Populate tenants based on mockTenantConfig
        if (user.mockTenantConfig && user.mockTenantConfig.length > 0) {
          user.Tenants = this.populateUserTenants(
            user.mockTenantConfig,
            data.users
          );
        }

        return user;
      })
    );
  }

  /**
   * Get all users with tenants populated
   */
  getUsersWithTenants(): Observable<User[]> {
    return this.getUsers().pipe(
      map((data) => {
        return data.users.map((user) => {
          if (user.mockTenantConfig && user.mockTenantConfig.length > 0) {
            user.Tenants = this.populateUserTenants(
              user.mockTenantConfig,
              data.users
            );
          }
          return user;
        });
      })
    );
  }

  /**
   * Populate tenants for a user based on their mockTenantConfig
   */
  private populateUserTenants(
    tenantConfigs: TenantConfig[],
    allUsers: User[]
  ): ITenant[] {
    const allTenants = this.mockDataService.generateMockOrganizations();
    const populatedTenants: ITenant[] = [];

    tenantConfigs.forEach((config) => {
      // Find the base tenant (skip tenant -1 as it's system level)
      if (config.tenantId === -1) {
        // System-level role, not a specific tenant
        return;
      }

      const baseTenant = allTenants.find((t) => t.TenantID === config.tenantId);
      if (!baseTenant) {
        console.warn(`Tenant ${config.tenantId} not found`);
        return;
      }

      console.log(
        `🔍 BaseTenant ${baseTenant.TenantID} (${baseTenant.TenantName}) has ${
          baseTenant.Teams?.length || 0
        } teams`
      );

      // Clone the tenant and populate with user-specific roles and relatives
      const populatedTenant: ITenant = {
        ...baseTenant,
        Roles: this.populateTenantRoles(config.tenantRoles),
        Relatives: this.populateTenantRelatives(
          config.tenantRelatives,
          allUsers,
          config.tenantId // Pass the current tenant ID to avoid infinite recursion
        ),
      };

      console.log(
        `✅ PopulatedTenant ${populatedTenant.TenantID} (${
          populatedTenant.TenantName
        }) has ${populatedTenant.Teams?.length || 0} teams`
      );

      // Override subscription tier and add-ons if specified in config
      if (config.TierID && config.TierID.trim() !== '') {
        populatedTenant.SubscriptionTierID = config.TierID;
        populatedTenant.AddOnTierIDs = config.AddOns || [];

        // Populate the subscription using the mock subscription service
        const subscription =
          this.mockSubscriptionService.getSubscriptionSelection(
            config.TierID,
            config.AddOns || []
          );
        if (subscription) {
          populatedTenant.Subscription = subscription;
        }
      }

      // Determine context selection requirement based on roles
      populatedTenant.ContextSelectionRequired =
        determineContextSelectionRequired(populatedTenant);

      // Filter: Only include this tenant if:
      // (A) User has a non-parent role (not role 4), OR
      // (B) User has role 4 BUT has at least one relative with a non-parent role in this tenant
      const userHasNonParentRole = config.tenantRoles.some(
        (roleId) => roleId !== 4
      );

      if (userHasNonParentRole) {
        // Case A: User has non-parent role, include the tenant
        populatedTenants.push(populatedTenant);
      } else {
        // Case B: User only has parent role (4), check if any relative has non-parent role
        const hasRelativeWithNonParentRole = config.tenantRelatives.some(
          (relativeConfig) => {
            const relativeUser = allUsers.find(
              (u) => u.UserId === relativeConfig.UserID
            );
            if (!relativeUser || !relativeUser.mockTenantConfig) return false;

            // Check if this relative has the same tenant with a non-parent role
            const relativeTenantConfig = relativeUser.mockTenantConfig.find(
              (tc) => tc.tenantId === config.tenantId
            );

            if (!relativeTenantConfig) return false;

            // Check if the relative has any role other than 4 in this tenant
            return relativeTenantConfig.tenantRoles.some(
              (roleId) => roleId !== 4
            );
          }
        );

        if (hasRelativeWithNonParentRole) {
          populatedTenants.push(populatedTenant);
        } else {
          console.log(
            `⚠️ Tenant ${config.tenantId} excluded: User only has parent role and no relatives with non-parent roles`
          );
        }
      }
    });

    return populatedTenants;
  }

  /**
   * Get Role objects based on role IDs
   */
  private populateTenantRoles(roleIds: number[]): Role[] {
    const allRoles = this.mockDataService.getRoles();
    return roleIds
      .map((roleId) => allRoles.find((r) => r.RoleID === roleId))
      .filter((role): role is Role => role !== undefined);
  }

  /**
   * Get User objects to populate as relatives, without tenant information to prevent infinite recursion
   */
  private populateTenantRelatives(
    relativeConfigs: IContextRelative[],
    allUsers: User[],
    currentTenantId?: number
  ): User[] {
    return relativeConfigs
      .map((relativeConfig) => {
        const user = allUsers.find((u) => u.UserId === relativeConfig.UserID);
        if (!user) return undefined;

        // Clone the user WITHOUT populating tenants to prevent infinite recursion
        // Relatives don't need their full tenant tree populated - just their basic info
        const clonedUser: User = {
          ...user,
          Tenants: [], // Empty array to prevent recursion
          IsAssumable: relativeConfig.IsAssumable, // Use the IsAssumable flag from the config
        };

        return clonedUser;
      })
      .filter((user): user is User => user !== undefined);
  }
}
