import { Injectable } from '@angular/core';
import {
  ITenant,
  Gender,
  AgeGroup,
  Role,
  DecisionFlow,
  Relationship,
  User,
  ITeam,
  ITeamGroup,
} from '../interfaces';
import { MockAgeGroupService } from './mock-age-group.service';
import { MockRelationshipService } from './mock-relationship.service';
import { MockRoleService } from './mock-role.service';
import { MockGenderService } from './mock-gender.service';
import { MockPositionsService } from './mock-positions.service';
import { MockDatasetService } from './mock-dataset.service';
import { MockTenantService } from './mock-tenant.service';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  constructor(
    private mockAgeGroupService: MockAgeGroupService,
    private mockRelationshipService: MockRelationshipService,
    private mockRoleService: MockRoleService,
    private mockGenderService: MockGenderService,
    private mockPositionsService: MockPositionsService,
    private mockDatasetService: MockDatasetService,
    private mockTenantService: MockTenantService
  ) {}

  getGenders(): Gender[] {
    return this.mockGenderService.getGenders();
  }
  getAgeGroups(): AgeGroup[] {
    return this.mockAgeGroupService.getAgeGroups();
  }
  getRoles(): Role[] {
    return this.mockRoleService.getRoles();
  }
  getRelationships(): Relationship[] {
    return this.mockRelationshipService.getRelationships();
  }
  getPositionAbbreviations(): string[] {
    return this.mockPositionsService.getPositionAbbreviations();
  }
  getPositionNumbers(): number[] {
    return this.mockPositionsService.getPositionNumbers();
  }
  getPositions(): Array<{ name: string; abbrev: string; number: number }> {
    return this.mockPositionsService.getPositions();
  }
  generateRandomDescription(nodeId?: string): string {
    return this.mockDatasetService.generateRandomDescription(nodeId);
  }
  generateNodeDescription(nodeId: string, includeDetails = true): string {
    return this.mockDatasetService.generateNodeDescription(
      nodeId,
      includeDetails
    );
  }
  generateNodeVideoUrl(nodeId: string): string {
    return this.mockDatasetService.generateNodeVideoUrl(nodeId);
  }
  generateLoremIpsumDescription(nodeId: string): string {
    return this.mockDatasetService.generateLoremIpsumDescription(nodeId);
  }
  getDecisionFlows(): DecisionFlow[] {
    return this.mockDatasetService.getDecisionFlows();
  }
  getFilteredDecisionFlows(
    loggedInUser: User | null,
    selectedTenant: ITenant | null = null,
    selectedTeam: ITeam | null = null,
    selectedTeamGroup: ITeamGroup | null = null
  ): DecisionFlow[] {
    return this.mockDatasetService.getFilteredDecisionFlows(
      loggedInUser,
      selectedTenant,
      selectedTeam,
      selectedTeamGroup
    );
  }
  getGenderById(genderID: number): Gender | undefined {
    return this.mockGenderService.getGenderById(genderID);
  }
  getAgeGroupById(ageGroupID: number): AgeGroup | undefined {
    return this.mockAgeGroupService.getAgeGroupById(ageGroupID);
  }
  getRoleById(roleID: number): Role | undefined {
    return this.mockRoleService.getRoleById(roleID);
  }
  generateMockOrganizations(): ITenant[] {
    return this.mockTenantService.generateMockOrganizations();
  }
}
