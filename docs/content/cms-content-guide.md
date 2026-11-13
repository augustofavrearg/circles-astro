# Circles House CMS Content Guide

- Status: Active
- Version: 1.0
- Document owner: Website Lead
- Primary audience: Marketing
- Last reviewed: 2026-11-10
- Source verified against: Live Wix CMS audit and the CH v1.1 implementation baseline
- Scope: The purpose, categories, relationships, shared fields, and safe content operations of the Circles House CMS.
Does not cover: Changing collection schemas, frontend implementation, deployment, bulk migrations, or release procedures.

## 1. Why This Guide Exists

This guide is designed to help Marketing understand the CMS well enough to begin creating and maintaining real website content safely. It is both an onboarding guide and the operational reference for deciding where content belongs, how records connect, and when a change requires technical review.

Think of the CMS as a **connected library**:

- A **collection** is a cabinet dedicated to one kind of information.
- A **record** is one card inside that cabinet.
- A **field** is one piece of information written on the card.
- A **reference** connects one card to another card instead of copying its information.
- A **page composition record** tells the website where and how content should appear.

The website does not treat every record as an isolated text box. It combines global information, reusable entities, offerings, editorial content, and page composition to create each public page.

``` text
[ Global settings and navigation ]
                 │
                 v
[ Page ] → [ Sections ] → [ Section Items ]
                 │
                 ├── uses Locations, People and Amenities
                 ├── displays Spaces, Rooms and Membership Plans
                 └── displays Events, Articles, Deals, FAQs and other editorial content
```

The most important idea is this:

> Put information in the collection that represents what the information **is**, not only where it happens to appear today.

After reading the relevant parts of this guide, a Marketing user should be able to:

- Select the correct collection for an assigned content task.
- Recognize whether the change is content, a relationship, or website structure.
- Create or update a record without duplicating reusable information.
- Keep incomplete work unavailable to the public.
- Submit clear verification evidence for Website Lead review.

### How to use this guide

You do not need to memorize all 22 collections before using the CMS.

For your first task:

1.  Read Sections 1–3 to understand the model.
2.  Read Section 9 to understand relationships.
3.  Read Sections 11–13 to understand fields and the safe workflow.
4.  Read only the catalog entry for the collection assigned in your task.
5.  Use Sections 15–17 as your verification and escalation reference.

The remaining collection entries are a reference to consult as your responsibilities grow. If you can identify what the content represents, select the correct collection, complete its relationships, and control its publication state, you are ready to begin with a reviewed CMS task.

This document explains the approved model; the ClickUp task defines the authorized change. When they appear to conflict, stop and ask the Website Lead before editing.

## 2. Which Wix Collections Belong to This Website

The Circles House model contains **22 custom collections**. Their IDs all begin with `CH`.

Wix currently also displays application collections such as `Locations/Locations` and `Members/...`. Those are Wix application collections, not part of the Circles House content model.

### Marketing rule

- Work only in the approved `CH...` collection named in the task.
- Do not edit `Locations/Locations`, `Members/Badges`, `Members/FullData`, `Members/PrivateMembersData`, or `Members/PublicData` unless a separate task explicitly requires it.
- If two collections have similar names, confirm the collection ID before editing.

## 3. The Five Collection Categories

The categories are a learning and ownership system. They explain the responsibility of each collection; they do not prevent collections from referencing one another.

| Category | Purpose | Collections |
|----|----|----|
| Global | Information used across the whole website. | `CHSiteSettings`, `CHInterfaceCopy`, `CHSocialLinks`, `CHNavigationItems` |
| Reusable entities | Real concepts that can exist independently and be referenced from several places. | `CHAmenities`, `CHLocations`, `CHPeople`, `CHPrograms` |
| Offerings | Products, access, or services offered by Circles House. | `CHSpaces`, `CHRooms`, `CHMembershipPlans` |
| Editorial and operational content | Publishable information that changes over time or communicates a specific subject. | `CHEvents`, `CHStayCampaigns`, `CHNewsArticles`, `CHDeals`, `CHTestimonials`, `CHPartners`, `CHFaqs`, `CHLegalPages` |
| Page composition | Records that assemble editorial page experiences. | `CHPages`, `CHPageSections`, `CHSectionItems` |

These five categories prevent two common problems:

1.  Copying the same real-world information into several pages.
2.  Treating every visible card or text block as an independent business entity.

