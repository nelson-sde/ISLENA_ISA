import { Component } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams } from '@ionic/angular';
import { Cardex, SugeridoBD } from 'src/app/models/cardex';
import { Productos } from 'src/app/models/productos';
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
  //lineaCardex: Cardex;
  cardex: Cardex[] = [];
  productos: Cardex[] = [];

  constructor( private isa: IsaService,
               private modalCtrl: ModalController,
               private navParams: NavParams,
               private navController: NavController,
               private isaCardex: IsaCardexService,
               private alertCtrl: AlertController) {
    //debugger
    this.codProducto = this.navParams.get('codProd');
    this.descuento = this.navParams.get('desc');
    this.nomProducto = this.navParams.get('nombre');
    this.productos = this.navParams.get('productos');
    this.cardex = this.isaCardex.cargarCardexCliente( this.isa.clienteAct.id );
    console.log(this.codProducto);
    if (this.codProducto !== null){
      const linea = new Cardex(this.isa.clienteAct.id, '', this.codProducto, this.nomProducto, 'Pedido', new Date(), null, this.traerSugerido(this.codProducto), 
                        this.descuento, 0, 0, 0, 0);
      linea.precio = this.consultarPrecio( linea.codProducto );
      this.agregaLineaCardex( linea );
    }
  }

  consultarPrecio( id: string ){
    const i = this.isa.productos.findIndex( d => d.id === id );
    if ( i >= 0 ){
      return this.isa.productos[i].precio;
    } else {
      return 0;
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

  agregaLineaCardex( linea: Cardex ){
    const existe = this.cardex.find( d => d.codProducto === linea.codProducto );
    if ( !existe ){
      this.cardex.unshift(linea);
      //this.isaCardex.cardex.unshift( linea );
      this.isaCardex.cardexSinSalvar = true;
    }
  }

  regresar(){
    if ( this.cardex.length > 0 ){
      this.isaCardex.guardarCardex( this.cardex );
    }
    this.modalCtrl.dismiss();
  }

  async agregarProducto(){

    let prodArray: Productos[] = [];
    let linea: Cardex;

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
    
    if (data.productos !== null){
      prodArray = data.productos.slice(0);
      prodArray.forEach( d => {
        linea = new Cardex(this.isa.clienteAct.id, '', d.id, d.nombre, 'Pedido', new Date(), null, this.traerSugerido(d.id), 0, 0, 0, 0, 0);
        linea.precio = this.consultarPrecio( linea.codProducto );
        this.agregaLineaCardex( linea );
      });
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

  async ingresarMontos( i: number ){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Cantidades',
      inputs: [
        {
          name: 'Inventario',
          type: 'number',
          placeholder: 'Inventario',
          min: 0,
          max: 1000
        },
        {
          name: 'Descuento',
          type: 'number',
          placeholder: 'Descuento',
          min: 0,
          max: 1000
        },
        {
          name: 'Pedido',
          type: 'number',
          placeholder: 'Pedido',
          min: 0,
          max: 1000
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data.Pedido.length > 0){
              this.cardex[i].cantPedido = +data.Pedido;
            }
            if (data.Descuento.length > 0){
              this.cardex[i].descuento = +data.Descuento;
            }
            if ( data.Inventario.length > 0 ){
              this.cardex[i].cantInventario = +data.Inventario;
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
