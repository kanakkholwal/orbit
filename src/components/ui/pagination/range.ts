/** First and last always shown; the window follows the current page. */
export function paginationRange(page: number, total: number, siblings = 1) {
	const out: (number | "gap")[] = [];
	const from = Math.max(2, page - siblings);
	const to = Math.min(total - 1, page + siblings);
	out.push(1);
	if (from > 2) out.push("gap");
	for (let i = from; i <= to; i++) out.push(i);
	if (to < total - 1) out.push("gap");
	if (total > 1) out.push(total);
	return out;
}
