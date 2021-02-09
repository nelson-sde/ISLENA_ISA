import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
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
  cantInventario: number = 0;
  cantPedido: number = 0;
  i:          number;               // La posicion en el arreglo de Cardex donde esta el producto (-1 si no se halla)
  lineaCardex: Cardex;
  cardex: Cardex[] = [];

  constructor( private activatedRoute: ActivatedRoute,
               public isa: IsaService,
               private modalCtrl: ModalController,
               private navController: NavController,
               public isaCardex: IsaCardexService) {

    this.activatedRoute.params.subscribe((data: any) => {    // Como parametro ingresa al modulo la info del cliente del rutero
      this.codProducto = data.codProducto;
      this.nomProducto = data.nombreProd;
      this.cargarCardex();
      console.log(this.codProducto);
      if (this.codProducto !== 'null'){
        this.lineaCardex = new Cardex(this.isa.clienteAct.id, this.codProducto, this.nomProducto, 'Pedido', new Date(), null, null);
        this.agregaLineaCardex();
      }
    });
  }

  cargarCardex(){
    if (this.isaCardex.cardex.length > 0){
      this.cardex = this.isaCardex.cardex.filter( d => d.codCliente == this.isa.clienteAct.id && d.aplicado == false );
    }
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
    this.isaCardex.guardarCardex();
    this.navController.back();
  }

  async agregarProducto(){
    const modal = await this.modalCtrl.create({
      component: ProductosPage,
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data.codProducto !== null){
      this.lineaCardex = new Cardex(this.isa.clienteAct.id, data.codProducto, data.desProducto, 'Pedido', new Date(), null, null);
      this.agregaLineaCardex();
    }
  }

  guardarCardex(){
    this.isaCardex.guardarCardex();
    this.isaCardex.cardexSinSalvar = false;
    this.navController.back();
    this.navController.back();
  }

  borrarLinea( i: number ){
    let data: Cardex[] = [];

    this.isaCardex.borrarLinea( this.cardex[i].codProducto, this.cardex[i].codCliente );
    if (i > 0){
      data = this.cardex.slice(0, i);
    } 
    if (i+1 < this.cardex.length){
      data = data.concat(this.cardex.slice(i+1, this.cardex.length));
    }
    this.cardex = data.slice(0);
  }

}
