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
  membershipsPageFixture,
  monthPagesFixture,
  partnershipsPageFixture,
  roomsFixture,
  siteSettingsFixture,
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
  async getCoworkingPage(city: string) {
    return coworkingPagesFixture.find((page) => page.city === city);
  },
  async getMonthPage(slug: string) {
    return monthPagesFixture.find((page) => page.slug === slug);
  },
  async getDeals() {
    return dealsFixture;
  },
  async getEventsPage() {
    return eventsPageFixture;
  },
  async getEvents(city?: string) {
    return city ? eventsFixture.filter((event) => event.city === city) : eventsFixture;
  },
  async getRooms(location?: string) {
    return location ? roomsFixture.filter((room) => room.locationId === location) : roomsFixture;
  },
  async getNewsArticles() {
    return homePageFixture.news.items.map((item) => ({
      ...item,
      slug: item.href.split("/").filter(Boolean).at(-1) ?? "news",
      body: [{ type: "paragraph" as const, text: item.excerpt }],
      seo: { title: item.title, description: item.excerpt },
    }));
  },
  async getNewsArticle(slug: string) {
    return (await this.getNewsArticles()).find((article) => article.slug === slug);
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
