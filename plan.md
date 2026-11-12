# ROOMMATE OS --- Master Product & Engineering Plan

> **Document type:** Product Requirements Document (PRD) + Technical
> Architecture + Engineering Execution Plan\
> **Status:** Initial implementation specification\
> **Version:** 1.0\
> **Intended audience:** AI coding assistants, product designers,
> frontend/backend engineers, QA engineers and founders\
> **Working product name:** ROOMMATE OS (temporary; perform
> trademark/domain checks before public use)\
> **Tagline:** More than a room. Better people to live with.

------------------------------------------------------------------------

## 0. Instructions for the AI Coding Assistant

Treat this document as the source of truth for the initial product
build.

### 0.1 How to work

1.  Read this entire plan before changing or generating project code.
2.  Inspect the existing repository before creating files. Preserve
    working code and conventions unless there is a clear reason to
    change them.
3.  If the repository is empty, create the monorepo structure specified
    below.
4.  Build incrementally by phase. Do not attempt to implement every
    feature in one pass.
5.  Before each phase, provide:
    -   files/modules to be created or changed;
    -   database migrations required;
    -   API contracts affected;
    -   acceptance criteria;
    -   tests to be added.
6.  Implement the smallest complete vertical slice, then test it before
    moving on.
7.  Do not use mock data in production paths. Seed data may be used only
    in local development and clearly labelled as demo data.
8.  Never claim that identity, property ownership, employment, payments,
    legal agreements or listings are verified unless the relevant
    verification process has actually succeeded.
9.  Do not store secrets in source control. Use environment variables
    and provide `.env.example` files with placeholders.
10. Keep business logic out of UI components. Use typed API clients,
    validation schemas and service layers.
11. Add automated tests for critical business rules, especially
    permissions, group membership, matching filters, financial
    calculations and tenancy transitions.
12. If a requirement is ambiguous, record the assumption and ask before
    implementing irreversible or legally sensitive behaviour.

### 0.2 Non-negotiable engineering principles

-   Security and privacy by design.
-   Explicit consent for sharing personal information and documents.
-   Least-privilege access to household and rental data.
-   Server-side authorization on every protected operation.
-   Audit trails for sensitive rental, membership and financial changes.
-   Accessible, responsive and usable interfaces.
-   Transparent matching explanations; no opaque AI-only decisions.
-   No automated rejection based on protected or sensitive personal
    characteristics.
-   Never expose precise home addresses publicly.
-   Never hold user deposits or rent funds in the platform in the MVP.
-   Never present generated agreements as legal advice or legally
    validated contracts.

### 0.3 Provisional decisions

These are defaults for planning, not user-confirmed launch decisions.
Keep them configurable.

  -----------------------------------------------------------------------
  Decision                            Working default
  ----------------------------------- -----------------------------------
  Initial pilot city                  Bengaluru, India

  Future pilot cities                 Kochi and Trivandrum

  Initial audience                    IT professionals, working
                                      employees, freshers relocating for
                                      work

  Client apps                         React Native + Expo mobile app;
                                      Next.js responsive web portal

  Backend                             Python + FastAPI modular monolith

  Database                            PostgreSQL + PostGIS

  Cache / background coordination     Redis

  File storage                        S3-compatible private object
                                      storage

  API style                           REST with OpenAPI; WebSockets for
                                      real-time chat

  Initial language                    English; design for later
                                      localisation

  Currency                            INR

  Timezone                            Store timestamps in UTC; display
                                      Asia/Kolkata by default

  Listing sources                     Individual flatmates, existing
                                      households, owners and authorised
                                      property managers

  MVP business model                  Free core discovery; defer paid
                                      boosts and subscriptions until
                                      validated
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 1. Product Overview

## 1.1 Product vision

ROOMMATE OS is a people-first shared-rental platform that connects
compatible working professionals, helps them form groups, discover
suitable homes, coordinate rental decisions and manage the complete
shared-living journey from discovery to moving out.

The product is not simply a property portal and not simply a swipe-based
roommate app. It connects:

1.  People discovery.
2.  Lifestyle and behavioural compatibility.
3.  Group formation.
4.  Joint property discovery and decision-making.
5.  Rental documentation and move-in.
6.  Household operations.
7.  Move-out, settlement and replacement matching.

## 1.2 Core value proposition

**Find compatible people, discover suitable homes and manage shared
living in one connected platform.**

## 1.3 Problem statement

Working professionals relocating to a new city often use disconnected
tools to find accommodation and roommates. They search property portals
for homes, use WhatsApp or social media groups to find flatmates, call
brokers, exchange documents through messaging apps, split expenses
through spreadsheets or payment apps, and coordinate household
responsibilities informally.

This fragmented process creates several problems:

-   People select flatmates based on limited information.
-   Lifestyle conflicts are discovered only after moving in.
-   Groups struggle to find a property that fits everyone's budget and
    location needs.
-   Property and listing authenticity can be difficult to establish.
-   Rental documents, deposits, inventory and condition evidence are
    scattered.
-   Shared expenses and responsibilities lack transparency.
-   When someone moves out, the remaining tenants must restart the
    roommate search.
-   There is no continuous record connecting the original group,
    property, tenancy and replacement process.

## 1.4 Product goals

### Primary goals

-   Help users discover compatible flatmates.
-   Help users form groups for shared accommodation.
-   Help groups discover and shortlist suitable properties.
-   Make rental decisions and responsibilities more transparent.
-   Provide a connected tenancy record.
-   Support household management after move-in.
-   Simplify move-out and replacement roommate workflows.

### Non-goals for the first MVP

-   Becoming a full property brokerage company.
-   Owning or operating rental properties.
-   Holding deposits or rent in escrow.
-   Providing legal advice or guaranteeing enforceability of contracts.
-   Building a social network or public lifestyle feed.
-   Building a fully autonomous AI agent that makes rental decisions.
-   Launching in every Indian city simultaneously.
-   Building native iOS and Android applications separately.
-   Offering credit, lending, insurance or financial products.

## 1.5 Product principles

1.  **People before properties:** users can discover people before
    choosing a home.
2.  **Explainable compatibility:** show why a match may work and where
    differences exist.
3.  **Group-first decisions:** group members can jointly evaluate and
    vote on homes.
4.  **Continuity:** keep the rental journey connected from discovery to
    move-out.
5.  **Trust without false guarantees:** clearly distinguish
    user-provided, platform-checked and third-party-verified
    information.
6.  **User control:** people control their profile visibility, data
    sharing and participation.
7.  **Safety:** provide reporting, blocking, moderation and careful
    handling of sensitive data.

------------------------------------------------------------------------

# 2. Target Users and Personas

## 2.1 Primary audience

-   IT professionals moving to Bengaluru, Kochi or Trivandrum.
-   Employees relocating for a new job.
-   Freshers joining technology companies.
-   Interns and early-career professionals.
-   Existing flatmates looking for a replacement.
-   Working professionals seeking a room in an existing flat.

## 2.2 Secondary audience

-   Property owners.
-   Authorised property managers.
-   Existing household groups.
-   People moving between cities for work.

## 2.3 Personas

### Persona A --- Relocating employee

-   Receives a job offer in a new city.
-   Has a monthly accommodation budget.
-   Wants a reasonable commute.
-   Does not know people in the city.
-   Needs to find both roommates and a home quickly.

**Primary job to be done:** "Help me find compatible people and a
suitable home before I relocate."

### Persona B --- Existing flatmate

-   Already lives in a rented flat.
-   One roommate is leaving.
-   Wants to find a replacement without disrupting the household.
-   Needs to communicate existing house rules, rent share and room
    availability.

**Primary job to be done:** "Help me find a suitable replacement who
fits our existing household."

### Persona C --- Group of colleagues

-   Two or three colleagues want to rent together.
-   Have a combined budget and preferred commute area.
-   Need to compare properties and agree on one.

**Primary job to be done:** "Help us find a home that works for the
whole group."

### Persona D --- Property owner / manager

