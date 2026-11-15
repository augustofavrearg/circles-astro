import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listCategories: vi.fn(),
  listPosts: vi.fn(),
}));

vi.mock("@wix/blog", () => ({
  categories: { listCategories: mocks.listCategories },
  posts: { listPosts: mocks.listPosts },
}));

import { getBlogPostsPage } from "./wix-blog";

describe("Wix Blog archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listCategories.mockResolvedValue({
      categories: [
        { _id: "news-id", slug: "news", label: "News", postCount: 1 },
        { _id: "guides-id", slug: "guides", label: "Guides", postCount: 0 },
      ],
    });
    mocks.listPosts.mockResolvedValue({
      posts: [{ _id: "post-id", slug: "new-location", title: "A new location", categoryIds: ["news-id"] }],
      metaData: { total: 1 },
    });
  });

  it("resolves a category slug to the Wix category ID before querying posts", async () => {
    await expect(getBlogPostsPage(1, 18, "news")).resolves.toMatchObject({
      activeCategory: { slug: "news", label: "News" },
      total: 1,
      items: [{ slug: "new-location", category: "News" }],
    });
    expect(mocks.listPosts).toHaveBeenCalledWith(expect.objectContaining({ categoryIds: ["news-id"] }));
  });

  it("keeps a valid empty category distinct from an unknown category", async () => {
    mocks.listPosts.mockResolvedValueOnce({ posts: [], metaData: { total: 0 } });

    await expect(getBlogPostsPage(1, 18, "guides")).resolves.toMatchObject({
      activeCategory: { slug: "guides", label: "Guides" },
      total: 0,
      items: [],
    });
    const missingCategory = await getBlogPostsPage(1, 18, "missing");
    expect(missingCategory).toMatchObject({
      total: 0,
      items: [],
    });
    expect(missingCategory).not.toHaveProperty("activeCategory");
  });
});
