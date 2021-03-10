import { Component } from '@angular/core';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-cobro-info',
  templateUrl: './cobro-info.page.html',
  styleUrls: ['./cobro-info.page.scss'],
})
export class CobroInfoPage {

  constructor( private isa: IsaService ) {
  }


}
