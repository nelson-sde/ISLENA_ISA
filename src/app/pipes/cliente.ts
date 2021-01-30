import { Pipe, PipeTransform } from '@angular/core';
import { Cliente } from '../models/cliente';

@Pipe({
  name: 'cliente'
})
export class ClientePipe implements PipeTransform {

  transform(value: number): string {
    let clientes: Cliente[] = [];

    clientes = JSON.parse( localStorage.getItem('clientes'));
    const cliente = clientes.find( d => d.id == value );
    return cliente.nombre;
  }

}
