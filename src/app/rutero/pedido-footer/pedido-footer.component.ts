import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Pedido } from 'src/app/models/pedido';

@Component({
  selector: 'app-pedido-footer',
  templateUrl: './pedido-footer.component.html',
  styleUrls: ['./pedido-footer.component.scss'],
})
export class PedidoFooterComponent {

  pedido: Pedido;
  st: string;
  iva: string;
  des: string;
  tot: string;

  constructor( private navParams: NavParams ) {
    this.pedido = this.navParams.get('value');
    console.log(this.pedido);
    this.st = this.colones(this.pedido.subTotal);
    this.iva = this.colones(this.pedido.iva);
    this.des = this.colones(this.pedido.descuento);
    this.tot = this.colones(this.pedido.total);
  }

  colones (amount, decimalCount = 2, decimal = ".", thousands = ","){
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    const negativeSign = amount < 0 ? "-" : "";
    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;
    return negativeSign + '¢' + (j ? i.substr(0, j) + thousands : '') + 
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + 
      (decimalCount ? decimal + Math.abs(amount - Number(i)).toFixed(decimalCount).slice(2) : "");
  }

}
