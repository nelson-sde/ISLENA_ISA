import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab3PopPageRoutingModule } from './tab3-pop-routing.module';

import { Tab3PopPage } from './tab3-pop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab3PopPageRoutingModule
  ],
  declarations: [Tab3PopPage]
})
export class Tab3PopPageModule {}
