import type { ContentRepository } from "@/domain/content";
import { homePageFixture, roomsFixture, siteSettingsFixture } from "./fixtures";

export const fixtureRepository: ContentRepository = {
  async getSiteSettings() {
    return siteSettingsFixture;
  },
  async getHomePage() {
    return homePageFixture;
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
