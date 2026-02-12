import { FacetType, Facet } from '@wallaby-repro/shared-ui';

export const TOGGLE_FACETS: Facet[] = [
  {
    key: 'hasAttachments',
    facetType: FacetType.Toggle,
  },
  {
    key: 'showUnreadOnly',
    facetType: FacetType.Toggle,
  },
  
];
