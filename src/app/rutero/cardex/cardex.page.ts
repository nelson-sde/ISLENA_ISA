import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { Cardex, SugeridoBD } from 'src/app/models/cardex';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';
import { ProductosPage } from '../productos/productos.page';

@Component({
  selector: 'app-cardex',
  templateUrl: './cardex.page.html',
  styleUrls: ['./cardex.page.scss'],
})
export class CardexPage {
  codProducto: string;
  nomProducto: string;
  descuento: number;
  cantInventario: number = 0;
  cantPedido: number = 0;
  i:          number;               // La posicion en el arreglo de Cardex donde esta el producto (-1 si no se halla)
  lineaCardex: Cardex;
  cardex: Cardex[] = [];
  productos: Cardex[] = [];

  constructor( private isa: IsaService,
               private modalCtrl: ModalController,
               private navParams: NavParams,
               private navController: NavController,
               public isaCardex: IsaCardexService) {

    this.codProducto = this.navParams.get('codProd');
    this.descuento = this.navParams.get('desc');
    this.cardex = this.navParams.get('cardex');
    this.nomProducto = this.navParams.get('nombre');
    this.productos = this.navParams.get('productos');
    console.log(this.codProducto);
    if (this.codProducto !== null){
      this.lineaCardex = new Cardex(this.isa.clienteAct.id, this.codProducto, this.nomProducto, 'Pedido', new Date(), null, this.traerSugerido(this.codProducto), this.descuento);
      this.agregaLineaCardex();
    }
  }

  traerSugerido( codProducto: string ){
    let sugerido: number = 0;
    let sugeridos: SugeridoBD[] = [];

    if (localStorage.getItem('sugeridos')){
      sugeridos = JSON.parse( localStorage.getItem('sugeridos'));
    }
    if ( sugeridos.length > 0 ){
      const i = sugeridos.findIndex( d => d.cliente === this.isa.clienteAct.id && d.articulo === codProducto );
      if ( i >= 0 ){
        sugerido = sugeridos[i].canT_SUGERIDA;
      }
    }
    return sugerido; 
  }

  agregaLineaCardex(){
    const existe = this.cardex.find( d => d.codProducto == this.lineaCardex.codProducto );
    if ( !existe ){
      this.cardex.unshift(this.lineaCardex);
      this.isaCardex.cardex.unshift( this.lineaCardex );
      this.isaCardex.cardexSinSalvar = true;
    }
    
  }

  regresar(){
    this.modalCtrl.dismiss({cardex: this.cardex});
  }

  async agregarProducto(){
    const modal = await this.modalCtrl.create({
      component: ProductosPage,
      componentProps: {
        'cardex': this.productos,
        'mostrar': true,
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data.codProducto !== null){
      this.lineaCardex = new Cardex(this.isa.clienteAct.id, data.codProducto, data.desProducto, 'Pedido', new Date(), null, this.traerSugerido(data.codProducto), 0);
      this.agregaLineaCardex();
    }
  }

  guardarCardex(){
    this.isaCardex.guardarCardex( this.cardex );
    this.isaCardex.cardexSinSalvar = false;
    this.modalCtrl.dismiss();
    this.navController.back();
  }

  borrarLinea( i: number ){
    let data: Cardex[] = [];

    if (i > 0){
      data = this.cardex.slice(0, i);
    } 
    if (i+1 < this.cardex.length){
      data = data.concat(this.cardex.slice(i+1, this.cardex.length));
    }
    this.cardex = data.slice(0);
    this.isaCardex.cardexSinSalvar = true;
  }

}
