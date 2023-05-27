import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estados'
})
export class EstadosPipe implements PipeTransform {

  transform(value: string): string {
    if (value === 'E'){
      return 'Entrega Completa';
    } else if (value === 'P'){
      return 'Pendiente de Visita';
    } else if (value === 'I'){
      return 'Camión en el Cliente';
    } else if (value === 'X'){
      return 'Entrega Parcial';
    } else if (value === 'R'){
      return 'Reprogramado';
    } else if (value === 'C'){
      return 'Factura Anulada';
    } else {
      return 'ND';
    }
    
  }

}
