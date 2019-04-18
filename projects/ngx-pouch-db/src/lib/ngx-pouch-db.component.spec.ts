import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPouchDBComponent } from './ngx-pouch-db.component';

describe('NgxPouchDBComponent', () => {
  let component: NgxPouchDBComponent;
  let fixture: ComponentFixture<NgxPouchDBComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxPouchDBComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxPouchDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
