import { pool } from '@/lib/postgres';
import type { Locale } from '@/lib/i18n';

export type AppNotification = {
  id: string;
  kind: 'invitee_finished' | 'inviter_finished';
  actorName: string;
  inviteToken: string;
  read: boolean;
  createdAt: string;
};

export async function getNotifications(userId: number) {
  const result = await pool.query<{
    id: string;
    kind: AppNotification['kind'];
    actor_name: string;
    invite_token: string;
    read_at: Date | null;
    created_at: Date;
  }>(
    `SELECT id, kind, actor_name, invite_token, read_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 30`,
    [userId],
  );
  const notifications = result.rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    actorName: row.actor_name,
    inviteToken: row.invite_token,
    read: Boolean(row.read_at),
    createdAt: row.created_at.toISOString(),
  }));
  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  };
}

export async function markNotificationRead(userId: number, id: string) {
  const result = await pool.query(
    `UPDATE notifications SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rowCount === 1;
}

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
