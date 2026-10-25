import webpush from 'web-push';
import { pool } from './postgres';
import { resolveLocale, translate, type Locale } from './i18n';

type NotificationKind = 'invitee_finished' | 'inviter_finished';

export function isPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT,
  );
}

export function buildTournamentPushPayload(
  kind: NotificationKind,
  actorName: string,
  inviteToken: string,
  locale: Locale,
  origin: string,
) {
  return {
    title: translate(locale, 'notification.title'),
    body: translate(
      locale,
      kind === 'invitee_finished'
        ? 'notification.inviteeFinished'
        : 'notification.inviterFinished',
      { name: actorName },
    ),
    url: `${origin}/invites/${inviteToken}?lang=${locale}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };
}

export async function sendTournamentPush(
  userId: number,
  kind: NotificationKind,
  actorName: string,
  inviteToken: string,
) {
  if (!isPushConfigured()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const result = await pool.query<{
    endpoint: string;
    p256dh: string;
    auth: string;
    locale: string;
  }>(
    `SELECT endpoint, p256dh, auth, locale
     FROM push_subscriptions
     WHERE user_id = $1`,
    [userId],
  );
  await Promise.all(result.rows.map(async (row) => {
    const locale = resolveLocale(row.locale);
    const origin = process.env.AUTH_URL ?? '';
    const payload = JSON.stringify(
      buildTournamentPushPayload(kind, actorName, inviteToken, locale, origin),
    );
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
      );
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
      } else {
        console.error('Push delivery failed:', error);
      }
    }
  }));
}
