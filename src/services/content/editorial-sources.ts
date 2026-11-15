import type { Room } from "../../domain/booking";
import type { ContentRepository, Deal, Partner } from "../../domain/content";
import {
  assertSectionSourceContext,
  type EditorialContext,
  type SectionSourceConfig,
} from "../../domain/editorial";

export type EditorialSourcePayloads = {
  "location.rooms": Room[];
  "deals.active": Deal[];
  "partners.published": Partner[];
};

type ImplementedSourceKey = keyof EditorialSourcePayloads;

const loaders: {
  [Key in ImplementedSourceKey]: (
    repository: ContentRepository,
    context: EditorialContext,
  ) => Promise<EditorialSourcePayloads[Key]>;
} = {
  "location.rooms": (repository, context) => repository.getRooms(context.location),
  "deals.active": (repository) => repository.getDeals(),
  "partners.published": (repository) => repository.getPartners(),
};

export async function resolveEditorialSource<Key extends ImplementedSourceKey>(
  repository: ContentRepository,
  source: SectionSourceConfig,
  context: EditorialContext,
  expectedKey: Key,
): Promise<EditorialSourcePayloads[Key]> {
  if (source.mode === "manual" || source.key !== expectedKey) {
    throw new Error(`Editorial section requires sourceKey "${expectedKey}".`);
  }
  assertSectionSourceContext(source, context);
  const items = await loaders[expectedKey](repository, context);
  return (source.limit ? items.slice(0, source.limit) : items) as EditorialSourcePayloads[Key];
}
