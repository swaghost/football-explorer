* Define a Relationship interface. 

    - RelationshipID
    - RelationshipName
    

* Mock Data service needs to be able to return this list of Relationships    

    0 - Player
    1 - Parent/Mother  / Player
    2 - Parent/Father
    3 - Sibling
    4 - Grandparent
    5 - Other Supporting Relative    
    6 - Other Supporting Non-Relative
   99 - N/A


* Define a Relative interface. Each user should have 
    - UserId (number)
    - First Name(string)
    - Middle Name (string)
    - Last Name(string)
    - EmailAddress(string)
    - PhoneNumber(string)
    - Relationship (instance of type relationship)



* Define a User interface. Each user should have

    - UserId (number)
    - First Name(string)
    - Middle Name (string)
    - Last Name(string)
    - Address1(string)
    - Address2(string)
    - City(string)
    - State(string)
    - ZipCode(string)
    - NationCode(string)
    - EmailAddress(string)
    - PhoneNumber(string)
    - A list of tenants
    - Birth Date (Date)
 
*. Change the Tenant interface so that RoleID and RoleName are replaced with an array of roles.
*. Change the tenant interface so that it includes "Relatives" (an array of instances of interface Relative related to the user. These are linked accounts. if I'm the parent this might have my players, if I'm the player this might have my parents and supporting relatives.)
*. In the MockData service modify generateMockOrganizations so that it returns Tenants with the same data but the role structure turned into an array.
*. in file mock-user-data.json create 5 users in an array called "users" with Id's 1-5, with empty data which I will fill in later. 
*. Create a MockUserService which returns the data from mock-user-data.json.
*. Create a LoginDrawer which allows me select from the 5 different users as if I was logging in. It should look a lot like the tenant selection drawer, and it's toolbar toggle should be left of tenant selection. I'm going to use this to pretend and test different login situations.


*. Add to the Role interface these boolean optional fields:
     - RelatedMemberContext 
     - PlayerContext
     - StaffContext
     - TenantAdminContext
     - SysAdminContext

* Fix the roles to add the fields as specified.
       private roles: Role[] = [
    { RoleID: 0, RoleName: 'Personal Space' }, <-- PlayerContext 
    { RoleID: 1, RoleName: 'Administrator' }, <-- SysAdminContext
    { RoleID: 2, RoleName: 'Coach' }, <-- StaffContext
    { RoleID: 3, RoleName: 'Player' }, <-- PlayerContext
    { RoleID: 4, RoleName: 'Parent' },  <-- RelatedMemberContext
    { RoleID: 5, RoleName: 'Member' },   <-- RelatedMemberContext
    { RoleID: 6, RoleName: 'Tenant Admin' },  <-- TenantAdminContext
    { RoleID: 7, RoleName: 'Team Manager' }, <-- StaffContext
    { RoleID: 8, RoleName: 'Tenant Registrar' }, <-- TenantAdminContext
    { RoleID: 9, RoleName: 'Sporting Architect' }, <-- TenantAdminContext
    { RoleID: 10, RoleName: 'Director of Coaching (DOC)' }, <-- TenantAdminContext
    { RoleID: 11, RoleName: 'Club Director' }, <-- TenantAdminContext
    { RoleID: 99, RoleName: 'Developer' }, <-- SysAdminContext
  ];


*  Remove the user information from the tenant interface, tenant is now subbordinate to logged in user.
*. Add the concept of a ContextUser as an interface, and as something stored in NGXS state. It stores the context user, which is either the user that logged in, or a user selected from the users related user list.
*. Add to Tenant a string field "ContextSelectionRequired" with posible valid values R/A/N. When someone logs in and this flag is R (meaning they are in the RelatedMemberContext and no other context) for the tenant, they need to select one of their related users who is in a PlayerContext role. If the value is "A" then they CAN choose a related user but they don't have to. If it's "N" they are a playe and don't need, if it's "P" it's prohibited.

    ContextSelectionRequired value should be determmined at runtime from the the users roles.

     - RelatedMemberContext (R)
     - PlayerContext (N)
     - StaffContext (A)
     - TenantAdminContext (A)
     - SysAdminContext (A)

1. Add to the user interface the LastSelectedContextTenant, and LastSelectedContextUser. These are the ContextTenent (selected tenant) and Context User (selected user) when the user first logs in. 

2. Add to the mock login service so that when it's creating users 1-5, users have listed 
7 Scott (all tenants)
32 Quinn (1,8)
3 Chase (1,3,5)
4Archer(1,3,5,9)
Kelly (1,3,5,8,9)




I need to put in some rehydration checks for when a user arrives at the initial page and does the initiate place load and state is restored:

0. Make sure state is rehyrdrated before performing the following checks in order, wait to draw the main tree until all the checks have been completed.

1. When I initially enter the page...
    
    - if a user is in the loggedInUser and that user is within the list of users, make sure that shows as selected in the Login Drawer. 

    - If no loggedInUser is found, it should log in as "Free Mode" (UserID 0) for both the loggedInUser and selectedContextUser, it should use the Free Tenant (Tenant with ID 1), set the context team and teamgroups and lesson as null, and set the selectedContextDataset to the generated dataset (FlowID -1);

    - If we are not using the free user (userID 0), continue with the following checks: 

2. After check #1 above, when I initially enter the page, if a tenant is in the selectedContextTenant (and that tenant is part of the logged in users tenants), make sure that tenent shows the selected Tenant in the Tenant Selection Drawer.  If no selectedContextTenant is found, set the team and team groups as null and the selectedContextDataset to that of FlowID -1, and pop the tenant drawer.

3. After check #2 above, when I initially enter the page, if a user is in the selectedContextUser (and is assumable), make sure that shows as the selected user context in the selected-user-context drawer.

4. After check #3 above, when I initially enter the page, if a team is in the selectedContextTeam (and is available as part of selectedContextTenant teams), make sure that shows as the selected team in the team selection drawer.

5. After check #4 above, wWhen I initially enter the page, if a teamgroup is in the selectedContextTeamGroup (and is available as part of selectedContextTenant team's teamgroups), make sure that teamgroups shows as the selected teamgroup in the teamgroup selection drawer.

6. After check #5 above, When I initially enter the page, if a dataset is in the selectedContextDataset (and is available either as a system dataset, a personal dataset, or part of the selected tenant's tenant/team/teamgroup datasets), make sure that dataset shows as the selected dataset in the dataset selection drawer.