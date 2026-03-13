export function generateUniqueId(existingIds?: Iterable<string>): string {
  const usedIds = new Set(existingIds ?? []);

  let id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  while (usedIds.has(id)) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  return id;
}

export function ensureUniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seenIds = new Set<string>();

  return items.map((item) => {
    if (!item.id || seenIds.has(item.id)) {
      const newId = generateUniqueId(seenIds);
      seenIds.add(newId);
      return { ...item, id: newId };
    }

    seenIds.add(item.id);
    return item;
  });
}