### Content changes versus structural changes

Marketing owns approved content operations, but not every editable field is merely content. Use this distinction before saving:

| Change type | Examples | Default owner |
|----|----|----|
| Content | Approved copy, dates, contact details, media, SEO text, article body, event details. | Marketing, through an assigned task. |
| Presentation control | `published`, `enabled`, `featuredHome`, ordering, approved display flags. | Marketing, followed by Website Lead review when public output changes. |
| Relationship | Selecting an existing location, author, amenity, program, page, or section. | Marketing when the relationship is documented and requested; otherwise Website Lead. |
| Structure | Keys, slugs already in use, routes, `componentKey`, `layoutVariant`, navigation hierarchy, collection fields, permissions, or schemas. | Website Lead or technical implementation. |
| Destructive or bulk operation | Deletion, import, seed, bulk update, or mass publication. | Website Lead approval and a dedicated task. |

The CMS interface allowing a value to be edited does not by itself authorize the change.

## 4. Global Collections

Global collections affect several pages or the website as a whole. Changes here have a wide impact, so Marketing should edit them only through an approved task.

### CHSiteSettings — Site Settings

`CHSiteSettings` stores the single global website configuration record. It includes the site name, default SEO, promotion text, contact information, footer content, copyright text, and newsletter copy.

Why it is global: these values do not belong to one specific page or location.

Important fields:

- `key`: the singleton identifier; normally `global`.
- `defaultSeoTitle`, `defaultSeoDescription`, `defaultSocialImage`: fallback SEO information.
- `promotionText`: site-wide promotional copy.
- `contactAbout`, `contactPhone`, `contactEmail`, `contactAddress`: shared contact information.
- `newsletterTitle`, `newsletterDescription`, `newsletterConsentText`: newsletter module content.

Marketing warning: this collection has no `published` switch. An approved saved change may affect the whole site.

### CHInterfaceCopy — Interface Copy

`CHInterfaceCopy` stores short reusable interface phrases such as labels, messages, and utility text.

Why it is global: the same interface phrase may be used in more than one page or component.

Important fields:

- `copyKey`: stable machine identifier.
- `value`: visible text.
- `group`: functional grouping.
- `context`: explanation of where or why the phrase is used.

Marketing warning: edit `value`, not `copyKey`, unless the Website Lead approves the identifier change.

### CHSocialLinks — Social Links

`CHSocialLinks` stores the official social network destinations displayed by the website.

Why it is global: the same official accounts may appear in navigation, footer, or contact areas.

Important fields:

- `networkKey`: stable network identifier.
- `label`: accessible or visible network name.
- `url`: official destination.
- `iconKey`: icon identifier.
- `published`, `sortOrder`: visibility and order.

### CHNavigationItems — Navigation Items

`CHNavigationItems` defines the website navigation structure and destinations.

Why it is global: navigation connects the entire website rather than belonging to one page.

Important fields:

- `itemKey`: stable item identifier.
- `label`, `menuLabel`, `badge`: visible navigation content.
- `area`: navigation area such as header or footer.
- `parentKey`: creates parent-child menu structure.
- `routeKey`, `routeParam`, `anchor`, `externalUrl`: destination definition.
- `location`: optional reference to `CHLocations`.
- `published`, `sortOrder`: visibility and order.

Marketing warning: a navigation label may be editorial, but its route configuration is structural. Ask the Website Lead before changing route fields.

## 5. Reusable Entity Collections

A reusable entity represents a concept with its own identity. It can be connected to many other records without being recreated.

Collections in this category may reference each other. Being “reusable” does not mean being isolated.

### CHAmenities — Amenities

`CHAmenities` stores reusable amenities such as rooftop access, Wi-Fi, meeting rooms, gym access, or printing.

Why it is reusable: one amenity can describe a location, a space, and several rooms.

Important fields:

- `amenityKey`: stable identifier.
- `label`: visible name.
- `iconKey`: approved icon identifier.
- `category`: amenity grouping.
- `applicableTo`: types of records that may use it.
- `published`, `sortOrder`: visibility and order.

Used by: `CHLocations`, `CHSpaces`, and `CHRooms` through multi-references.

### CHLocations — Circles House Locations

`CHLocations` stores each Circles House destination or site, such as Barcelona.

Why it is reusable: people, programs, spaces, rooms, events, testimonials, navigation items, and FAQs can all relate to the same location.

