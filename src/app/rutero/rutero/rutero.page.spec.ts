import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RuteroPage } from './rutero.page';

describe('RuteroPage', () => {
  let component: RuteroPage;
  let fixture: ComponentFixture<RuteroPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuteroPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RuteroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