-   Has a property or rooms available.
-   Wants genuine enquiries.
-   Needs to manage listing information and respond to prospective
    tenants.

**Primary job to be done:** "Help me publish accurate availability and
connect with suitable prospective tenants."

------------------------------------------------------------------------

# 3. Product Scope and Feature Strategy

The product is organised into six systems. The MVP should focus on
discovery, group formation and joint property discovery. Rental
lifecycle features follow in later releases.

## 3.1 System A --- People Discovery

### Purpose

Allow users to discover potential flatmates through a modern,
dating-app-inspired interface with more meaningful context.

### Profile fields

**Required or strongly encouraged:** - Display name. - Profile photo. -
Age or age range, subject to product/legal review. - Current city. -
Preferred city. - Occupation category. - Monthly accommodation budget
range. - Preferred move-in date. - Preferred stay duration. - Preferred
neighbourhoods or work commute area. - Short introduction. - Lifestyle
preferences.

**Optional:** - Employer or workplace name. - Work email verification. -
Work arrangement: office, hybrid or remote. - Cooking preferences. -
Food preferences. - Smoking preference. - Alcohol/party preference. -
Pet preference. - Guest frequency preference. - Sleep and wake
schedule. - Cleanliness expectations. - Noise tolerance. - Social
interaction preference. - Shared item preferences.

Do not require users to disclose employer, exact office address, health
information, religion, caste, political views or other sensitive
information to use the product.

### Discovery card

Each person card should show: - Profile image. - First name or chosen
display name. - Occupation category. - Preferred area. - Budget range. -
Move-in window. - A few relevant lifestyle signals. - Compatibility
summary, when enough information exists. - Verification indicators with
exact meaning. - Actions: pass, save, express interest.

Avoid showing sensitive information or exact home/work addresses on
discovery cards.

### Interactions

-   Pass.
-   Save/bookmark.
-   Express interest.
-   Mutual match.
-   Report.
-   Block.
-   Undo last pass only if product policy permits.
-   Filters for city, budget, date and preferences.

Do not copy another platform's protected visual assets or branding. Use
familiar interaction patterns with an original design system.

## 3.2 System B --- Compatibility Engine

### Purpose

Help users understand lifestyle alignment and potential friction before
moving in.

### Assessment types

1.  Direct preference questions.
2.  Scenario-based questions.
3.  Hard dealbreakers.
4.  Optional follow-up questions after a match.
5.  Group compatibility assessment.

### Example scenario questions

-   Your flatmate leaves dishes overnight. How would you respond?
-   A friend wants to stay over for two nights. What level of notice do
    you expect?
-   The kitchen is dirty before your workday. What would you do?
-   Someone plays music late at night. How should this be handled?
-   A shared bill is overdue. How would you prefer to resolve it?

Answer options should avoid implying one answer is morally superior. The
goal is to identify expectations and communication styles.

### Compatibility dimensions

Suggested initial weights, to be tested and adjusted:

  Dimension                             Initial weight
  ----------------------------------- ----------------
  Cleanliness and chores                           20%
  Sleep and noise schedule                         15%
  Budget and financial expectations                20%
  Guests and social habits                         10%
  Food and cooking expectations                    10%
  Work schedule and home use                       10%
  Shared-space preferences                         10%
  Pets and other preferences                        5%
  **Total**                                   **100%**

These are product hypotheses, not scientifically validated weights.

### Scoring rules

-   Each dimension produces a normalised score from 0 to 100.
-   Each user can set the importance of selected dimensions.
-   Hard dealbreakers are evaluated before weighted scoring.
-   Missing answers reduce confidence; they must not be treated as a
    perfect match.
-   Show a confidence indicator based on profile completeness.
-   Explain the strongest alignment and biggest potential differences.
-   Users can change their preferences and see the impact.
-   Do not infer sensitive traits from behaviour or profile data.

Example output:

-   Overall compatibility: 84/100.
-   Strong alignment: sleep schedule, budget, cleanliness.
-   Potential discussion: guest frequency.
-   Missing information: cooking and shared groceries.
-   Suggested conversation: "How do you prefer to handle overnight
    guests?"

The score is a decision aid, not a prediction that two people will
definitely live well together.

## 3.3 System C --- Group Formation

### Purpose

Allow individuals to create or join a group that is searching for shared
accommodation.

### Core capabilities

-   Create a group.
-   Set group name and short description.
-   Select target city and preferred areas.
-   Set combined budget and per-person budget.
-   Set desired property type and occupancy.
-   Invite people through in-app invitation or shareable invite link.
-   Accept or decline invitations.
-   Join through an invite with appropriate approval.
-   Leave a group.
-   Remove a member with clear permissions and audit history.
-   Assign group roles.
-   View group members and their shared preferences.
-   Calculate pairwise compatibility.
-   Highlight group-level dealbreakers.
-   Maintain a group activity log.

### Group roles

-   Creator.
-   Admin.
-   Member.

The creator should not automatically have access to private identity
documents or private conversations of other members.

### Group states

`DRAFT → OPEN → FORMING → READY_TO_SEARCH → RENTAL_PENDING → ACTIVE_TENANCY → CLOSED`

State transitions must be validated by the backend. Do not let clients
set arbitrary group states.

## 3.4 System D --- Joint Property Discovery

### Listing types

1.  Entire flat available.
2.  Individual room available in an existing flat.
3.  Existing household seeking a replacement flatmate.
4.  Property owner listing.
5.  Authorised manager listing.

### Property fields

-   Listing title.
-   Description.
-   Property type.
-   City.
-   Locality.
-   Approximate map location.
-   Exact address, private and permission-controlled.
-   Rent.
-   Deposit.
-   Maintenance charge.
-   Utility arrangement.
-   Number of bedrooms and bathrooms.
-   Furnishing status.
-   Available rooms.
-   Occupancy limit.
-   Amenities.
-   Photos.
-   Availability date.
-   Minimum stay, if applicable.
-   Owner/manager contact workflow.
-   Verification status and evidence summary.
-   Listing status.

### Search filters

-   City.
-   Locality or map radius.
-   Rent range.
-   Deposit range.
-   Room type.
-   Furnishing.
-   Availability date.
-   Occupancy.
-   Amenities.
-   Listing type.
-   Verification status.

### Group property workflow

1.  Group opens property discovery.
2.  Each member can save a property.
3.  Group members can comment or ask questions.
4.  Members vote: interested, not interested, need more information.
5.  Group sees vote status.
6.  Group can shortlist properties.
7.  Group can schedule a visit.
8.  Group can mark a property as selected or rejected.
9.  Final rental decision requires explicit group confirmation.

Do not let one member commit the whole group to a rental contract
without explicit authority and consent.

### Listing verification labels

Use precise labels: - `UNVERIFIED` - `PHONE_CONFIRMED` -
`OWNER_AUTHORITY_REVIEW_PENDING` - `OWNER_AUTHORITY_REVIEWED` -
`PROPERTY_DETAILS_REVIEWED` - `REPORTED` - `SUSPENDED`

A phone-confirmed account is not a verified owner. A document upload is
not automatically a successful verification.

## 3.5 System E --- Rental Passport and Shared Home

### Purpose

Create a secure record for each active tenancy.

### Rental Passport information

-   Property reference.
-   Household/group reference.
-   Tenants.
-   Owner/manager reference.
-   Tenancy start and end dates.
-   Agreement document.
-   Rent amount and contribution allocation.
-   Deposit amount and contribution allocation.
-   Payment schedule.
-   Utility responsibility.
-   Move-in inspection.
-   Inventory.
-   House rules.
-   Important contacts.
-   Renewal reminders.
-   Move-out status.

### Move-in inspection

Allow tenants to record: - Room and common-area condition. - Photos. -
Appliance condition. - Existing damage. - Meter readings where
relevant. - Inventory. - Date and time. - Person submitting the
report. - Other members' acknowledgement.

Keep original evidence immutable. Corrections should be additional
entries, not silent overwrites.