Important fields:

- `name`, `shortName`, `slug`: identity.
- `city`, `country`, `timezone`, `address`: geographical information.
- `status`: business state, such as active or coming soon.
- `summary`, `accessLabel`: editorial summary.
- `heroImage`, `cardImage`, `gallery`, `mapImage`, `mapUrl`: media and map content.
- `amenities`: multi-reference to `CHAmenities`.
- `featuredHome`, `homeSortOrder`: Home-page selection and order.
- `published`, `sortOrder`: public visibility and general order.

Marketing warning: use `CHLocations`, not the Wix application collection `Locations/Locations`.

### CHPeople — People

`CHPeople` stores reusable people: team members, location managers, members, authors, or other people presented by the site.

Why it is reusable: one person may appear on the Team page, represent a location, and author an article without duplicating their biography.

Important fields:

- `name`, `slug`: identity.
- `personTypes`: one or more roles in the content model.
- `role`, `bio`, `photo`, `profileUrl`: public profile content.
- `location`: optional reference to `CHLocations`.
- `published`, `sortOrder`: visibility and order.

Used by: team and member views, location management content, and `CHNewsArticles.author`.

### CHPrograms — Programs

`CHPrograms` stores a reusable program or event series, such as Founders Month.

Why it is reusable: a program groups or contextualizes several events and may connect to an editorial page, but it is not itself the page or an individual event.

Important fields:

- `name`, `slug`, `theme`: program identity.
- `locationScope`: `selected` or `all`.
- `locations`: multi-reference to the locations where a selected program may run.
- `location`: legacy single-location reference retained only during migration.
- `startsOn`, `endsOn`: program period.
- `page`: optional reference to `CHPages`.
- `registrationEnabled`: registration state.
- `published`, `sortOrder`: visibility and order.

Important distinction:

- `founders-month` identifies a program; the word `month` has no routing meaning.
- `/locations/barcelona/stays/2027-06` identifies a commercial June stay campaign.
- An event may reference the program, but an event can also exist without a program.
- Every event connected to a selected-location program must use one of the program's selected locations.

## 6. Offering Collections

Offering collections represent what Circles House makes available to customers. They exist independently from any one page that displays them.

### CHSpaces — Spaces

`CHSpaces` stores offered spaces such as coworking, spa, rooftop, or other Circles House spaces.

Why it is an offering: the space is something customers can access or experience, not just a card on a page.

Important fields:

- `title`, `slug`, `spaceType`, `categoryLabel`: identity and classification.
- `location`: reference to `CHLocations`.
- `description`, `accessLabel`, `addressOverride`, `status`: public information.
- `routeSlug`, `discoverable`: opt-in location-scoped public route. The pair `location + routeSlug` must be unique.
- `page`: optional reference to `CHPages` for additional editorial sections and SEO; the space still has a complete default page without it.
- `hours`, `ctaLabel`, `externalUrl`: optional operational information and public action.
- `image`, `gallery`: media.
- `amenities`: multi-reference to `CHAmenities`.
- `featuredHome`, `homeCardSize`, `homeSortOrder`: Home-page presentation.
- `published`, `sortOrder`: visibility and order.

Public routing:

- A published record is not automatically a public detail page. It must also have `discoverable = true`, a non-hidden status, and a `routeSlug`.
- Its canonical route is `/locations/:location/spaces/:routeSlug`.
- Internal offerings such as booths or hot desks may remain reusable in other sections without receiving their own route.
- `CHAmenities` describes reusable attributes of a space; it does not represent a standalone destination or service page.

### CHRooms — Rooms

`CHRooms` stores the room types or bookable room offerings available at a location.

Why it is an offering: a room remains a product even when it is not currently displayed in a particular section.

Important fields:

- `name`, `slug`, `occupancyType`: identity and room type.
- `location`: reference to `CHLocations`.
- `description`, `houseLabel`, `views`: editorial information.
- `image`, `gallery`, `floorPlan`: media and documentation.
- `amenities`: multi-reference to `CHAmenities`.
- `features`: room-specific feature list.
- `priceLabel`, `priceValue`, `bookingUrl`: commercial information.
- `published`, `sortOrder`: visibility and order.

### CHMembershipPlans — Membership Plans

`CHMembershipPlans` stores the membership plans offered by Circles House.

Why it is an offering: a plan has its own pricing, features, and action independent from the page section that introduces memberships.

