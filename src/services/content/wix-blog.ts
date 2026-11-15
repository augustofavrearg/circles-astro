import { categories, posts } from "@wix/blog";
import type { NewsArticle, NewsItem, PostCategory, PostsPage } from "@/domain/content";
import { wixUrl } from "./wix-mappers";

const CACHE_TTL_MS = 30_000;
type BlogCategory = PostCategory & { id: string };
let categoryCache: { expiresAt: number; value: Promise<BlogCategory[]> } | undefined;

function formatDate(value: Date | null | undefined): string {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value)
    : "";
}

function categorySlug(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function blogCategories(): Promise<BlogCategory[]> {
  if (categoryCache && categoryCache.expiresAt > Date.now()) return categoryCache.value;

  const value = categories.listCategories({ paging: { limit: 100 } }).then((result) =>
    (result.categories ?? [])
      .filter((category): category is typeof category & { _id: string } => Boolean(category._id))
      .map((category) => ({
        id: category._id,
        slug: (category.slug || categorySlug(category.label || "Stories")).toLowerCase(),
        label: category.label || "Stories",
        postCount: category.postCount ?? 0,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
  );
  categoryCache = { expiresAt: Date.now() + CACHE_TTL_MS, value };
  return value;
}

function coverImage(post: posts.Post): string | undefined {
  const source = post.media?.wixMedia?.image
    || post.media?.embedMedia?.thumbnail?.url
    || post.heroImage;
  return wixUrl(source) || undefined;
}

function mapBlogPost(post: posts.Post, labels: Map<string, string>): NewsArticle {
  const slug = post.slug || post._id || "post";
  const category = post.categoryIds?.map((id) => labels.get(id)).find(Boolean) || "Stories";
  const excerpt = post.excerpt || post.contentText?.slice(0, 300) || "";

  return {
    title: post.title || "Untitled post",
    excerpt,
    contentType: post.featured ? "feature" : "news",
    category,
    date: formatDate(post.firstPublishedDate),
    image: coverImage(post),
    imageAlt: post.media?.altText || undefined,
    href: `/posts/${encodeURIComponent(slug)}`,
    slug,
    body: excerpt ? [{ type: "paragraph", text: excerpt }] : [],
    richContent: post.richContent,
    minutesToRead: post.minutesToRead,
    seo: {
      title: post.title || "Circles House post",
      description: excerpt,
    },
  };
}

export async function getBlogPostsPage(page = 1, pageSize = 18, categorySlug?: string): Promise<PostsPage> {
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const safePage = Math.max(1, Math.floor(page));
  const categoryItems = await blogCategories();
  const activeCategory = categorySlug
    ? categoryItems.find((category) => category.slug === categorySlug)
    : undefined;
  if (categorySlug && !activeCategory) {
    return {
      items: [],
      categories: categoryItems,
      page: safePage,
      pageSize: safePageSize,
      total: 0,
      pageCount: 1,
    };
  }

  const result = await posts.listPosts({
    ...(activeCategory ? { categoryIds: [activeCategory.id] } : {}),
    sort: "PUBLISHED_DATE_DESC",
    paging: { limit: safePageSize, offset: (safePage - 1) * safePageSize },
    fieldsets: ["URL"],
  });
  const labels = new Map(categoryItems.map((category) => [category.id, category.label]));
  const total = result.metaData?.total ?? result.posts?.length ?? 0;

  return {
    items: (result.posts ?? []).map((post) => mapBlogPost(post, labels)),
    categories: categoryItems.map(({ slug, label, postCount }) => ({ slug, label, postCount })),
    ...(activeCategory
      ? { activeCategory: { slug: activeCategory.slug, label: activeCategory.label, postCount: activeCategory.postCount } }
      : {}),
    page: safePage,
    pageSize: safePageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getFeaturedBlogPosts(limit = 6): Promise<NewsItem[]> {
  let [result, categoryItems] = await Promise.all([
    posts.listPosts({
      featured: true,
      sort: "PUBLISHED_DATE_DESC",
      paging: { limit: Math.min(100, Math.max(1, limit)) },
      fieldsets: ["URL"],
    }),
    blogCategories(),
  ]);
  if (!result.posts?.length) {
    result = await posts.listPosts({
      sort: "PUBLISHED_DATE_DESC",
      paging: { limit: Math.min(100, Math.max(1, limit)) },
      fieldsets: ["URL"],
    });
  }
  const labels = new Map(categoryItems.map((category) => [category.id, category.label]));
  return (result.posts ?? []).map((post) => mapBlogPost(post, labels));
}

export async function getBlogPost(slug: string): Promise<NewsArticle | undefined> {
  try {
    const [result, categoryItems] = await Promise.all([
      posts.getPostBySlug(slug, { fieldsets: ["URL", "RICH_CONTENT", "SEO", "CONTENT_TEXT"] }),
      blogCategories(),
    ]);
    const labels = new Map(categoryItems.map((category) => [category.id, category.label]));
    return result.post ? mapBlogPost(result.post, labels) : undefined;
  } catch (error) {
    const wixError = error as {
      httpStatus?: number;
      statusCode?: number;
      response?: { status?: number };
      details?: { applicationError?: { code?: string } };
      message?: string;
    };
    const status = Number(wixError.response?.status ?? wixError.httpStatus ?? wixError.statusCode);
    const code = wixError.details?.applicationError?.code?.toUpperCase();
    if (status === 404 || code?.includes("NOT_FOUND") || wixError.message?.toLowerCase().includes("not found")) {
      return undefined;
    }
    throw error;
  }
}
