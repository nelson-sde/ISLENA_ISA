import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {
  constructor(){}
  transform(arreglo: any[],
    texto: string = '',
    columna: string = ''): any[] {
      
   if(texto === ''){
     return arreglo;
   }
   if(!arreglo){
     return arreglo;
   }
   if(typeof(texto) == 'boolean'){
    console.log(arreglo)
    return arreglo.filter(
      item=> item[columna] == true
      );
   }
   
   // todas las busquedas de javascript son case sentisive
   
texto = texto.toLocaleLowerCase();
console.log(texto);
console.log(arreglo.filter(
  //  item=> item.title.toLocaleLowerCase().includes(texto)
  item=> item[columna]?.toLocaleLowerCase().includes(texto) 
  ))
 //  return null;
 return arreglo.filter(
 //  item=> item.title.toLocaleLowerCase().includes(texto)
 item=> item[columna]?.toLocaleLowerCase().includes(texto) 
 );


 }

}
