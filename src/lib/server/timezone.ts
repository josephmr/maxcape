export function resolveTimeZone(tz: string | null): string {
	if (!tz) return 'UTC';
	try {
		Intl.DateTimeFormat(undefined, { timeZone: tz });
		return tz;
	} catch {
		return 'UTC';
	}
}
