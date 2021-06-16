import { Pipe, PipeTransform } from '@angular/core';
import { Cliente } from '../models/cliente';

@Pipe({
  name: 'cliente'
})
export class ClientePipe implements PipeTransform {

  transform(value: string): string {
    let clientes: Cliente[] = [];

    clientes = JSON.parse( localStorage.getItem('clientes'));
    const cliente = clientes.find( d => d.id == value );
    if ( cliente !== undefined){ 
      return cliente.nombre;
    } else {
      return 'ND';
    }
  }

}
