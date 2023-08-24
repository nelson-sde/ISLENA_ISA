import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { PedWhatsAppDet, PedidoWhatsApp, PedidoWhatsappGet, PedidoWhatsappPut } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-ped-whatsapp',
  templateUrl: './ped-whatsapp.page.html',
  styleUrls: ['./ped-whatsapp.page.scss'],
})
export class PedWhatsappPage implements OnInit {

  pedidos: PedidoWhatsApp[] = [];

  constructor( public isa: IsaService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos(){
    let i = 0;
    let pedidosLS: PedidoWhatsappGet[] = [];

    pedidosLS = JSON.parse(localStorage.getItem('PedWhatsapp')) || [];
    console.log(pedidosLS);
    if (pedidosLS.length > 0){
      i = pedidosLS.findIndex( x => x.linea === 0);
      while (i >= 0) {
        const pedido = new PedidoWhatsApp(pedidosLS[i].idCliente, pedidosLS[i].nom_Clt, pedidosLS[i].pedido, 
                                          pedidosLS[i].fecha);
        const filtro = pedidosLS.filter( y => y.pedido === pedidosLS[i].pedido && y.linea > 0);

        filtro.forEach( z => {
          const j = this.isa.productos.findIndex( x => x.id === z.articulo);
          const item = new PedWhatsAppDet(z.articulo, this.isa.productos[j].nombre, z.cantidadPedida, z.precio, z.porcenDescuento);
          pedido.detalle.push(item);
        });

        const borrados = pedidosLS.filter( x => x.pedido !== pedidosLS[i].pedido);
        pedidosLS = borrados.slice(0);
        this.pedidos.push(pedido);

        if (pedidosLS.length > 0){
          i = pedidosLS.findIndex( x => x.linea === 0);
        } else {
          i = -1;
        }
      }
      console.log(this.pedidos);
    }
  }

  aprobar(i: number){
    let pedidos: Cardex[] = [];
    let pedidosSinCliente: Cardex[] = [];
    let nuevoArreglo: Cardex[] = [];
    const fecha = new Date();
    const pedidosLS: Cardex[] = JSON.parse(localStorage.getItem('cardexCliente')) || [];

    if (pedidosLS.length > 0){
      pedidos = pedidosLS.filter(x => x.codCliente == this.pedidos[i].idCliente);
      pedidosSinCliente = pedidosLS.filter(x=> x.codCliente !== this.pedidos[i].idCliente);
    }

    this.pedidos[i].detalle.forEach( x=> {
      const item = new Cardex(this.pedidos[i].idCliente, '', x.articulo, x.descripcion, 'Pedido', fecha, 0, x.cantidadPedida, x.porcenDescuento,
                            0, 0, 0, x.precio, 0, '', 0);
      pedidos.push(item);
    });

    nuevoArreglo = pedidosSinCliente.concat(pedidos);
    localStorage.setItem('cardexCliente', JSON.stringify(nuevoArreglo));

    this.actualizarBD(i);
    const pedidosWhatsapp: PedidoWhatsappGet[] = JSON.parse(localStorage.getItem('PedWhatsapp')) || [];
    const nuevoPedWhatsapp = pedidosWhatsapp.filter( x => x.pedido !== this.pedidos[i].pedido);
    localStorage.setItem('PedWhatsapp', JSON.stringify(nuevoPedWhatsapp));

    this.pedidos = [];
    this.cargarPedidos();
    this.isa.presentAlertW('Pedido', 'El pedido fue agregado a la lista del cliente.');
  }

  actualizarBD(i:  number){
    let j = 0;
    const pedidosWhatLS: PedidoWhatsappGet[] = JSON.parse(localStorage.getItem('PedWhatsapp')) || [];
    const arregloUpd = pedidosWhatLS.filter( x => x.pedido == this.pedidos[i].pedido);

    arregloUpd.forEach(x => {
      const item = new PedidoWhatsappPut(x.idCliente, x.pedido, x.linea, x.fecha, x.cantidadLineas, x.articulo, x.cantidadPedida, x.precio,
                        x.porcenDescuento, 'S', 'S');
      this.isa.putPedidosWhatsapp(item).subscribe(
        resp => {
          console.log(resp);
        }, error => {
          console.error(error.message);
        }
      )
    });
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
