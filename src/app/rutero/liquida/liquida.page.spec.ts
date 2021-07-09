import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LiquidaPage } from './liquida.page';

describe('LiquidaPage', () => {
  let component: LiquidaPage;
  let fixture: ComponentFixture<LiquidaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LiquidaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