Important fields:

- `label`, `slug`: identity.
- `priceValue`, `note`, `features`: plan content.
- `ctaLabel`, `routeKey`, `externalUrl`: action.
- `highlighted`: featured plan state.
- `published`, `sortOrder`: visibility and order.

## 7. Editorial and Operational Collections

These collections contain publishable, time-sensitive, informational, promotional, or legally governed content.

### CHEvents — Events

`CHEvents` stores individual scheduled events.

Important fields:

- `title`, `slug`, `eventType`: identity and type.
- `location`: required reference to `CHLocations` for published website behavior.
- `program`: optional reference to `CHPrograms`.
- `subtitle`, `description`, `accessLabel`: editorial content.
- `venueName`, `venueAddress`: venue details.
- `startsAt`, `endsAt`, `timezone`: schedule.
- `image`, `externalUrl`: media and destination.
- `featuredHome`, `homeSortOrder`: Home-page selection and order.
- `published`, `sortOrder`: visibility and general order.

An event does not require a program. Do not create a program merely because an event exists.

### CHStayCampaigns — Stay campaigns

`CHStayCampaigns` connects a commercial monthly page to exactly one location and
one calendar period. It must not be used to group events like a program.

Important fields:

- `campaignKey`, `name`: stable editorial identity.
- `location`: required reference to `CHLocations`.
- `period`: required `YYYY-MM` calendar period.
- `page`: required reference to the composed `CHPages` content.
- `legacyRouteParam`: optional redirect key for an old `/months/:slug` URL.
- `published`, `sortOrder`: visibility and order.

The combination of `location` and `period` must be unique.

### CHNewsArticles — News Articles

`CHNewsArticles` stores all long-form articles, not only news. It includes news, opinions, features, guides, and announcements.

Why one collection: all these content types share the same structure, route, SEO needs, and publishing workflow. `contentType` differentiates their editorial purpose.

Important fields:

- `title`, `slug`, `excerpt`, `body`: article content.
- `contentType`: one of `news`, `opinion`, `feature`, `guide`, or `announcement`.
- `category`: editorial topic, not the article format.
- `author`: reference to `CHPeople`.
- `publishedAt`: editorial publication date.
- `image`, `socialImage`: article and sharing media.
- `seoTitle`, `seoDescription`: search metadata.
- `featuredHome`, `homeSortOrder`: Home-page selection and order.
- `published`: public visibility.

Editorial rule: an opinion article must reference its author in `CHPeople`. Other content types may use an author when editorial attribution is required.

### CHDeals — Deals

`CHDeals` stores promotions and limited offers.

Important fields:

- `title`, `slug`, `eyebrow`, `description`, `terms`: promotional content.
- `image`: promotional media.
- `ctaLabel`, `routeKey`, `externalUrl`: action.
- `startsOn`, `endsOn`: validity period.
- `published`, `sortOrder`: visibility and order.

Marketing warning: `published=true` does not replace correct start and end dates. Validate both.

### CHTestimonials — Testimonials

`CHTestimonials` stores external opinions, reviews, and testimonials about Circles House.

Why this is separate from articles: a testimonial originates from an external person or platform and represents social proof, not an article written by the Circles House editorial team.

Important fields:

- `testimonialKey`: stable identifier.
- `quote`, `authorName`: testimonial content.
- `sourceLabel`, `sourceUrl`, `rating`: attribution.
- `location`: optional reference to `CHLocations`.
- `featuredHome`: Home-page selection.
- `published`, `sortOrder`: visibility and order.

### CHPartners — Partners

`CHPartners` stores organizations presented as Circles House partners.

Important fields:

- `name`, `slug`, `description`: identity and editorial content.
- `logo`, `url`: partner media and destination.
- `featured`: highlighted partner state.
- `published`, `sortOrder`: visibility and order.

### CHFaqs — FAQs

`CHFaqs` stores reusable questions and answers.

Why it is reusable editorial content: the same answer can appear on several pages or location contexts without being copied.

Important fields:

- `faqKey`: stable identifier.
- `question`, `answer`: visible content.
- `pages`: multi-reference to `CHPages`.
- `locations`: multi-reference to `CHLocations`.
- `published`, `sortOrder`: visibility and order.

### CHLegalPages — Legal Pages

`CHLegalPages` stores governed legal documents such as privacy, cookies, notice, and terms content.

