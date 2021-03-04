import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab3ConfigPageRoutingModule } from './tab3-config-routing.module';

import { Tab3ConfigPage } from './tab3-config.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab3ConfigPageRoutingModule
  ],
  declarations: [Tab3ConfigPage]
})
export class Tab3ConfigPageModule {}
