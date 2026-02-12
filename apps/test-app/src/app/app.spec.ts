import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TOGGLE_FACETS } from './filter.type';
import { FacetType } from '@wallaby-repro/shared-ui';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have toggle facets with correct type', () => {
    expect(TOGGLE_FACETS[0].facetType).toBe(FacetType.Toggle);
    expect(TOGGLE_FACETS[1].facetType).toBe(FacetType.Toggle);
  });
});
