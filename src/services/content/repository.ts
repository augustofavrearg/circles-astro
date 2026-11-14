import type { ContentRepository } from "@/domain/content";
import {
  ambassadorsPageFixture,
  coworkingPagesFixture,
  dealsFixture,
  eventsFixture,
  eventsPageFixture,
  forInvestorsPageFixture,
  homePageFixture,
  lifePageFixture,
  locationPagesFixture,
  locationSpacesFixture,
  membershipsPageFixture,
  monthPagesFixture,
  partnershipsPageFixture,
  programPagesFixture,
  programsFixture,
  roomsFixture,
  roomsPageFixture,
  siteSettingsFixture,
  stayCampaignsFixture,
  teamMembersFixture,
  teamPageFixture,
  whatIsCirclesPageFixture,
} from "./fixtures";

export const fixtureRepository: ContentRepository = {
  async getSiteSettings() {
    return siteSettingsFixture;
  },
  async getHomePage() {
    return homePageFixture;
  },
  async getRoomsPage() {
    return roomsPageFixture;
  },
  async getSearchLocations() {
    return homePageFixture.searchLocations;
  },
  async getAmbassadorsPage() {
    return ambassadorsPageFixture;
  },
  async getPartnershipsPage() {
    return partnershipsPageFixture;
  },
  async getForInvestorsPage() {
    return forInvestorsPageFixture;
  },
  async getTeamPage() {
    return teamPageFixture;
  },
  async getTeamMembers() {
    return teamMembersFixture;
  },
  async getWhatIsCirclesPage() {
    return whatIsCirclesPageFixture;
  },
  async getMembershipsPage() {
    return membershipsPageFixture;
  },
  async getLifePage() {
    return lifePageFixture;
  },
  async getLocationPage(slug: string) {
    return locationPagesFixture.find((page) => page.slug === slug);
  },
  async getLocationSpaces(location: string) {
    return locationSpacesFixture.filter((space) => space.location.slug === location);
  },
  async getLocationSpace(location: string, space: string) {
    return locationSpacesFixture.find((item) => item.location.slug === location && item.routeSlug === space);
  },
  async getCoworkingPage(city: string) {
    return coworkingPagesFixture.find((page) => page.city === city);
  },
  async getMonthPage(slug: string) {
    return monthPagesFixture.find((page) => page.slug === slug);
  },
  async getStayCampaign(location: string, period: string) {
    return stayCampaignsFixture.find((campaign) => campaign.location.slug === location && campaign.period === period);
  },
  async getStayCampaignByLegacySlug(slug: string) {
    return stayCampaignsFixture.find((campaign) => campaign.legacyRouteParam === slug);
  },
  async getProgramPage(slug: string) {
    return programPagesFixture.find((page) => page.slug === slug);
  },
  async getPrograms() {
    return programsFixture;
  },
  async getDeals() {
    return dealsFixture;
  },
  async getEventsPage() {
    return eventsPageFixture;
  },
  async getEvents(filters = {}) {
    const programEvents = programPagesFixture.flatMap((program) => program.events);
    const events = [...new Map([...eventsFixture, ...programEvents].map((event) => [event.slug, event])).values()];
    return events.filter((event) => {
      if (filters.locations?.length && !filters.locations.includes(event.city)) return false;
      if (filters.programs?.length && (!event.program || !filters.programs.includes(event.program.slug))) return false;
      if (filters.month && event.monthKey !== filters.month) return false;
      return true;
    });
  },
  async getEvent(slug: string) {
    return (await this.getEvents()).find((event) => event.slug === slug);
  },
  async getRooms(location?: string) {
    return location ? roomsFixture.filter((room) => room.locationId === location) : roomsFixture;
  },
  async getPostsPage(page = 1, pageSize = 18) {
    const allItems = homePageFixture.news.items.map((item) => ({
      ...item,
      slug: item.href.split("/").filter(Boolean).at(-1) ?? "news",
      href: `/posts/${item.href.split("/").filter(Boolean).at(-1) ?? "news"}`,
      body: [{ type: "paragraph" as const, text: item.excerpt }],
      seo: { title: item.title, description: item.excerpt },
    }));
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.max(1, Math.floor(pageSize));
    const total = allItems.length;
    return {
      items: allItems.slice((safePage - 1) * safePageSize, safePage * safePageSize),
      page: safePage,
      pageSize: safePageSize,
      total,
      pageCount: Math.max(1, Math.ceil(total / safePageSize)),
    };
  },
  async getPost(slug: string) {
    return (await this.getPostsPage(1, 100)).items.find((article) => article.slug === slug);
  },
  async getLegalPage() {
    return undefined;
  },
};

let repositoryPromise: Promise<ContentRepository> | undefined;

export async function getContentRepository(): Promise<ContentRepository> {
  if (import.meta.env.CONTENT_SOURCE === "wix") {
    repositoryPromise ??= import("./wix-cms").then(({ wixCmsRepository }) => wixCmsRepository);
    return repositoryPromise;
  }

  if (import.meta.env.SEO_ALLOW_INDEXING === "true") {
    throw new Error("CONTENT_SOURCE=wix is required when SEO_ALLOW_INDEXING=true; fixture content cannot be published as production content.");
  }

  return fixtureRepository;
}