Important fields:

- `title`, `slug`, `body`: document identity and content.
- `seoTitle`, `seoDescription`: search metadata.
- `version`, `effectiveFrom`: legal version information.
- `published`, `sortOrder`: visibility and order.

Marketing warning: legal content requires the appropriate business or legal approval before publication.

## 8. Page Composition Collections

Page composition describes how editorial blocks are assembled. These collections do not replace reusable entities or offering collections.

``` text
CHPages
   │ one page
   ├── CHPageSections
   │      │ one editorial block or component
   │      └── CHSectionItems
   │             repeated local cards, facts, benefits or subideas
   │
   └── may also display records from CHSpaces, CHRooms, CHEvents, etc.
```

### CHPages — Pages

`CHPages` identifies a public page and stores its route identity and page-level SEO.

It answers: **Which page is this? How is it found? Should it be indexed?**

Important fields:

- `pageKey`: stable internal page identifier.
- `pageType`: page classification.
- `routeKey`, `routeParam`: route identity.
- `seoTitle`, `seoDescription`, `socialImage`: search and sharing metadata.
- `noIndex`: tells search engines not to index the page when true.
- `published`: page availability.

`CHPages` does not need to contain all visible text. It provides the page identity that sections reference.

### CHPageSections — Page Sections

`CHPageSections` stores the major editorial blocks that compose a page, such as a hero, introduction, benefits block, FAQ heading, or call-to-action band.

It answers: **Which idea or component appears in this part of the page?**

Important fields:

- `sectionKey`: stable section identifier.
- `page`: reference to `CHPages`.
- `componentKey`: identifies the frontend component and semantic purpose.
- `eyebrow`, `title`, `subtitle`, `lead`, `body`, `note`: editorial content.
- `image`, `video`, `gallery`: media.
- Primary and secondary CTA fields: actions.
- `layoutVariant`: approved presentation variation.
- `enabled`: section visibility.
- `sortOrder`: section order within the page.

Marketing warning: `componentKey`, layout rules, and route fields are structural. Ask the Website Lead before changing them.

### CHSectionItems — Section Items

`CHSectionItems` stores repeated local content inside one section: benefit cards, metrics, topics, feature rows, or other repeated subideas.

It answers: **What repeated pieces make up this section's idea?**

Important fields:

- `itemKey`: stable item identifier.
- `section`: reference to `CHPageSections`.
- `label`, `title`, `subtitle`, `text`, `value`: flexible local content.
- `image`, `gallery`, `iconKey`: media and icon content.
- Link fields: optional action.
- `highlighted`, `wide`, `size`: approved presentation flags.
- `published`, `sortOrder`: visibility and order.

### Section Item versus reusable entity

A Section Item is not a required wrapper for every entity.

- A room exists in `CHRooms` even if no current page displays it.
- Rooftop access exists in `CHAmenities` because several records can reuse it.
- A benefit statement that only belongs to the Memberships benefits section belongs in `CHSectionItems`.
- A page can display entities directly without creating Section Items for them.

Use a Section Item when the content is a repeated editorial piece whose meaning depends on its parent section. Use a reusable entity when the record has its own identity outside that section.

## 9. How Relationships Work

### Reference

A reference field points to **one record** in another collection.

Example: one `CHRoom` references one `CHLocation`.

### Multi-reference

A multi-reference field points to **several selected records from one target collection**. It does not point to the whole collection.

Example: one `CHRoom` can reference several selected `CHAmenities` records.

### Main relationship map

``` text
CHAmenities ←── CHLocations
      ↑         CHSpaces
      └──────── CHRooms

CHLocations ←── CHPeople
      ↑         CHPrograms.locations ←── optional CHEvents.program
      ├──────── CHSpaces
      ├──────── CHRooms
      ├──────── CHEvents
      ├──────── CHStayCampaigns
      └──────── CHTestimonials

CHPeople ←───── CHNewsArticles.author

CHPages ←────── CHPageSections ←────── CHSectionItems
   ↑
   ├─────────── CHPrograms.page
   ├─────────── CHStayCampaigns.page
   └─────────── CHFaqs.pages

CHLocations ←─ CHFaqs.locations
```

Relationships can exist between records in the same category or different categories. Categories explain responsibility; references explain connection.

Because referenced information is reused, changing one entity may change several pages at once. Before editing a published location, person, amenity, program, or other referenced record, check where it is used and describe the expected impact in the ClickUp task.

