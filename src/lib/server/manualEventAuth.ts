import { env } from '$env/dynamic/private';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const MANUAL_EVENT_COOKIE = 'maxcape_manual_admin';
export const MANUAL_EVENT_SESSION_SECONDS = 8 * 60 * 60;

export function manualEventEntryEnabled(): boolean {
	return Boolean(env.MANUAL_EVENT_ADMIN_PASSWORD && env.MANUAL_EVENT_SESSION_SECRET);
}

function safeEqual(left: string, right: string): boolean {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	return a.length === b.length && timingSafeEqual(a, b);
}

export function validAdminPassword(password: string): boolean {
	const expected = env.MANUAL_EVENT_ADMIN_PASSWORD;
	return expected ? safeEqual(password, expected) : false;
}

function signature(payload: string): string {
	return createHmac('sha256', env.MANUAL_EVENT_SESSION_SECRET ?? '')
		.update(payload)
		.digest('base64url');
}

export function createAdminSession(): string {
	const expiresAt = Math.floor(Date.now() / 1000) + MANUAL_EVENT_SESSION_SECONDS;
	const payload = String(expiresAt);
	return `${payload}.${signature(payload)}`;
}

export function validAdminSession(token: string | undefined): boolean {
	if (!manualEventEntryEnabled() || !token) return false;
	const [payload, suppliedSignature, extra] = token.split('.');
	if (!payload || !suppliedSignature || extra || !/^\d+$/.test(payload)) return false;
	if (Number(payload) <= Math.floor(Date.now() / 1000)) return false;
	return safeEqual(suppliedSignature, signature(payload));
}

export function isManualEventAdmin(cookies: Cookies): boolean {
	return validAdminSession(cookies.get(MANUAL_EVENT_COOKIE));
}

export function adminCookieOptions() {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'strict' as const,
		secure: env.NODE_ENV === 'production',
		maxAge: MANUAL_EVENT_SESSION_SECONDS
	};
}

export function requestHasValidOrigin(request: Request, url: URL): boolean {
	const origin = request.headers.get('origin');
	return origin === url.origin;
}
