import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FiltroPipe } from './filtro.pipe';

@NgModule({
    declarations: [ FiltroPipe ],
    exports:[FiltroPipe,DatePipe],
    imports: [
      CommonModule
    ]
  })
  export class PipesModule { }