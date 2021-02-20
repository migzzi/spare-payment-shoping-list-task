export function getPropertiesFromRequest<T>(props: string[], body: any): T {
	return props
		.filter(p => body[p])
		.reduce((agg: any, p: string) => {
			agg[p] = body[p];
			return agg;
		}, {});
}
