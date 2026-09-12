import { getRecommendedTools, getTool } from '$tools/list';

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';


export const load: PageLoad = ({ params }) => {
  const tool = getTool(params.slug);

  if (!tool) {
    error(404, 'Not found');
  }
  const recommended = getRecommendedTools(params.slug);
  return { tool, recommended };
};