## 10. How Multiple Locations Work

The model can support Madrid, Lisbon, London, and other locations because location-dependent records point to `CHLocations` instead of containing a hardcoded city. However, a new location is a **connected content package**, not just one new row.

``` text
CHLocations: Madrid
      │
      ├── CHPeople: Madrid house manager
      ├── CHSpaces: Madrid coworking, rooftop, spa...
      ├── CHRooms: Madrid room offerings
      ├── CHEvents and CHPrograms: Madrid activity
      ├── CHTestimonials and CHFaqs: Madrid context
      ├── CHPages: location and optional coworking page identities
      │      └── CHPageSections → CHSectionItems
      └── CHNavigationItems: approved entry points
```

The `CHLocations.slug` is the shared city identifier. For example, `madrid` can participate in destinations such as:

- `/locations/madrid`
- `/coworking/madrid`
- `/events?location=madrid`
- `/rooms/madrid`
- `/locations/madrid/stays/2027-06`

These destinations are supported by the model, but publishing `CHLocations` alone does not guarantee that every page has complete content. The required page composition and related offerings must also exist for the experiences being launched.

### New location content package

For every new location, use one coordinated ClickUp task or a group of linked tasks. Confirm:

1.  A complete `CHLocations` record exists with a unique approved slug, timezone, address, status, media, map information, and amenities.
2.  The required `CHPages` records exist for each approved location-specific experience, using the same route parameter as the location slug.
3.  Each page has its required `CHPageSections` and any local `CHSectionItems`.
4.  Rooms, spaces, people, events, programs, testimonials, and FAQs reference the correct location where applicable.
5.  Navigation records are added only for destinations approved for launch.
6.  Feature flags and ordering are deliberate; a new location must not appear on Home accidentally.
7.  The Website Lead confirms technical readiness for navigation, booking behavior, external integrations, and every intended route. CMS content does not configure external services by itself.
8.  The Website Lead verifies the mobile and desktop output before public launch.

Create and connect the package while records are unpublished whenever possible. Publish in a coordinated sequence so users do not reach an empty or partially composed location page.

## 11. Common Fields and Their Meaning

### Stable identifiers

Fields such as `slug`, `pageKey`, `sectionKey`, `itemKey`, `copyKey`, `amenityKey`, `faqKey`, and `testimonialKey` identify one record for the system.

- They must be unique within their collection.
- They normally use lowercase kebab-case or the established collection pattern.
- They should not be changed casually after a record is connected or published.
- Ask the Website Lead before changing an existing identifier.

A slug identifies one record, not the collection as a whole.

### published

`published` is a boolean visibility field. The website normally loads only records where `published=true`.

- `false`: keep the record unavailable to normal public queries.
- `true`: make the record eligible for display.

Saving a record and publishing it are different decisions. `published=true` does not guarantee that the record will appear: its parent page, required references, filters, dates, and frontend behavior must also permit it. `CHPageSections` uses `enabled` for section visibility.

### sortOrder and homeSortOrder

- `sortOrder` controls general display order within a result or parent context.
- `homeSortOrder` controls order specifically on the Home page.
- Use simple spaced numbers such as 10, 20, 30 when possible, so future records can be inserted between them.

### featuredHome

`featuredHome=true` selects a record for Home-page presentation. It does not automatically make an unpublished record visible.

### status

`status` describes a business state such as active or coming soon. It is not a replacement for `published`.

### Controlled values

Fields such as `contentType`, `personTypes`, `status`, `area`, `spaceType`, `routeKey`, `componentKey`, and some layout fields use values the website interprets. Reuse an existing approved value or follow the task specification. Do not create a new spelling, capitalization, or category because it appears reasonable; an unrecognized value may silently produce the wrong behavior.

### Dates and timezones

- Use the location's actual timezone for events and programs.
- Confirm whether a date field represents a calendar date or a precise date and time.
- For deals, verify both the business validity period and the intended publication state.
- Do not compensate for an incorrect timezone by manually shifting the displayed time.

### routeKey, routeParam, anchor, and externalUrl

- `routeKey`: approved internal destination type.
- `routeParam`: required identifier for parameterized routes such as a location, coworking page, or month.
- `anchor`: destination inside a page.
- `externalUrl`: full external destination.

Do not invent a new `routeKey`. Ask the Website Lead when the required destination is not already available.

