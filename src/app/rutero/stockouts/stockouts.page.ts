import { Component, Input, OnInit } from '@angular/core';
import { IsaService } from '../../services/isa.service';
import { ModalController } from '@ionic/angular';
import { Cardex, StockOuts } from 'src/app/models/cardex';
import { IsaCardexService } from '../../services/isa-cardex.service';

@Component({
  selector: 'app-stockouts',
  templateUrl: './stockouts.page.html',
  styleUrls: ['./stockouts.page.scss'],
})
export class StockoutsPage implements OnInit {

  @Input() stockOuts: StockOuts[];

  constructor( public isa: IsaService,
               private isaCardex: IsaCardexService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    this.stockOuts.forEach(x => {
      if (x.justificacion === 'FNE'){
        x.justificacion = 'Facturado No Entregado';
      } else if (x.justificacion === 'VE'){
        x.justificacion = 'Venta Extraordinaria';
      } else if (x.justificacion === 'FPV'){
        x.justificacion = 'Faltante PDV';
      } else if (x.justificacion === 'FDI'){
        x.justificacion = 'Faltante Isleña';
      }
    })
  }

  agregar(){
    let cardex: Cardex[] = [];
    let item: Cardex;
    let sugerido: number;
    let precio: number;
    let existe: number;

    this.stockOuts.forEach( x => {
      if ( x.justificacion !== 'VENCEN' ){
        existe = cardex.findIndex( y => y.codProducto === x.idProducto );
        if (existe === -1){ 
          sugerido = this.isaCardex.traerSugerido( x.idProducto );
          precio = this.isaCardex.consultarPrecio( x.idProducto );
          item = new Cardex(this.isa.clienteAct.id, '', x.idProducto, x.nombre, 'Pedido', new Date(), null, sugerido, 0, 0, 0, 0, precio);
          cardex.push(item);
        }
      }
    });
    this.isaCardex.guardarCardex(cardex);
    this.modalCtrl.dismiss();
    this.isa.presentaToast('Cardex guardado con Exito.');
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
