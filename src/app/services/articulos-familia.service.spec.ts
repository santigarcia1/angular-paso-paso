import { TestBed } from '@angular/core/testing';

import { ArticulosFamiliaService } from './articulos-familia.service';

describe('ArticulosFamiliaServiceService', () => {
  let service: ArticulosFamiliaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticulosFamiliaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