### SEO fields

- `seoTitle`: search-result and browser title.
- `seoDescription`: summary search engines may use when presenting the result.
- `socialImage`: image used when a page or article is shared.
- `noIndex`: prevents a page from being intentionally offered for search-engine indexing.

Indexing means a search engine discovers, stores, understands, and may include a page in search results. SEO fields describe the page to search and sharing systems; they do not guarantee a ranking.

## 12. Choosing the Correct Collection

Ask these questions in order:

1.  **Does this change affect the whole site?** Use a Global collection.
2.  **Does the information represent a reusable person, place, amenity, or program?** Use a Reusable Entity collection.
3.  **Is it something Circles House offers customers?** Use an Offering collection.
4.  **Is it an article, event, promotion, testimonial, partner, FAQ, or legal document?** Use an Editorial collection.
5.  **Is it a page-specific block or repeated subidea?** Use Page Composition.

If two answers appear correct, stop and ask the Website Lead. Do not duplicate the information in both collections.

## 13. Safe Marketing Workflow

Use approved sources. Figma is a design reference and may contain intended copy, but business facts, prices, legal text, dates, addresses, availability, and external URLs still require an identified owner or source. If a task explicitly permits provisional copy, label it as provisional in ClickUp and do not present it as verified fact.

### Before editing (Marketing)

1.  Read the assigned ClickUp task and acceptance criteria.
2.  Confirm the exact `CH...` collection ID.
3.  Confirm whether the task creates, updates, unpublishes, or publishes records.
4.  Confirm required references and source content.
5.  Confirm whether the environment contains real production content.

### Creating a record (Marketing)

1.  Create the record with `published=false` when that field exists.
2.  Enter the approved stable identifier.
3.  Add the approved copy, dates, media, SEO, and URLs.
4.  Select references from existing records; do not recreate referenced information as text.
5.  Set ordering and feature flags deliberately.
6.  Check spelling, facts, image rights, and link destinations.
7.  Record the collection, record, and environment in the ClickUp task.
8.  Move the task to `IN REVIEW` with `CONTENT VERIFIED` evidence.

### Updating an existing published record (Marketing + Website Lead)

1.  Preserve or record the current value before a material change.
2.  Confirm whether the update will become visible immediately.
3.  Coordinate high-impact changes with the Website Lead.
4.  Verify references, links, dates, media, and visible output after saving.
5.  Record exactly what changed in the task.

### Publishing (Marketing + Website Lead)

1.  Marketing completes the content check and records `CONTENT VERIFIED`.
2.  The Website Lead validates collection choice, relationships, routes, and visible behavior.
3.  Marketing sets `published=true` when approval requires Marketing to perform the publication.
4.  The Website Lead validates the public or Wix Headless preview result.
5.  The Website Lead records `APPROVED` and completes the task.

Publishing is a release action, not merely the last field in a form. When several records form one experience, the Website Lead defines the publication sequence.

### Unpublishing or removal (Marketing + Website Lead)

- Prefer `published=false` when content must be hidden.
- Do not delete a record unless the Website Lead explicitly approves deletion.
- Before removal, check whether other records reference it.
- Preserve the reason and affected routes in the ClickUp task.

Live permissions intentionally allow CMS Editors to create and update CH records while removal is privileged.

### If a saved change is wrong (Marketing + Website Lead)

1.  Do not delete the record or attempt an undocumented bulk correction.
2.  If the record has a `published` field and hiding it is clearly safe, set it to `false`.
3.  For global records without a publication switch, contact the Website Lead immediately before making another change.
4.  Record the incorrect value, the correction made, the affected collection, and any visible route in ClickUp.
5.  Re-run the content verification and Website Lead review before republishing.

### Required ClickUp evidence

Use this compact structure when handing a CMS task to `IN REVIEW`:

``` text
CONTENT VERIFIED
Environment: [Wix environment]
Collections and records: [exact CH collection + record names/IDs]
Change: [created / updated / unpublished / prepared for publication]
References checked: [location, author, page, amenities, etc.]
Publication state: [published / unpublished / enabled / disabled]
Routes or previews checked: [URLs or preview locations]
Content source or approval: [where the approved information came from]
Known gaps: [none, or explicit remaining issue]
```

This evidence lets the Website Lead review the change without reconstructing what happened from the CMS history.

## 14. Marketing Learning Path

