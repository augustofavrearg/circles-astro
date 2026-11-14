import { routes } from "./navigation";
import type { EditorialEntityType } from "@/domain/editorial";

export const ENTITY_ROUTE_EXPOSURE = {
  location: "detail",
  room: "detail",
  space: "detail",
  event: "detail",
  program: "detail",
  post: "detail",
  deal: "collection",
  partner: "external",
  person: "embedded",
  membershipPlan: "collection",
} as const satisfies Record<EditorialEntityType, "embedded" | "collection" | "detail" | "external">;

export type EntityRouteTarget = {
  type: EditorialEntityType;
  key: string;
  location?: string;
  externalUrl?: string;
};

function requiredLocation(target: EntityRouteTarget): string {
  if (!target.location) {
    throw new Error(`Editorial entityType "${target.type}" requires location context.`);
  }
  return target.location;
}
export function resolveEntityHref(target: EntityRouteTarget): string | undefined {
  switch (target.type) {
    case "location": return routes.location(target.key);
    case "room": return routes.locationRoom(requiredLocation(target), target.key);
    case "space": return routes.locationSpace(requiredLocation(target), target.key);
    case "event": return routes.event(target.key);
    case "program": return routes.program(target.key);
    case "post": return `${routes.posts}/${encodeURIComponent(target.key)}`;
    case "deal": return routes.deals;
    case "partner": return target.externalUrl;
    case "membershipPlan": return routes.memberships;
    case "person": return undefined;
  }
}
