import { Injectable } from '@angular/core';
import { ITenant, User } from '../interfaces';
import { SubscriptionMockService } from './subscription-mock.service';
import { MockTeamService } from './mock-team.service';
import { MockLessonService } from './mock-lesson.service';

@Injectable({
  providedIn: 'root',
})
export class MockTenantService {
  constructor(
    private subscriptionMockService: SubscriptionMockService,
    private mockTeamService: MockTeamService,
    private mockLessonService: MockLessonService
  ) {}

  /**
   * Generate mock tenant organizations with subscription data
   */
  generateMockOrganizations(): ITenant[] {
    let playerIDCounter = 1;

    const tenants: ITenant[] = [
      {
        TenantID: 1,
        TenantName: 'FREE',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.SOCCR-ORG.png',
        SignupCode: 'FREE',
        AllowSignup: false,
        Teams: [],
        SubscriptionTierID: 'FREE',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 2,
        TenantName: 'Youth Development League',
        LogoUrl:
          'assets/images/mock-tenant-logos/TENANT.LOGO.GENERIC-FOOTBALL-CLUB.1.png',
        SignupCode: 'YDL-SIGNUP',
        AllowSignup: true,
        Teams: [
          this.mockTeamService.generateTeam(
            5,
            2,
            'Storm Eagles',
            1,
            3,
            1,
            playerIDCounter + 72
          ), // Boys U12
          this.mockTeamService.generateTeam(
            6,
            2,
            'Wave Riders',
            2,
            3,
            2,
            playerIDCounter + 90
          ), // Girls U12
          this.mockTeamService.generateTeam(
            7,
            2,
            'Star Shooters',
            1,
            2,
            3,
            playerIDCounter + 108
          ), // Boys U10
        ],
        SubscriptionTierID: 'ULTIMATE',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 3,
        TenantName: 'Wauwatosa East',
        SignupCode: 'WTOSA-EAST',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.TOSA-EAST.png',
        AllowSignup: true,
        Teams: [
          this.mockTeamService.generateTeam(
            97,
            3,
            'Wauwatosa East (Varsity)',
            1,
            12,
            1,
            playerIDCounter
          ), // Boys Highschool
          this.mockTeamService.generateTeam(
            98,
            3,
            'Wauwatosa East (JV1)',
            1,
            12,
            2,
            playerIDCounter
          ), // Boys Highschool
          this.mockTeamService.generateTeam(
            99,
            3,
            'Wauwatosa East (JV2)',
            1,
            12,
            3,
            3,
            playerIDCounter
          ), // Boys Highschool
        ],
        SubscriptionTierID: 'COACH',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 4,
        TenantName: 'Milwaukee Torrent',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.MKE-TORRENT.png',
        SignupCode: 'MKE-TORRENT',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'FREE',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 5,
        TenantName: 'Elmbrook United',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.EBU.png',
        SignupCode: 'ELMBROOK-UTD',
        AllowSignup: true,
        Teams: [
          this.mockTeamService.generateTeam(
            100,
            5,
            '2011 BOYS MLSNext',
            1,
            8,
            1,
            playerIDCounter + 72
          ),
        ],
        StaffTeams: [
          this.mockTeamService.generateTeam(
            101,
            5,
            '2011 BOYS Premier',
            1,
            8,
            2,
            playerIDCounter + 90
          ), // Boys U14
          this.mockTeamService.generateTeam(
            102,
            5,
            '2010 BOYS Premier',
            1,
            9,
            2,
            playerIDCounter + 100
          ), // Boys U15
          this.mockTeamService.generateTeam(
            103,
            5,
            '2009 BOYS Elite',
            1,
            10,
            3,
            playerIDCounter + 110
          ), // Boys U16 Level 3
          this.mockTeamService.generateTeam(
            104,
            5,
            '2011 GIRLS Premier',
            2,
            8,
            2,
            playerIDCounter + 120
          ), // Girls U14 Level 2
          this.mockTeamService.generateTeam(
            105,
            5,
            '2010 GIRLS Elite',
            2,
            9,
            3,
            playerIDCounter + 130
          ), // Girls U15 Level 3
        ],
        SubscriptionTierID: 'ULTIMATE',
        AddOnTierIDs: ['APPLIES-TO-ALL'],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 6,
        TenantName: 'FC Wisconsin',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.FCW.png',
        SignupCode: 'FC-WI-2024',
        AllowSignup: false,
        Teams: [
          this.mockTeamService.generateTeam(
            620,
            6,
            '2011 BOYS National',
            1,
            8,
            1,
            playerIDCounter + 90
          ),
          this.mockTeamService.generateTeam(
            621,
            6,
            '2011 BOYS Regional',
            1,
            8,
            2,
            playerIDCounter + 90
          ),
        ], // Boys U15],
        SubscriptionTierID: 'ACADEMY',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 7,
        TenantName: 'Milwaukee Kickers',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.MKSC.png',
        SignupCode: 'MKE-KICKERS',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'COACH',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 8,
        TenantName: "Quinn's UW Futsal",
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.UWWISCONSIN.png',
        SignupCode: 'WAVE-SC',
        AllowSignup: true,
        Teams: [
          this.mockTeamService.generateTeam(
            100,
            5,
            "Quinn's Intramural Outdoor Team",
            1,
            13,
            1,
            playerIDCounter + 72
          ),
          this.mockTeamService.generateTeam(
            101,
            5,
            "Quinn's Intramural Futsal Team",
            1,
            13,
            1,
            playerIDCounter + 72
          ), // Boys U15
        ],

        SubscriptionTierID: 'ACADEMY',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 9,
        TenantName: 'Tosa Kickers',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.TOSA-KICKERS.png',
        SignupCode: 'TKICKERS',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'GRASSROOTS',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 10,
        TenantName: 'ODP Wisconsin',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.ODPW.png',
        SignupCode: 'ODP',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'EXPLORER',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 11,
        TenantName: 'Wauwatosa West',
        SignupCode: 'WTOSA-WEST',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.TOSA-WEST.png',
        AllowSignup: true,
        Teams: [
          this.mockTeamService.generateTeam(
            97,
            3,
            'Wauwatosa West (Varsity)',
            1,
            12,
            1,
            playerIDCounter
          ), // Boys Highschool
          this.mockTeamService.generateTeam(
            98,
            3,
            'Wauwatosa West (JV1)',
            1,
            12,
            2,
            playerIDCounter
          ), // Boys Highschool
          this.mockTeamService.generateTeam(
            99,
            3,
            'Wauwatosa West (JV2)',
            1,
            12,
            3,
            playerIDCounter
          ), // Boys Highschool
        ],
        SubscriptionTierID: 'COACH',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 12,
        TenantName: 'SC Wave',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.SCW.png',
        SignupCode: 'WAVE-SC',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'ACADEMY',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      {
        TenantID: 13,
        TenantName: 'Cream City Futsal',
        LogoUrl: 'assets/images/mock-tenant-logos/TENANT.LOGO.CCF.png',
        SignupCode: 'CCF',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'ACADEMY',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
      ,
      {
        TenantID: 14,
        TenantName: 'Futsal Factory Wisconsin',
        LogoUrl: 'assets/images/mock-tenant-logos/FUTSAL-FACTORY-WISCONSIN.png',
        SignupCode: 'CCF',
        AllowSignup: true,
        Teams: [],
        SubscriptionTierID: 'ACADEMY',
        AddOnTierIDs: [],
        Roles: [],
        Relatives: [],
        Subscription: undefined,
        ContextSelectionRequired: undefined,
      },
    ];

    // Populate subscription data for each tenant
    tenants.forEach((tenant) => {
      if (tenant.SubscriptionTierID) {
        const subscription =
          this.subscriptionMockService.getSubscriptionSelection(
            tenant.SubscriptionTierID,
            tenant.AddOnTierIDs || []
          );

        if (subscription) {
          tenant.Subscription = subscription;
        } else {
          console.warn(
            `⚠️ Subscription tier "${tenant.SubscriptionTierID}" not found for tenant ${tenant.TenantID} (${tenant.TenantName})`
          );
        }
      }
    });

    // Generate lessons for each tenant using a system user
    // We use a default system user since MockTenantService doesn't have access to logged-in user
    const systemUser: User = {
      UserId: -1,
      FirstName: 'System',
      MiddleName: '',
      LastName: 'User',
      EmailAddress: 'system@soccr.org',
      Tenants: [],
      IsAssumable: false,
      Address1: '',
      Address2: '',
      City: '',
      State: '',
      ZipCode: '',
      NationCode: '',
      PhoneNumber: '',
      BirthDate: new Date('1900-01-01'),
      GenderID: 0,
      GenderName: 'Unknown',
      GenderAbbrev: 'U',
    };

    tenants.forEach((tenant) => {
      // Collect all team groups from all teams in this tenant
      const allTeamGroups =
        tenant.Teams?.flatMap((team) => team.TeamGroups || []) || [];

      // Generate comprehensive lesson set for this tenant
      // This creates: System lesson, Personal lesson, Tenant lesson,
      // ONE lesson for EACH team, and team group lessons
      const tenantLessons =
        this.mockLessonService.buildMockTenantLessonsForAllTeams(
          tenant,
          systemUser,
          tenant.Teams || [],
          allTeamGroups
        );

      tenant.lessons = tenantLessons;

      console.log(
        `📚 Generated ${tenantLessons.length} lessons for tenant ${tenant.TenantID} (${tenant.TenantName})`
      );
    });

    return tenants;
  }
}