### Shared household dashboard

-   Rent contribution tracking.
-   Utility bill tracking.
-   Shared expense entries.
-   Expense splitting.
-   Chore assignment.
-   Maintenance requests.
-   House rules.
-   Announcements.
-   Monthly household check-in.

### Financial model

The MVP should record obligations and settlements, not hold money.

Each expense should contain: - Amount. - Currency. - Description. - Paid
by. - Participants. - Split method. - Individual shares. - Date. -
Receipt attachment, optional. - Status. - Settlement references.

Support equal split and custom split initially. Ensure the sum of shares
equals the total amount, including rounding.

## 3.6 System F --- Move-Out and Replacement

### Purpose

Keep the household operational when a tenant leaves.

### Move-out workflow

1.  Tenant starts move-out request.
2.  Expected departure date is recorded.
3.  Group is notified according to permissions.
4.  Pending expenses are reviewed.
5.  Final inspection is scheduled.
6.  Room condition and inventory are recorded.
7.  Deposit status and deductions are documented.
8.  Settlement status is tracked.
9.  Tenant membership ends on the effective date.
10. Household vacancy is published if the remaining tenants choose.
11. Replacement discovery begins.
12. New member is onboarded with the group's approval.

### Important rules

-   Do not automatically calculate legally owed deposit deductions.
-   Let parties record proposed deductions and supporting evidence.
-   Make disputes visible and preserve the history.
-   Do not represent a deposit as returned until the parties or
    authorised payment provider confirm it.
-   Do not expose previous tenants' private documents to replacements.
-   A replacement member should receive only the information necessary
    to evaluate the room and household.

------------------------------------------------------------------------

# 4. MVP Definition

## 4.1 MVP outcome

The first release is successful if a working professional can:

1.  Create and complete a profile.
2.  Discover potential flatmates.
3.  Express interest and form mutual matches.
4.  Chat with a match.
5.  Create or join a group.
6.  Set shared location and budget preferences.
7.  Discover properties.
8.  Save and vote on properties with the group.
9.  Contact a listing owner/manager or existing flatmate.
10. Report suspicious users or listings.

## 4.2 MVP feature priority

  Feature                             Priority   Release
  ----------------------------------- ---------- ------------------
  Authentication                      P0         MVP
  Profile creation                    P0         MVP
  Lifestyle questionnaire             P0         MVP
  Discovery filters                   P0         MVP
  Compatibility scoring               P0         MVP
  Pass/save/interest                  P0         MVP
  Mutual matching                     P0         MVP
  Chat                                P0         MVP
  Group creation and invitations      P0         MVP
  Group membership permissions        P0         MVP
  Property listing creation           P0         MVP
  Property search                     P0         MVP
  Group shortlist and voting          P0         MVP
  Block/report                        P0         MVP
  Admin moderation                    P0         MVP
  Identity verification integration   P1         Later MVP
  Rental Passport                     P1         Release 2
  Move-in inspection                  P1         Release 2
  Shared expenses                     P1         Release 2
  Chores and maintenance              P1         Release 2
  Move-out and replacement            P1         Release 3
  AI assistant                        P2         Later
  Premium subscriptions               P2         After validation

## 4.3 Explicit MVP exclusions

Do not build these before the core discovery and group workflow is
validated:

-   Escrow or deposit holding.
-   In-app rent transfer.
-   Automated legal agreement generation.
-   AI chat agents negotiating rentals.
-   Public ratings of individuals.
-   Complex reputation scoring.
-   Full landlord accounting.
-   Multi-country currency support.
-   Advanced predictive ML.
-   Social feed.
-   Video calling unless user testing proves it essential.

------------------------------------------------------------------------

# 5. UX and Information Architecture

## 5.1 Mobile navigation

Recommended bottom navigation:

1.  **Discover** --- people and properties.
2.  **Matches** --- mutual matches and conversations.
3.  **Groups** --- group formation and group activity.
4.  **My Home** --- active rental/household; show onboarding state
    before tenancy.
5.  **Profile** --- account, preferences, verification and settings.

Property discovery can be a top-level section within Discover or a
clearly accessible sub-tab. Validate this in usability testing.

## 5.2 Main screens

### Authentication and onboarding

-   Welcome.
-   Phone/email sign-in.
-   OTP verification.
-   Terms and privacy consent.
-   Basic profile.
-   Location preferences.
-   Budget and move-in date.
-   Lifestyle questionnaire.
-   Profile preview.
-   Completion status.

### Discover

-   People cards.
-   Property cards.
-   Search and filters.
-   Map/list toggle.
-   Saved items.
-   Compatibility explanation.
-   Profile detail.
-   Property detail.

### Matches

-   Mutual match list.
-   Conversation list.
-   Chat.
-   Suggested conversation prompts.
-   Unmatch, block and report.

### Groups

-   Create group.
-   Join group.
-   Invitation inbox.
-   Group overview.
-   Members and roles.
-   Shared preferences.
-   Group compatibility.
-   Property shortlist.
-   Voting and comments.
-   Activity timeline.

### Property management

-   Create listing.
-   Edit listing.
-   Upload photos.
-   Availability.
-   Listing preview.
-   Enquiry management.
-   Report listing.

### My Home --- later release

-   Household overview.
-   Tenancy timeline.
-   Members.
-   Rent and expenses.
-   Chores.
-   Maintenance.
-   Documents.
-   Move-in and move-out.

### Admin web portal

-   User search.
-   Profile moderation.
-   Reports queue.
-   Listing moderation.
-   Verification review.
-   Suspensions and appeals.
-   Audit logs.
-   Basic platform metrics.

## 5.3 Design system

Use a clean, premium, modern visual identity. Avoid copying Tinder or
property portal branding.

### Design principles

-   Strong typography hierarchy.
-   Generous spacing.
-   Clear cards and readable information.
-   Warm, trustworthy visual language.
-   Accessible contrast.
-   Consistent status indicators.
-   Clear verification labels.
-   Subtle animation; no distracting motion.
-   Mobile-first responsive layouts.

### Component inventory

-   Primary and secondary buttons.
-   Text inputs and selectors.
-   Range sliders.
-   Multi-select chips.
-   Profile cards.
-   Property cards.
-   Compatibility breakdown.
-   Verification badges with explanatory text.
-   Group member avatars.
-   Voting controls.
-   Timeline.
-   Empty states.
-   Loading skeletons.
-   Error and retry states.
-   Confirmation dialogs.
-   Report/block flows.
-   Document upload controls.

### UX requirements

-   Every async action has loading, success and failure states.
-   Destructive actions require confirmation.
-   Empty states explain what to do next.
-   Do not use colour alone to convey status.
-   Provide accessible labels for controls.
-   Support keyboard navigation on web.
-   Avoid exposing precise address before appropriate access is granted.
-   Do not show fake counts, fake matches or fabricated reviews.

------------------------------------------------------------------------

# 6. Technical Architecture

## 6.1 Architecture approach

Use a **modular monolith** for the initial system.

Why: - Faster development. - Simpler deployment. - Easier transactional
consistency. - Lower operational overhead. - Clear module boundaries
allow future extraction into services.

Do not introduce microservices, Kubernetes or event-streaming
infrastructure in the MVP without a demonstrated need.

## 6.2 Technology stack

### Mobile

-   React Native.
-   Expo.
-   TypeScript.
-   Expo Router.
-   TanStack Query.
-   React Hook Form.
-   Zod for client-side schemas.
-   A consistent styling system such as NativeWind or a custom
    token-based component library.

### Web

-   Next.js.
-   TypeScript.
-   App Router.
-   TanStack Query where client-side server state is required.
-   React Hook Form.
-   Zod.
-   Responsive shared design tokens.

### Backend

-   Python 3.12+ (select a supported version compatible with
    dependencies).
-   FastAPI.
-   Pydantic.
-   SQLAlchemy 2.x.
-   Alembic migrations.
-   PostgreSQL.
-   PostGIS.
-   Redis.
-   Background worker using a simple task queue (e.g. ARQ, RQ or Celery;
    choose one, do not add multiple).