### Level 1 — Start here

Begin with one real, unpublished record in a simple editorial collection:

- `CHPartners`
- `CHTestimonials`

Practice:

1.  Find an existing record and identify its stable key or slug.
2.  Identify its visibility and ordering fields.
3.  Create or update approved real content.
4.  Attach media and validate its source.
5.  Submit the task for review without publishing it.

Do not create fake practice records in production.

### Level 2 — Connected content

Continue with collections that require dates, rich content, or relationships:

- `CHFaqs`
- `CHNewsArticles`
- `CHEvents`
- `CHDeals`
- `CHMembershipPlans`

Practice references, multi-references, dates, SEO, and publication checks.

### Level 3 — High-impact content

Edit these only through an explicit task and with Website Lead coordination:

- Global collections.
- `CHLocations`, `CHSpaces`, and `CHRooms`.
- Page composition collections.
- Navigation and route fields.
- Legal content.

## 15. Content Verification Checklist

Before writing `CONTENT VERIFIED`, Marketing confirms:

- [ ] I edited the correct `CH...` collection.
- [ ] The record represents the correct kind of information.
- [ ] The key or slug is unique and follows the established pattern.
- [ ] Required copy is complete and factually accurate.
- [ ] Dates and timezone are correct.
- [ ] References point to the intended records.
- [ ] Media is approved, correctly assigned, and cleared for use.
- [ ] URLs and calls to action open the intended destination.
- [ ] SEO fields are complete when the collection supports them.
- [ ] `published`, `enabled`, feature flags, and ordering are intentional.
- [ ] Provisional values are clearly identified.
- [ ] I recorded the affected environment and records in ClickUp.
- [ ] I did not change the collection structure.
- [ ] I did not delete or bulk-modify production content.

## 16. Common Mistakes and How to Avoid Them

### Mistake: Creating a Section Item for every entity

Correction: Section Items are local repeated editorial pieces. Rooms, people, spaces, amenities, and other reusable concepts belong in their entity collections.

### Mistake: Assuming a reference points to a collection

Correction: a reference selects one record; a multi-reference selects several records from one target collection.

### Mistake: Changing a key because the visible title changed

Correction: keys and slugs are system identifiers. Change visible content first and ask before changing an existing identifier.

### Mistake: Treating `status` as publication

Correction: business status and public visibility are separate. Check `published` or `enabled`.

### Mistake: Publishing before relationships are complete

Correction: create the record unpublished, complete references, submit it for review, then publish after approval.

### Mistake: Editing the Wix application Location collection

Correction: Circles House website locations belong in `CHLocations`.

### Mistake: Creating an event program for every event

Correction: programs group related events. An independent event needs a location but does not require a program.

### Mistake: Treating every article as news

Correction: use `contentType` to distinguish news, opinion, feature, guide, and announcement. Use `category` for the editorial topic.

## 17. When Marketing Must Stop and Ask

Stop editing and contact the Website Lead when:

- The required collection or field does not exist.
- A value does not fit the documented field type.
- A referenced record is missing.
- The task appears to require a new relationship.
- The route destination is unclear or requires a new `routeKey`.
- The change requires renaming or deleting an existing key or slug.
- The change affects several collections in an unexpected way.
- The request requires a bulk import, update, seed, or deletion.
- The visible site does not match the saved CMS record.
- Production contains conflicting or unexplained data.

Being blocked is safer than inventing a schema or duplicating content.

## 18. First CMS Task Completion Criteria

Marketing is ready to use the CMS independently for assigned content tasks after completing one reviewed task that demonstrates:

- Correct collection selection.
- Correct stable identifier.
- Accurate approved content.
- Correct reference usage when applicable.
- Safe unpublished creation or coordinated update.
- Complete `CONTENT VERIFIED` evidence.
- Successful Website Lead review.

The Website Lead remains responsible for the model, routes, technical behavior, and final approval.

## 19. Document Maintenance

This is the active Marketing guide for the Circles House CMS. The Website Lead owns it and updates it when any of the following changes:

- A collection, field, relationship, or permission is added, removed, or redefined.
- A route or publishing rule changes.
- Marketing responsibility or the review workflow changes.
- A repeated operational mistake reveals that the guidance is incomplete.

Only one version should be presented to Marketing as active. Earlier drafts are historical and must not be used as operating instructions. A change to this document should update the version, review date, and source verification statement.
