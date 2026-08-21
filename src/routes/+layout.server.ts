import type { LayoutServerLoad } from './$types';
import { isManualEventAdmin, manualEventEntryEnabled } from '$lib/server/manualEventAuth';

export const load: LayoutServerLoad = ({ cookies }) => ({
	manualEventEntryEnabled: manualEventEntryEnabled(),
	isManualEventAdmin: isManualEventAdmin(cookies)
});
