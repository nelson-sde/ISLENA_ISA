import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-visita-det',
  templateUrl: './visita-det.page.html',
  styleUrls: ['./visita-det.page.scss'],
})
export class VisitaDetPage implements OnInit {

  @Input() i: number;

  nombre: string = '';
  efectiva: boolean = false;
  visitaCerrada: boolean = false;

  constructor( private isa: IsaService,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    const cliente = this.isa.clientes.find( d => d.id === this.isa.rutero[this.i].cliente);
    if (cliente !== undefined){
      this.nombre = cliente.nombre;
      if ( this.isa.rutero[this.i].razon === 'E' ){
        this.efectiva = true;
      }
      if ( this.isa.rutero[this.i].fin !== null ) {
        this.visitaCerrada = true;
      }
    }
  }

  cerrarVisita(){
    if ( !this.visitaCerrada ){
      this.isa.rutero[this.i].fin = new Date();
      this.visitaCerrada = true;
    }
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
