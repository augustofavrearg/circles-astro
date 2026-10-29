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
};

let repositoryPromise: Promise<ContentRepository> | undefined;

export async function getContentRepository(): Promise<ContentRepository> {
  if (import.meta.env.CONTENT_SOURCE !== "wix") return fixtureRepository;
  repositoryPromise ??= import("./wix-cms").then(({ wixCmsRepository }) => wixCmsRepository);
  return repositoryPromise;
}