-   WebSockets for real-time messaging.

### Infrastructure

-   Docker and Docker Compose for local development.
-   Managed PostgreSQL with PostGIS support.
-   Managed Redis.
-   Private S3-compatible object storage.
-   CDN for public, non-sensitive assets only.
-   Push notifications via a suitable provider.
-   Centralised error tracking and structured logs.
-   CI using GitHub Actions or equivalent.

### External integrations (select after validation)

-   Maps/geocoding provider.
-   SMS OTP provider.
-   Email provider.
-   Identity verification provider authorised to operate in the target
    market.
-   Push notification provider.
-   Payment provider for future payments, if required.

Do not hard-code a specific vendor into business logic. Wrap
integrations behind interfaces/adapters.

## 6.3 High-level architecture

``` mermaid
flowchart TB
    USER[Users]
    MOBILE[React Native + Expo]
    WEB[Next.js Web]
    ADMIN[Admin Portal]

    USER --> MOBILE
    USER --> WEB
    ADMIN --> WEB

    MOBILE --> API[FastAPI API]
    WEB --> API

    API --> AUTH[Auth & Profiles]
    API --> DISC[Discovery & Matching]
    API --> GROUP[Groups]
    API --> PROP[Properties]
    API --> RENT[Rental Lifecycle]
    API --> CHAT[Messaging]
    API --> MOD[Moderation]

    AUTH --> DB[(PostgreSQL + PostGIS)]
    DISC --> DB
    GROUP --> DB
    PROP --> DB
    RENT --> DB
    CHAT --> DB
    MOD --> DB

    API --> REDIS[(Redis)]
    API --> OBJ[Private Object Storage]
    API --> MAP[Maps Provider]
    API --> OTP[OTP Provider]
    API --> PUSH[Push Notifications]

    REDIS --> WORKER[Background Worker]
    WORKER --> EMAIL[Email / Notification Provider]
```

## 6.4 Backend module boundaries

``` text
backend/
  app/
    main.py
    core/
      config.py
      logging.py
      security.py
      permissions.py
      database.py
      exceptions.py
    api/
      router.py
      dependencies.py
    modules/
      auth/
      users/
      profiles/
      preferences/
      assessments/
      compatibility/
      discovery/
      matches/
      messaging/
      groups/
      properties/
      enquiries/
      rentals/
      agreements/
      inspections/
      expenses/
      settlements/
      chores/
      maintenance/
      notifications/
      verification/
      moderation/
      admin/
    integrations/
      maps/
      sms/
      email/
      storage/
      push/
      identity/
      payments/
    workers/
    tests/
  migrations/
  scripts/
  Dockerfile
  pyproject.toml
```

Each module should have clearly separated: - models; - schemas; -
repository/data access; - service/business logic; - API routes; -
permissions; - tests.

Avoid circular imports and direct cross-module database manipulation.
Expose service methods or domain-level interfaces.

## 6.5 Suggested repository structure

``` text
roommate-os/
  apps/
    mobile/
    web/
  backend/
  packages/
    api-client/
    shared-types/
    design-tokens/
  docs/
    plan.md
    architecture.md
    api-conventions.md
    security.md
    decisions/
  infra/
    docker/
    deployment/
  scripts/
  .github/
    workflows/
  .env.example
  docker-compose.yml
  README.md
```

Use a monorepo only if the team is comfortable maintaining it. Keep the
Python backend's dependency management independent from the JavaScript
workspace.

------------------------------------------------------------------------

# 7. Database Design

## 7.1 General conventions

-   Use UUID primary keys.
-   Use `created_at` and `updated_at` timestamps.
-   Store timestamps in UTC.
-   Use `NUMERIC`/decimal for money, never floating-point.
-   Store currency explicitly; default to `INR`.
-   Use database constraints for important invariants.
-   Use soft deletion only where justified; define retention and erasure
    behaviour.
-   Add indexes for frequent filters and joins.
-   Use PostGIS geography/geometry for location queries.
-   Store private files in object storage and only references/metadata
    in the database.
-   Never store raw OTPs or plaintext passwords.
-   Use migrations for all schema changes.

## 7.2 Core entities

### users

-   id
-   phone_number (unique, nullable if email-first flow is supported)
-   email (unique, nullable)
-   password_hash (nullable when using passwordless authentication)
-   account_status
-   last_active_at
-   created_at
-   updated_at

### user_profiles

-   user_id
-   display_name
-   bio
-   occupation_category
-   employer_name (optional)
-   work_mode
-   profile_photo_key
-   preferred_city_id
-   profile_visibility
-   profile_completion
-   created_at
-   updated_at

### cities

-   id
-   name
-   state
-   country_code
-   timezone
-   active

### neighbourhoods

-   id
-   city_id
-   name
-   approximate_location
-   active

### user_preferences

-   user_id
-   min_budget
-   max_budget
-   currency
-   move_in_from
-   move_in_to
-   preferred_stay_months
-   preferred_neighbourhood_ids
-   property_preferences
-   visibility_preferences

For multi-select fields, use normalised join tables if filtering,
indexing or analytics require it. Do not overuse JSON columns.

### lifestyle_answers

-   id
-   user_id
-   question_id
-   answer_value
-   answer_metadata
-   updated_at

### lifestyle_questions

-   id
-   question_text
-   question_type
-   dimension
-   options_json
-   version
-   active

### user_dealbreakers

-   id
-   user_id
-   dimension
-   rule_operator
-   rule_value
-   active

### matches

-   id
-   user_a_id
-   user_b_id
-   status
-   compatibility_score
-   score_version
-   created_at
-   matched_at
-   ended_at

Enforce canonical user ordering or a unique pair constraint so duplicate
matches cannot exist.

### conversations

-   id
-   conversation_type
-   created_at
-   updated_at

### conversation_members

-   conversation_id
-   user_id
-   joined_at
-   left_at
-   role

### messages

-   id
-   conversation_id
-   sender_id
-   message_type
-   body
-   attachment_key
-   created_at
-   edited_at
-   deleted_at

### groups

-   id
-   name
-   description
-   city_id
-   min_budget
-   max_budget
-   currency
-   target_move_in_date
-   target_occupancy
-   status
-   created_by
-   created_at
-   updated_at

### group_members

-   id
-   group_id
-   user_id
-   role
-   membership_status
-   joined_at
-   left_at

Enforce that a user cannot have duplicate active membership in the same
group.

### group_invitations

-   id
-   group_id
-   invited_by
-   invitee_user_id (nullable for secure invite-link flow)
-   token_hash
-   status
-   expires_at
-   created_at
-   accepted_at

Store a hash of invitation tokens, not the raw token.

### properties

-   id
-   owner_user_id
-   manager_user_id (nullable)
-   title
-   description
-   property_type
-   city_id
-   neighbourhood_id
-   approximate_location
-   exact_address_encrypted_or_protected
-   bedrooms
-   bathrooms
-   furnishing_status
-   amenities
-   status
-   created_at
-   updated_at

### property_listings

-   id
-   property_id
-   listing_type
-   rent_amount
-   deposit_amount
-   maintenance_amount
-   currency
-   available_from
-   available_until
-   occupancy_limit
-   room_count
-   verification_status
-   listing_status
-   created_at
-   updated_at

### property_photos

-   id
-   property_id
-   storage_key
-   display_order
-   moderation_status
-   created_at

### saved_properties

-   user_id
-   property_id
-   created_at

### group_property_candidates

-   id
-   group_id
-   property_listing_id
-   proposed_by
-   status
-   created_at

### group_property_votes

-   id
-   candidate_id
-   user_id
-   vote
-   comment
-   updated_at

Enforce one current vote per user per candidate.

### property_enquiries

-   id
-   listing_id
-   sender_user_id
-   group_id (nullable)
-   message
-   status
-   created_at

### rental_agreements

