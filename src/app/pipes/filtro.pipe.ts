import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform(arreglo: any[], texto: string ='', columna: string = 'desProducto' ): any[] {
    if(texto=== ''){
      return arreglo;
    }
    const texto2 = texto.toLocaleUpperCase();
    console.log(texto2);
    //console.log(JSON.stringify(arreglo.filter(item => item[columna].includes(texto2))));
    return arreglo.filter(item => item[columna].includes(texto2));
   }

}
