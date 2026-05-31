A tenant is a silo of user tracked information.

I need to create the concept of user 
    A user can have many system roles (Administrator, Developer)

    A user who is logged in can have access to many tenants, including their personal tenant
        A user can have many tenant roles.


A permission check is based on one three tiers (is this OWNERSHIP CONTEXT):
    System - What system level access to we possess
    Tenant - What tenant level access do we possess for the currently-selected tenant.
    Team   - What tenant level acecss do we possess for the currently-selected team.

Access restrictions are calculated by an algorith that determines that would allow me to say "Do I have access/read/write permissions for a feature with my appropriate permissions and could I elevate to achieve my needs."
    Max Permissions
    Appropriate Permissions

Elevate is only shown if I don't have access with my current level.


