import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cambiaBool'
})
export class CambiaBoolPipe implements PipeTransform {

  transform(value: boolean ): string {
    if ( value ){
      return 'Frio';
    } else {
      return 'Seco';
    }
  }

}
