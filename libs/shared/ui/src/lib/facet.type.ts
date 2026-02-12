export enum FacetType {
  Checkbox = 'Checkbox',
  Radio = 'Radio',
  Select = 'Select',
  DateRange = 'DateRange',
  Toggle = 'Toggle',
}

export type Facet = {
  key: string;
  facetType: FacetType;
}
