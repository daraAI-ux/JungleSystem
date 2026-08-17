/**
 * Client-side team-chat read confirmation.
 *
 * Backend `ensureAiRoom` → `pruneAiRoomMembers` deletes admin/owner
 * TeamChatMember rows (including lastReadAt) on every rooms list. Mark-read
 * then appears to "stick" briefly and unread (often the whole DARA history)
 * comes back on the next poll. Keep a local confirm until a newer live
 * message arrives while the room is not being viewed.
 */

const confirmedReadAtByRoomId = new Map<string, number>();

export function confirmKolamTeamChatRoomRead(
  roomId: string | null | undefined,
  atMs: number = Date.now(),
) {
  const id = roomId?.trim();
  if (!id) {
    return;
  }
  confirmedReadAtByRoomId.set(id, atMs);
}

export function clearKolamTeamChatRoomReadConfirm(
  roomId: string | null | undefined,
) {
  const id = roomId?.trim();
  if (!id) {
    return;
  }
  confirmedReadAtByRoomId.delete(id);
}

export function isKolamTeamChatRoomReadConfirmed(
  roomId: string | null | undefined,
) {
  const id = roomId?.trim();
  return Boolean(id && confirmedReadAtByRoomId.has(id));
}

export function noteKolamTeamChatLiveMessageForReadConfirm({
  roomId,
  viewingRoomIds,
}: {
  roomId: string | null | undefined;
  viewingRoomIds?: Iterable<string | null | undefined> | null;
}) {
  const id = roomId?.trim();
  if (!id || !confirmedReadAtByRoomId.has(id)) {
    return;
  }

  const viewing = new Set(
    [...(viewingRoomIds ?? [])]
      .map(value => value?.trim())
      .filter((value): value is string => Boolean(value)),
  );
  if (viewing.has(id)) {
    // Still open — keep confirmed; caller rematches mark-read.
    return;
  }

  confirmedReadAtByRoomId.delete(id);
}

export function applyKolamTeamChatReadConfirmUnreadZero<
  T extends {_id?: string; unreadCount?: number},
>(items: T[]): T[] {
  if (confirmedReadAtByRoomId.size === 0) {
    return items;
  }

  return items.map(item => {
    const id = item._id?.trim();
    if (!id || !confirmedReadAtByRoomId.has(id) || (item.unreadCount ?? 0) <= 0) {
      return item;
    }
    return {...item, unreadCount: 0};
  });
}

/** Test helper — do not use in product UI. */
export function resetKolamTeamChatReadConfirmForTests() {
  confirmedReadAtByRoomId.clear();
}
