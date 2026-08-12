export interface Env {
	BLIZZARD_CLIENT_ID: string;
	BLIZZARD_CLIENT_SECRET: string;
	WOW_REGION: string;
	WOW_REALM_SLUG: string;
	WOW_CHARACTER_NAME: string;
	ALLOWED_ORIGIN: string;
}

interface RaidBoss {
	name: string;
	difficulties: string[];
}

interface RaidGroup {
	raid: string;
	expansion: string;
	bosses: RaidBoss[];
}

interface RaidEntry {
	raid: string;
	bosses: RaidBoss[];
}

interface ExpansionGroup {
	expansion: string;
	raids: RaidEntry[];
}

const CACHE_TTL_SECONDS = 600;

function corsHeaders(env: Env): HeadersInit {
	return {
		'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

async function getAccessToken(env: Env): Promise<string> {
	const basicAuth = btoa(`${env.BLIZZARD_CLIENT_ID}:${env.BLIZZARD_CLIENT_SECRET}`);
	const response = await fetch(`https://${env.WOW_REGION}.battle.net/oauth/token`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${basicAuth}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: 'grant_type=client_credentials',
	});

	if (!response.ok) {
		throw new Error(`Blizzard OAuth token request failed: ${response.status} ${await response.text()}`);
	}

	const data = (await response.json()) as { access_token: string };
	return data.access_token;
}

async function fetchRaidEncounters(env: Env, accessToken: string): Promise<unknown> {
	const url =
		`https://${env.WOW_REGION}.api.blizzard.com/profile/wow/character/` +
		`${env.WOW_REALM_SLUG}/${env.WOW_CHARACTER_NAME}/encounters/raids` +
		`?namespace=profile-${env.WOW_REGION}&locale=en_US`;

	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!response.ok) {
		throw new Error(`Blizzard raid encounters request failed: ${response.status} ${await response.text()}`);
	}

	return response.json();
}

function isGenericExpansionLabel(name: string): boolean {
	return name.trim().toLowerCase() === 'current season';
}

// Blizzard's API lists some current-tier raids under multiple expansion
// entries (e.g. a generic "Current Season" placeholder alongside the real
// expansion name, or preview data under an upcoming expansion). Dedupe by
// raid name, merging difficulty badges and preferring the most specific
// (non-generic) expansion label.
// Groups raids by expansion, preserving expansion order of first
// appearance — since `sortedRaids` is already newest-first, this makes
// expansions come out newest-first too, without a second recency pass.
function groupByExpansion(sortedRaids: RaidGroup[]): ExpansionGroup[] {
	const groups: ExpansionGroup[] = [];
	const indexByExpansion = new Map<string, number>();

	for (const { expansion, raid, bosses } of sortedRaids) {
		let index = indexByExpansion.get(expansion);
		if (index === undefined) {
			index = groups.length;
			indexByExpansion.set(expansion, index);
			groups.push({ expansion, raids: [] });
		}
		groups[index].raids.push({ raid, bosses });
	}

	return groups;
}

function transformRaidEncounters(raw: any): ExpansionGroup[] {
	const expansions = raw?.expansions ?? [];
	const raidsByName = new Map<string, RaidGroup>();
	// Blizzard doesn't expose a raid release date, so we approximate
	// "newest content" using the most recent boss kill timestamp seen
	// anywhere in that raid — the closest real signal available.
	const lastKillByRaid = new Map<string, number>();

	for (const expansionEntry of expansions) {
		const expansionName = expansionEntry?.expansion?.name ?? 'Unknown Expansion';

		for (const instanceEntry of expansionEntry?.instances ?? []) {
			const raidName = instanceEntry?.instance?.name ?? 'Unknown Raid';
			const bossMap = new Map<string, Set<string>>();
			let raidLastKill = 0;

			for (const mode of instanceEntry?.modes ?? []) {
				const difficulty = (mode?.difficulty?.type ?? '').toLowerCase();
				if (!difficulty) continue;

				for (const encounter of mode?.progress?.encounters ?? []) {
					const bossName = encounter?.encounter?.name;
					if (!bossName) continue;

					if (!bossMap.has(bossName)) {
						bossMap.set(bossName, new Set());
					}
					bossMap.get(bossName)!.add(difficulty);

					const timestamp = encounter?.last_kill_timestamp;
					if (typeof timestamp === 'number' && timestamp > raidLastKill) {
						raidLastKill = timestamp;
					}
				}
			}

			lastKillByRaid.set(raidName, Math.max(lastKillByRaid.get(raidName) ?? 0, raidLastKill));

			const existing = raidsByName.get(raidName);
			if (!existing) {
				const bosses: RaidBoss[] = Array.from(bossMap.entries()).map(([name, difficulties]) => ({
					name,
					difficulties: Array.from(difficulties),
				}));
				raidsByName.set(raidName, { raid: raidName, expansion: expansionName, bosses });
				continue;
			}

			const mergedBosses = new Map<string, Set<string>>(
				existing.bosses.map((boss) => [boss.name, new Set(boss.difficulties)])
			);
			for (const [bossName, difficulties] of bossMap) {
				const set = mergedBosses.get(bossName) ?? new Set<string>();
				for (const difficulty of difficulties) set.add(difficulty);
				mergedBosses.set(bossName, set);
			}
			existing.bosses = Array.from(mergedBosses.entries()).map(([name, difficulties]) => ({
				name,
				difficulties: Array.from(difficulties),
			}));

			if (!isGenericExpansionLabel(expansionName)) {
				existing.expansion = expansionName;
			}
		}
	}

	const sortedRaids = Array.from(raidsByName.values()).sort(
		(a, b) => (lastKillByRaid.get(b.raid) ?? 0) - (lastKillByRaid.get(a.raid) ?? 0)
	);

	return groupByExpansion(sortedRaids);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders(env) });
		}

		if (request.method !== 'GET' || url.pathname !== '/raids') {
			return new Response('Not found', { status: 404, headers: corsHeaders(env) });
		}

		const cache = caches.default;
		const cacheKey = new Request(url.toString(), request);
		const cached = await cache.match(cacheKey);
		if (cached) {
			const cachedResponse = new Response(cached.body, cached);
			for (const [key, value] of Object.entries(corsHeaders(env))) {
				cachedResponse.headers.set(key, value);
			}
			return cachedResponse;
		}

		try {
			const accessToken = await getAccessToken(env);
			const raw = await fetchRaidEncounters(env, accessToken);
			const raids = transformRaidEncounters(raw);

			const response = new Response(JSON.stringify(raids), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
					...corsHeaders(env),
				},
			});

			await cache.put(cacheKey, response.clone());
			return response;
		} catch (error) {
			return new Response(JSON.stringify({ error: (error as Error).message }), {
				status: 502,
				headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
			});
		}
	},
};
