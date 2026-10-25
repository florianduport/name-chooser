import { pool } from '@/lib/postgres';
import type { Locale } from '@/lib/i18n';

export const PRODUCT_EVENT_NAMES = [
  'invite_created',
  'invite_shared',
  'invite_accepted',
  'invitee_finished',
  'result_share_created',
  'result_shared',
  'shared_result_viewed',
  'shared_result_conversion',
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export async function recordProductEvent({
  eventName,
  userId,
  tournamentId,
  shareToken,
  locale,
  metadata = {},
}: {
  eventName: ProductEventName;
  userId?: number | null;
  tournamentId?: string | null;
  shareToken?: string | null;
  locale?: Locale | null;
  metadata?: Record<string, unknown>;
}) {
  await pool.query(
    `INSERT INTO product_events
       (event_name, user_id, tournament_id, share_token, locale, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      eventName,
      userId ?? null,
      tournamentId ?? null,
      shareToken ?? null,
      locale ?? null,
      JSON.stringify(metadata),
    ],
  );
}