-   id
-   tenancy_id
-   document_storage_key
-   document_type
-   uploaded_by
-   access_policy
-   document_status
-   created_at

### tenancies

-   id
-   property_id
-   group_id
-   start_date
-   expected_end_date
-   actual_end_date
-   rent_amount
-   deposit_amount
-   currency
-   status
-   created_at
-   updated_at

### tenancy_members

-   id
-   tenancy_id
-   user_id
-   role
-   rent_share
-   deposit_share
-   joined_at
-   left_at
-   status

### inspections

-   id
-   tenancy_id
-   inspection_type
-   submitted_by
-   inspection_date
-   status
-   notes
-   created_at

### inspection_items

-   id
-   inspection_id
-   area
-   item_name
-   condition
-   notes
-   photo_storage_key

### expenses

-   id
-   tenancy_id
-   created_by
-   description
-   category
-   total_amount
-   currency
-   expense_date
-   receipt_storage_key
-   status
-   created_at

### expense_shares

-   id
-   expense_id
-   user_id
-   share_amount
-   paid_amount
-   settlement_status

### settlements

-   id
-   tenancy_id
-   from_user_id
-   to_user_id
-   amount
-   currency
-   status
-   external_reference (nullable)
-   created_at
-   settled_at

### chores

-   id
-   tenancy_id
-   title
-   description
-   recurrence_rule
-   assigned_user_id
-   status
-   due_at
-   created_at

### maintenance_requests

-   id
-   tenancy_id
-   created_by
-   title
-   description
-   priority
-   status
-   assigned_to
-   created_at
-   updated_at

### reports

-   id
-   reporter_user_id
-   target_type
-   target_id
-   reason
-   description
-   status
-   moderator_id
-   resolution
-   created_at
-   resolved_at

### verification_records

-   id
-   user_id or listing_id (use a clear subject model)
-   verification_type
-   provider
-   status
-   result_reference
-   verified_at
-   expires_at
-   reviewer_id
-   created_at

Do not store full identity document images indefinitely by default. Use
a compliant verification provider where possible and retain only the
minimum result/reference data required.

### audit_logs

-   id
-   actor_user_id
-   action
-   entity_type
-   entity_id
-   metadata_redacted
-   created_at

Audit logs must not contain passwords, OTPs, access tokens or
unnecessary personal data.

## 7.3 Key database relationships

``` mermaid
erDiagram
    USERS ||--|| USER_PROFILES : has
    USERS ||--o{ USER_PREFERENCES : configures
    USERS ||--o{ MATCHES : participates
    USERS ||--o{ GROUP_MEMBERS : joins
    GROUPS ||--o{ GROUP_MEMBERS : contains
    GROUPS ||--o{ GROUP_PROPERTY_CANDIDATES : considers
    PROPERTY_LISTINGS ||--o{ GROUP_PROPERTY_CANDIDATES : proposed
    GROUP_PROPERTY_CANDIDATES ||--o{ GROUP_PROPERTY_VOTES : receives
    PROPERTIES ||--o{ PROPERTY_LISTINGS : advertises
    PROPERTIES ||--o{ TENANCIES : hosts
    GROUPS ||--o{ TENANCIES : forms
    TENANCIES ||--o{ TENANCY_MEMBERS : includes
    TENANCIES ||--o{ RENTAL_AGREEMENTS : documents
    TENANCIES ||--o{ INSPECTIONS : records
    TENANCIES ||--o{ EXPENSES : tracks
    EXPENSES ||--o{ EXPENSE_SHARES : allocates
    TENANCIES ||--o{ CHORES : manages
    TENANCIES ||--o{ MAINTENANCE_REQUESTS : tracks
```

The final schema should be normalised and reviewed before production.
This diagram is conceptual and does not replace migration definitions.

------------------------------------------------------------------------

# 8. API Specification

## 8.1 API conventions

-   Base path: `/api/v1`
-   JSON request/response bodies.
-   Bearer-token authentication.
-   Consistent pagination.
-   Pydantic request/response schemas.
-   OpenAPI documentation.
-   Standard error format.
-   Idempotency keys for operations that may be retried.
-   Rate limiting for authentication, messaging, invitations and
    reports.
-   Validate authorization on the server for every resource.

Example success response:

``` json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-01-01T10:00:00Z"
  }
}
```

Example error response:

``` json
{
  "error": {
    "code": "RESOURCE_FORBIDDEN",
    "message": "You do not have permission to access this resource.",
    "request_id": "uuid"
  }
}
```

Never return stack traces or internal exception details to clients.

## 8.2 Authentication

  Method   Endpoint              Purpose
  -------- --------------------- -------------------------------------
  POST     `/auth/request-otp`   Request OTP
  POST     `/auth/verify-otp`    Verify OTP
  POST     `/auth/register`      Complete registration
  POST     `/auth/login`         Login if password flow is supported
  POST     `/auth/refresh`       Refresh session
  POST     `/auth/logout`        Revoke session
  GET      `/auth/me`            Current user

## 8.3 Profiles and preferences

  Method   Endpoint                     Purpose
  -------- ---------------------------- -------------------------------
  GET      `/profiles/me`               Get own profile
  PATCH    `/profiles/me`               Update profile
  GET      `/profiles/{user_id}`        View permitted public profile
  PUT      `/profiles/me/preferences`   Update preferences
  GET      `/profiles/me/completion`    Completion status
  GET      `/lifestyle/questions`       Assessment questions
  PUT      `/lifestyle/answers`         Submit answers
  PUT      `/lifestyle/dealbreakers`    Update dealbreakers

## 8.4 Discovery and matching

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  GET                     `/discovery/people`                   Discover people

  POST                    `/discovery/actions`                  Pass, save or express
                                                                interest

  GET                     `/matches`                            List mutual matches

  GET                     `/matches/{match_id}`                 Match details

  DELETE                  `/matches/{match_id}`                 Unmatch

  GET                     `/matches/{match_id}/compatibility`   Compatibility
                                                                explanation

  POST                    `/users/{user_id}/block`              Block user

  POST                    `/reports`                            Submit report
  -------------------------------------------------------------------------------------

## 8.5 Messaging

  Method   Endpoint                         Purpose
  -------- -------------------------------- -------------------------------
  GET      `/conversations`                 List conversations
  POST     `/conversations`                 Create permitted conversation
  GET      `/conversations/{id}/messages`   Fetch messages
  POST     `/conversations/{id}/messages`   Send message
  POST     `/conversations/{id}/read`       Mark messages read

WebSocket route:

`/api/v1/ws/conversations/{conversation_id}`

WebSocket authorization must verify conversation membership. A valid
access token alone does not grant access to every conversation.

## 8.6 Groups

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  POST                    `/groups`                                  Create group

  GET                     `/groups`                                  List user's groups

  GET                     `/groups/{group_id}`                       Group details

  PATCH                   `/groups/{group_id}`                       Update permitted fields

  POST                    `/groups/{group_id}/invitations`           Invite member

  POST                    `/groups/invitations/{token}/accept`       Accept invitation

  POST                    `/groups/{group_id}/leave`                 Leave group

  DELETE                  `/groups/{group_id}/members/{member_id}`   Remove member if
                                                                     authorised

  GET                     `/groups/{group_id}/compatibility`         Group compatibility

  GET                     `/groups/{group_id}/activity`              Group activity
  ------------------------------------------------------------------------------------------

## 8.7 Properties and listings

  ------------------------------------------------------------------------------------
  Method                  Endpoint                             Purpose
  ----------------------- ------------------------------------ -----------------------
  POST                    `/properties`                        Create property

  GET                     `/properties`                        Search properties

  GET                     `/properties/{property_id}`          Property details

  PATCH                   `/properties/{property_id}`          Update permitted
                                                               property fields

  POST                    `/properties/{property_id}/photos`   Add photo

  POST                    `/listings`                          Create listing

  GET                     `/listings/{listing_id}`             Listing details

  PATCH                   `/listings/{listing_id}`             Update listing

  POST                    `/listings/{listing_id}/enquiries`   Submit enquiry

  POST                    `/listings/{listing_id}/report`      Report listing
  ------------------------------------------------------------------------------------

