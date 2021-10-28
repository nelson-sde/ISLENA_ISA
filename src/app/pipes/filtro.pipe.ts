import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform(arreglo: any[], texto: string ='', columna: string = 'agente' ): any[] {
    if(texto=== ''){
      return arreglo;
    }
    texto.toLocaleLowerCase();
    return arreglo.filter(item => item[columna].toLocaleLowerCase().includes(texto));
   }

}
