import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'difDias'
})
export class DifdiasPipe implements PipeTransform {

  transform( fecha: Date ): number {

    const fechaDoc = new Date(fecha);
    const hoy = new Date();
    const dif = +hoy - +fechaDoc;

    return Math.floor(dif / (1000 * 60 * 60 * 24));
  }

}