## 8.8 Group property decisions

  ----------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                   Purpose
  ----------------------- ---------------------------------------------------------- -----------------------
  POST                    `/groups/{group_id}/properties`                            Add property candidate

  GET                     `/groups/{group_id}/properties`                            List candidates

  PUT                     `/groups/{group_id}/properties/{candidate_id}/vote`        Submit/update vote

  POST                    `/groups/{group_id}/properties/{candidate_id}/comments`    Add comment

  POST                    `/groups/{group_id}/properties/{candidate_id}/shortlist`   Shortlist candidate
  ----------------------------------------------------------------------------------------------------------

## 8.9 Rental lifecycle --- later release

  --------------------------------------------------------------------------------------
  Method                  Endpoint                               Purpose
  ----------------------- -------------------------------------- -----------------------
  POST                    `/tenancies`                           Create tenancy record

  GET                     `/tenancies/{id}`                      Get permitted tenancy
                                                                 details

  POST                    `/tenancies/{id}/documents`            Upload rental document

  POST                    `/tenancies/{id}/inspections`          Create inspection

  POST                    `/tenancies/{id}/expenses`             Add expense

  GET                     `/tenancies/{id}/expenses`             List expenses

  POST                    `/tenancies/{id}/settlements`          Record proposed
                                                                 settlement

  POST                    `/tenancies/{id}/chores`               Create chore

  POST                    `/tenancies/{id}/maintenance`          Create maintenance
                                                                 request

  POST                    `/tenancies/{id}/move-out`             Start move-out workflow

  POST                    `/tenancies/{id}/replacement-search`   Open replacement search
  --------------------------------------------------------------------------------------

## 8.10 API acceptance rules

-   All list endpoints support bounded pagination.
-   All filters are validated.
-   Sort fields are allowlisted.
-   Sensitive endpoints have rate limits.
-   Group and tenancy access is checked against current membership.
-   Users cannot alter another user's vote.
-   Users cannot view private documents without explicit permission.
-   A removed member loses access according to a defined retention
    policy.
-   API errors use stable machine-readable codes.
-   OpenAPI schemas are updated with every endpoint change.

------------------------------------------------------------------------

# 9. Matching Engine Specification

## 9.1 Matching pipeline

Use three stages:

### Stage 1 --- Eligibility filtering

Apply hard constraints: - Same target city or compatible relocation
city. - Budget intersection. - Compatible move-in window. - Available
occupancy. - User-defined hard dealbreakers. - User visibility and block
settings. - Account/listing moderation status.

Never use protected or sensitive characteristics as hidden eligibility
filters.

### Stage 2 --- Compatibility score

For users A and B:

`compatibility = sum(dimension_weight × dimension_similarity) / sum(applicable_dimension_weights)`

Each dimension similarity is between 0 and 1.

Suggested initial dimensions: - Cleanliness and chores: 0.20. - Budget
and financial expectations: 0.20. - Sleep and noise: 0.15. - Guests and
social habits: 0.10. - Food and cooking: 0.10. - Work schedule/home
usage: 0.10. - Shared spaces: 0.10. - Pets and other preferences: 0.05.

Weights are configurable and versioned.

### Stage 3 --- Ranking

Rank eligible candidates using: - Compatibility score. - Budget fit. -
Commute/locality fit. - Move-in timing. - Profile completeness. - Recent
activity.

Do not allow profile completeness or activity to overwhelm user-defined
hard preferences.

## 9.2 Missing data

-   Missing answers are unknown, not automatically compatible.
-   Exclude unknown dimensions from the score denominator.
-   Reduce confidence when data is missing.
-   Explain why confidence is low.
-   Offer relevant questions to improve the comparison.

## 9.3 Group compatibility

For a group of `n` people:

-   Calculate all pairwise compatibility scores.
-   Evaluate each person's hard dealbreakers against all other members.
-   Calculate group budget feasibility.
-   Identify incompatible move-in windows.
-   Summarise recurring conflicts.
-   Provide discussion prompts.

For four people, there are six pairwise comparisons. Do not use only the
average score because it can hide one severely incompatible pair.

Example group result:

-   Group compatibility: 81/100 (illustrative).
-   Strong alignment: budget, work schedules.
-   Discussion required: guests and quiet hours.
-   Missing data: cooking preferences.
-   Budget feasibility: within selected range.

## 9.4 Explainability

Every score should include: - Score version. - Dimensions used. -
Weights applied. - Missing dimensions. - Strong alignments. - Potential
differences. - Dealbreaker results. - Timestamp.

Store enough information to explain a previous result if weights change
later.

## 9.5 Future learning

Only after meaningful, consented outcome data exists: - Measure whether
users connected. - Measure whether groups formed. - Collect optional
post-move-in satisfaction feedback. - Evaluate prediction quality. -
Test alternative weights. - Audit for unfair or unwanted outcomes.

Do not claim the model predicts successful relationships unless evidence
supports that claim.

------------------------------------------------------------------------

# 10. Security, Privacy and Trust

## 10.1 Authentication

-   Use a trusted authentication implementation.
-   Hash passwords with a modern password hashing algorithm if passwords
    are used.
-   OTPs must expire quickly and be rate-limited.
-   Store OTP hashes, not plaintext OTPs.
-   Protect refresh tokens.
-   Revoke sessions on logout and account security events.
-   Prevent account enumeration where feasible.

## 10.2 Authorization

Use role-based and resource-based authorization.

Examples: - A user can edit only their own profile. - A group member can
view permitted group details. - Only authorised group roles can edit
shared group settings. - A group member can vote only as themselves. - A
tenancy member can access only documents shared with that tenancy
role. - Property owners/managers can edit only listings they control. -
Admin access requires separate permissions and audit logging.

Enforce these rules in backend services and database queries, not only
in the UI.

## 10.3 Sensitive data

-   Keep exact addresses private until an appropriate stage.
-   Use private object storage for identity and tenancy documents.
-   Use short-lived signed URLs.
-   Do not log document contents or access tokens.
-   Collect only necessary data.
-   Provide data export and deletion request workflows.
-   Define retention periods.
-   Obtain explicit consent before sharing documents with another user.
-   Do not expose a user's phone number by default.

## 10.4 Verification semantics

Display exactly what was checked.

Examples: - Phone verified. - Email verified. - Work email verified. -
Identity check completed by provider. - Listing details reviewed. -
Owner authority reviewed.

Do not combine these into a vague "100% verified" badge.

## 10.5 Trust and moderation

-   Report user.
-   Report listing.
-   Block user.
-   Unmatch.
-   Rate-limit suspicious activity.
-   Detect repeated spam patterns.
-   Admin review queue.
-   Moderator actions and audit log.
-   Appeal process for suspensions.
-   Clear escalation path for safety incidents.

## 10.6 India-specific compliance review

Before public launch, obtain qualified legal/privacy review for: -
Digital Personal Data Protection Act and applicable rules. - Consumer
protection and e-commerce obligations where applicable. - State-specific
tenancy and rental requirements. - KYC/identity verification provider
requirements. - Payment provider and RBI-related requirements if payment
flows are introduced. - Terms of service, privacy policy and grievance
handling. - Data retention and cross-border storage arrangements.

This document is an engineering plan, not legal advice.

------------------------------------------------------------------------

# 11. Non-Functional Requirements

## 11.1 Performance

Initial targets to validate: - Common API reads: p95 under 500 ms under
expected pilot load, excluding external providers. - Discovery queries:
p95 under 800 ms with appropriate indexes and pagination. - Chat
delivery: near real-time under normal network conditions. - Image
uploads use direct or pre-signed object storage uploads where
appropriate. - Avoid loading large image files in list responses.

## 11.2 Availability and reliability

-   Health and readiness endpoints.
-   Database backups.
-   Migration rollback strategy.
-   Background task retries with limits.
-   Idempotency for retryable mutations.
-   Graceful handling of third-party outages.
-   Monitoring for error rates and latency.

