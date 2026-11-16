export function sectionDocumentKey(componentKey: string, sectionKey: string): string {
  if (componentKey === "deals.list") return "deals";
  return componentKey.split(".").at(-1) || sectionKey.split(".").at(-1) || "section";
}
