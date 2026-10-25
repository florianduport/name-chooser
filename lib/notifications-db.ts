import { pool } from '@/lib/postgres';
import type { Locale } from '@/lib/i18n';

export async function savePushSubscription(
  userId: number,
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  locale: Locale,
) {
  await pool.query(
    `INSERT INTO push_subscriptions
     (user_id, endpoint, p256dh, auth, locale)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       p256dh = EXCLUDED.p256dh,
       auth = EXCLUDED.auth,
       locale = EXCLUDED.locale,
       updated_at = NOW()`,
    [userId, subscription.endpoint, subscription.p256dh, subscription.auth, locale],
  );
}

export async function deletePushSubscription(userId: number, endpoint: string) {
  await pool.query(
    'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
    [userId, endpoint],
  );
}