## 11.3 Accessibility

-   Semantic labels.
-   Screen-reader support.
-   Keyboard access on web.
-   Contrast compliant with WCAG guidance.
-   Touch targets appropriate for mobile.
-   Clear error messages.
-   Do not rely on colour alone.

## 11.4 Observability

-   Structured logs.
-   Request IDs.
-   Error tracking.
-   API latency metrics.
-   Database query monitoring.
-   Background task failure monitoring.
-   Audit logs for sensitive actions.
-   No sensitive personal data in logs.

------------------------------------------------------------------------

# 12. Testing Strategy

## 12.1 Backend tests

-   Unit tests for compatibility calculations.
-   Unit tests for budget and expense splits.
-   Group membership permissions.
-   Invitation expiry and reuse.
-   Property listing visibility.
-   Group voting rules.
-   Tenancy state transitions.
-   File access permissions.
-   Report/block behaviour.
-   Authentication and token expiry.

## 12.2 Frontend tests

-   Authentication flow.
-   Profile creation and editing.
-   Discovery and filters.
-   Interest/pass actions.
-   Match creation.
-   Chat states.
-   Group creation and invitations.
-   Property listing and search.
-   Group voting.
-   Error, empty and loading states.

## 12.3 Integration tests

-   Registration through profile completion.
-   Discovery through mutual match.
-   Match through conversation.
-   Group invitation through membership.
-   Group formation through property shortlist.
-   Listing enquiry through owner response.
-   Rental creation through move-in report (later release).

## 12.4 Security tests

-   IDOR/resource access tests.
-   Cross-group data access.
-   Cross-tenancy document access.
-   Token misuse.
-   Rate-limit tests.
-   Upload validation.
-   Malicious file handling.
-   Injection and input validation.
-   Permission escalation.
-   Sensitive information leakage.

## 12.5 Release gates

Do not release a phase unless: - Critical tests pass. - Migrations run
on a clean database. - No known critical/high security issue remains
unresolved. - Core flows work on supported devices/browsers. - Error and
empty states are implemented. - Privacy permissions are checked. -
Analytics events are documented. - Rollback or mitigation steps exist.

------------------------------------------------------------------------

# 13. Analytics and Success Metrics

## 13.1 North-star metric

**Successful shared move-ins facilitated by the platform.**

For the MVP, use a leading indicator:

**Qualified groups that complete a property shortlist and initiate a
genuine rental enquiry.**

Do not count a profile swipe as a successful outcome.

## 13.2 Funnel

1.  App install/visit.
2.  Registration completed.
3.  Profile completed.
4.  Lifestyle assessment completed.
5.  First relevant discovery.
6.  Interest expressed.
7.  Mutual match.
8.  Conversation started.
9.  Group formed.
10. Property shortlisted.
11. Enquiry submitted.
12. Property visit.
13. Rental confirmed.
14. Move-in recorded.

## 13.3 Metrics

-   Registration completion rate.
-   Profile completion rate.
-   Assessment completion rate.
-   Relevant discovery rate.
-   Interest-to-match conversion.
-   Match-to-conversation conversion.
-   Conversation-to-group conversion.
-   Group-to-property-shortlist conversion.
-   Enquiry-to-visit conversion.
-   Visit-to-rental conversion.
-   Median time to successful move-in.
-   30-day household satisfaction.
-   Replacement roommate time.
-   Listing report rate.
-   User report resolution time.

## 13.4 Event naming

Use consistent event names: - `user_registered` - `profile_completed` -
`assessment_completed` - `discovery_viewed` - `interest_sent` -
`match_created` - `conversation_started` - `group_created` -
`group_member_joined` - `property_saved` - `group_property_voted` -
`property_enquiry_created` - `rental_confirmed` - `move_in_recorded` -
`move_out_started` - `replacement_search_started`

Do not include message contents, identity documents or sensitive profile
answers in analytics events.

------------------------------------------------------------------------

# 14. Monetisation Strategy

Do not optimise revenue before validating marketplace liquidity.

## 14.1 Initial model

Keep essential features free: - Profile creation. - Basic discovery. -
Matching. - Basic chat. - Group creation. - Basic property discovery.

## 14.2 Potential future revenue

1.  Owner/manager subscription for multiple listings and enquiry
    management.
2.  Paid listing verification where real review work is provided.
3.  Optional promoted listings, clearly labelled.
4.  Premium discovery filters or profile visibility.
5.  Referral revenue from moving, cleaning, internet and home services.
6.  Advanced household management for larger groups or property
    managers.

## 14.3 Monetisation safeguards

-   Never sell private user data.
-   Clearly label promoted listings.
-   Do not make payment a condition for safety or basic access.
-   Do not imply paid verification guarantees a safe tenancy.
-   Disclose referral relationships.
-   Validate willingness to pay before implementing subscriptions.

------------------------------------------------------------------------

# 15. Development Roadmap

A 16-week plan is a planning target for a focused team, not a guarantee.
A solo developer may require more time.

## Phase 0 --- Validation and product design (Weeks 1--2)

Deliverables: - Interview 20--30 working professionals. - Interview
existing flatmates and property owners. - Validate the most painful part
of the rental journey. - Choose pilot locality. - Study competing
products hands-on. - Create user journey maps. - Create clickable
wireframes. - Define initial success metrics. - Finalise MVP scope.

Exit criteria: - Evidence that users want group formation and joint
property discovery. - At least one realistic listing acquisition
strategy. - Usability feedback on the primary flows.

## Phase 1 --- Engineering foundation (Weeks 3--5)

Deliverables: - Repository setup. - CI pipeline. - Local Docker
environment. - Database and migrations. - Authentication. - Profile
APIs. - Mobile and web navigation. - Design system. - Error handling and
logging. - Admin authentication foundation.

Exit criteria: - User can register, log in and complete a profile. -
Migrations work from a clean database. - CI runs automated tests.

## Phase 2 --- Discovery and matching (Weeks 6--8)

Deliverables: - Lifestyle questions. - Preference management. -
Compatibility scoring. - Discovery API and UI. - Pass/save/interest. -
Mutual matching. - Conversation creation. - Real-time chat. -
Block/report.

Exit criteria: - Two users can discover each other, mutually match and
chat. - Hard dealbreakers are enforced. - Compatibility results are
explainable. - Blocked users cannot contact each other.

## Phase 3 --- Group formation and property marketplace (Weeks 9--11)

Deliverables: - Group creation. - Invitations. - Membership and role
management. - Group preferences. - Property creation and editing. -
Photo upload. - Property search. - Group property shortlist. - Group
voting. - Enquiry flow. - Listing moderation.

Exit criteria: - A group can form, set a shared budget, discover
properties and shortlist one. - Only authorised members can view or
change group information. - Property listing permissions are enforced.

## Phase 4 --- Rental records (Weeks 12--14)

Deliverables: - Tenancy record model. - Rental document upload. - Access
permissions. - Move-in inspection. - Expense tracking. - Basic
settlement records. - Household dashboard.

Exit criteria: - A test group can create a tenancy record and document
the move-in condition. - Expenses split correctly. - Private documents
are accessible only to permitted members.

## Phase 5 --- Beta and launch readiness (Weeks 15--16)

Deliverables: - Security review. - Performance testing. - Device/browser
testing. - Admin moderation workflow. - Analytics. - Privacy and terms
review. - Production deployment. - Pilot onboarding. - Feedback and
bug-fix cycle.

Exit criteria: - Critical user journeys pass. - No unresolved critical
security issues. - Support and moderation processes are ready. - Pilot
inventory and user acquisition plan exists.

## Later releases

### Release 2

-   Identity verification integration.
-   Owner authority review.
-   Advanced tenancy workflows.
-   Chores and maintenance.
-   Rent and utility reminders.
-   Renewal reminders.

### Release 3

