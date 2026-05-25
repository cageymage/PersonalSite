export function normalizeSubject(subject?: string): string {
	return subject?.trim() || 'Other';
}

export function slugifySubject(subject: string): string {
	return encodeURIComponent(
		subject
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	);
}
