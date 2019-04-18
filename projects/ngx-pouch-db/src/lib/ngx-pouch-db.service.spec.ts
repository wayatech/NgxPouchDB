import { TestBed } from '@angular/core/testing';

import { NgxPouchDBService } from './ngx-pouch-db.service';

describe('NgxPouchDBService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxPouchDBService = TestBed.get(NgxPouchDBService);
    expect(service).toBeTruthy();
  });
});