-   Move-out workflow.
-   Deposit status and settlement tracking.
-   Replacement roommate workflow.
-   Advanced group matching.
-   Local service partners.
-   Optional premium subscriptions.

------------------------------------------------------------------------

# 16. Deployment and DevOps

## 16.1 Environments

Maintain: - Local. - Development/staging. - Production.

Use separate databases, storage buckets, credentials and third-party
keys.

## 16.2 Local development

Provide: - `docker-compose.yml` - PostgreSQL with PostGIS. - Redis. -
Backend API. - Optional local object storage emulator. - Seed script
with fictional demo users and properties. - `.env.example`.

## 16.3 CI pipeline

On pull request: 1. Lint. 2. Type check. 3. Backend unit tests. 4.
Frontend unit tests. 5. Build checks. 6. Migration validation. 7.
Dependency/security scan.

On release: 1. Build immutable artifacts. 2. Run migration checks. 3.
Deploy to staging. 4. Run smoke tests. 5. Require approval for
production. 6. Deploy. 7. Verify health. 8. Monitor errors and latency.

## 16.4 Backups and recovery

-   Automated database backups.
-   Periodic restore tests.
-   Defined retention.
-   Object storage versioning or recovery where appropriate.
-   Documented incident response.
-   Avoid destructive migrations without a backup and rollback plan.

------------------------------------------------------------------------

# 17. AI Coding Assistant Execution Protocol

The AI assistant should use this exact implementation order unless
repository inspection reveals a strong reason to adjust it.

## Step 1 --- Repository reconnaissance

-   Inspect files and dependencies.
-   Identify existing app structure.
-   Identify current database and API setup.
-   Identify tests and coding conventions.
-   Report existing implementation before modifying it.

## Step 2 --- Create project foundation

-   Monorepo or clearly separated app directories.
-   Backend FastAPI app.
-   Mobile Expo app.
-   Next.js web app.
-   Shared design tokens and API types where practical.
-   Docker Compose.
-   Environment templates.
-   CI workflow.

## Step 3 --- Create database foundation

-   SQLAlchemy models.
-   Alembic migrations.
-   Database constraints and indexes.
-   Seed data for local development.
-   Test database fixtures.

## Step 4 --- Build vertical slice 1

Authentication → profile completion → profile retrieval.

Test end to end before proceeding.

## Step 5 --- Build vertical slice 2

Lifestyle assessment → preference storage → compatibility calculation →
discovery card.

## Step 6 --- Build vertical slice 3

Interest → mutual match → conversation → messaging.

## Step 7 --- Build vertical slice 4

Group creation → invitation → membership → shared preferences.

## Step 8 --- Build vertical slice 5

Property creation → search → group shortlist → votes → enquiry.

## Step 9 --- Add rental lifecycle

Only after the MVP's discovery and group workflow is stable.

## Step 10 --- Release readiness

-   Security review.
-   Permission tests.
-   Accessibility review.
-   Performance checks.
-   Analytics.
-   Deployment and monitoring.
-   Pilot feedback.

### Required output after each phase

The AI coding assistant must provide: - Summary of implemented
functionality. - Files created or changed. - Database migrations. - API
endpoints added/changed. - Tests executed and results. - Known
limitations. - Required environment variables. - Exact commands to run
locally. - Recommended next task.

Do not silently skip failed tests. Do not mark unfinished features as
complete.

------------------------------------------------------------------------

# 18. Definition of Done

A feature is done only when:

-   Requirements are implemented.
-   UI has loading, empty, success and error states.
-   Backend validation exists.
-   Authorization is enforced.
-   Database migration exists where required.
-   Automated tests cover critical paths.
-   Logs do not leak sensitive information.
-   Accessibility basics are addressed.
-   Documentation is updated.
-   No placeholder action falsely indicates success.
-   Manual acceptance criteria pass.

------------------------------------------------------------------------

# 19. MVP Acceptance Scenarios

The following scenarios must work before the initial public pilot.

### Scenario A --- New employee finds a flatmate

1.  User registers.
2.  Completes profile.
3.  Selects Bengaluru and a budget range.
4.  Completes lifestyle assessment.
5.  Discovers potential flatmates.
6.  Expresses interest.
7.  Receives mutual match.
8.  Starts a conversation.

**Expected:** The two users can communicate without exposing private
contact details by default.

### Scenario B --- Two users form a group

1.  User A creates a group.
2.  User A sets city and budget.
3.  User A invites User B.
4.  User B accepts.
5.  Both users view group details.
6.  Both users can see the shared preferences.

**Expected:** A user outside the group cannot access its private
details.

### Scenario C --- Group shortlists a property

1.  Group discovers a listing.
2.  A member adds it to the group shortlist.
3.  Members vote.
4.  Members add comments.
5.  Group sees the combined decision status.
6.  Group submits an enquiry.

**Expected:** Votes are attributed to individual members and can be
updated only by the relevant member.

### Scenario D --- User reports a suspicious listing

1.  User opens listing.
2.  Selects report.
3.  Chooses a reason.
4.  Submits report.
5.  Admin sees the report.
6.  Admin reviews and takes action.

**Expected:** The reporter receives an acknowledgement without seeing
private moderator information.

### Scenario E --- Group member leaves

1.  Member requests to leave.
2.  Backend checks active membership and group rules.
3.  Membership is updated.
4.  Access is revoked according to policy.
5.  Group activity records the change.

**Expected:** The former member cannot continue accessing private group
resources.

------------------------------------------------------------------------

# 20. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Marketplace has too few High                    Launch in a focused
  users                                           locality; seed genuine
                                                  supply

  Fake property listings  High                    Moderation,
                                                  owner-authority checks,
                                                  reporting

  Fake user profiles      High                    Phone verification,
                                                  optional identity
                                                  checks

  Poor compatibility      Medium                  Explain scores, allow
  recommendations                                 preference controls,
                                                  collect feedback

  Group disagreements     Medium                  Transparent voting and
                                                  decision history

  Privacy leakage         High                    Resource-based
                                                  authorization, private
                                                  storage, audit

  Payment disputes        High                    Do not custody funds in
                                                  MVP

  Legal complexity        High                    Qualified legal review
                                                  before rental/payment
                                                  workflows

  Feature creep           High                    Strict release
                                                  priorities and
                                                  acceptance criteria

  Dependence on external  Medium                  Provider adapters and
  providers                                       graceful fallback
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Open Decisions to Confirm Before Public Launch

The following are intentionally left configurable:

1.  Final brand name and domain.
2.  First launch city and locality.
3.  Whether the first client is mobile-first or web-first.
4.  Exact supported property types.
5.  Listing supply acquisition strategy.
6.  Whether owner/manager accounts are available at launch.
7.  Identity verification provider.
8.  Map/geocoding provider.
9.  SMS and email providers.
10. Data retention periods.
11. Legal documents and rental agreement workflow.
12. Monetisation and pricing.
13. Languages for launch.
14. Moderation staffing and escalation process.

Do not block local development on every vendor decision. Use interfaces
and local development adapters where appropriate. Do block public launch
on legal, privacy, safety and payment decisions that require review.

------------------------------------------------------------------------

# 22. Final Product Strategy

ROOMMATE OS should not try to win by having the most listings or by
copying a dating app.

Its strategic position is:

**A shared-rental operating platform that connects people, groups,
properties and the complete tenancy lifecycle.**

The initial wedge is:

1.  Behavioural compatibility.
2.  Group formation for working professionals.
3.  Joint property discovery and voting.
4.  A continuous rental record.
5.  Move-out and replacement roommate continuity.

The MVP must prove that people can find compatible flatmates, form a
group and shortlist a real property. Once that works, add the rental
management lifecycle.

## Final instruction to the AI coding assistant

Start by inspecting the repository and reporting its current state. Then
propose a concise implementation checklist for Phase 0/Phase 1. Do not
generate the entire application in one response. Implement one tested
vertical slice at a time, keep this plan updated when decisions change,
and ask before changing the product scope or introducing major
infrastructure.

**End of master plan.**
