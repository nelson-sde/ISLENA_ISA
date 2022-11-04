import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { stringify } from 'querystring';
import { Categorias, ClienteNuevo } from 'src/app/models/cliente';
import { Email } from 'src/app/models/email';
import { RutasDist } from 'src/app/models/ruta';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.page.html',
  styleUrls: ['./nuevo.page.scss'],
})
export class NuevoPage implements OnInit {

  clienteNuevo = {
    nombre: '',
    razonSocial: '',
    representante: '',
    cedula: '',
    categoria: '',
    diaVisita: '',
    diaEntrega: '',
    horaEntrega: '',
    contacto: '',
    telefono: '',
    emailContacto: '',
    emailFE: '',
    provincia: '',
    canton: '',
    distrito: '',
    barrio: '',
    direccion: '',
    Latitud: 0,
    Longitud: 0,
    rutaDist: ''
  }
  categorias: Categorias[] = [];
  rutasDist: RutasDist[] = [];

  constructor( private modalCtrl: ModalController,
               private isa: IsaService,
               private geolocation: Geolocation ) { }

  ngOnInit() {
    this.categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    this.rutasDist = JSON.parse(localStorage.getItem('RutasDist')) || [];
  }

  geoReference(){
    this.isa.presentaLoading('Espere por favor...');
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp);
      this.isa.loadingDissmiss();
      this.clienteNuevo.Latitud = resp.coords.latitude;
      this.clienteNuevo.Longitud = resp.coords.longitude;

    }).catch((error) => {
       console.log('Error getting location', error);
       this.isa.loadingDissmiss();
    });
  }

  salvar(){
    this.actualizarDatos();
    this.enviarEmail();
    this.transmitirCliente();
    this.modalCtrl.dismiss();
  }

  actualizarDatos(){
    const i = this.categorias.findIndex( x => x.descripcion === this.clienteNuevo.categoria );
    if (i >= 0){
      this.clienteNuevo.categoria = this.categorias[i].categoriA_CLIENTE;
    }
    const j = this.rutasDist.findIndex( x => x.descripcion === this.clienteNuevo.rutaDist );
    if (i >= 0){
      this.clienteNuevo.rutaDist = this.rutasDist[i].ruta;
    }
    if (this.clienteNuevo.provincia === 'SAN JOSE'){
      this.clienteNuevo.provincia = '1';
    } else if (this.clienteNuevo.provincia === 'ALAJUELA'){
      this.clienteNuevo.provincia = '2';
    } else if (this.clienteNuevo.provincia === 'CARTAGO'){
      this.clienteNuevo.provincia = '3';
    } else if (this.clienteNuevo.provincia === 'HEREDIA'){
      this.clienteNuevo.provincia = '4';
    } else if (this.clienteNuevo.provincia === 'GUANACASTE'){
      this.clienteNuevo.provincia = '5';
    } else if (this.clienteNuevo.provincia === 'PUNTARENAS'){
      this.clienteNuevo.provincia = '6';
    } else {
      this.clienteNuevo.provincia = '7';
    }
  }

  transmitirCliente(){
    let cliente: ClienteNuevo = {
      ID:         this.clienteNuevo.cedula,
      Ruta:       this.isa.varConfig.numRuta,
      Fecha:      new Date(),
      Nombre:     this.clienteNuevo.nombre,
      Razon_Social: this.clienteNuevo.razonSocial,
      Representante: this.clienteNuevo.representante,
      Categoria:  this.clienteNuevo.categoria,
      Dia_Visita: this.clienteNuevo.diaVisita,
      Dia_Entrega: this.clienteNuevo.diaEntrega,
      Hora_Entrega: this.clienteNuevo.horaEntrega,
      Contacto:   this.clienteNuevo.contacto,
      Telefono:   this.clienteNuevo.telefono,
      Email:      this.clienteNuevo.emailContacto,   // email FE
      Provincia:  this.clienteNuevo.provincia,
      Canton:     '01', //this.clienteNuevo.canton,
      Distrito:    '01', //this.clienteNuevo.distrito,
      Direccion:  this.clienteNuevo.direccion,
      Latitud:    this.clienteNuevo.Latitud,
      Longitud:   this.clienteNuevo.Longitud,
      Estado:     'INI',
      Ruta_Distribucion: this.clienteNuevo.rutaDist,
    }
    this.isa.transmitirClienteNuevo( cliente );
  }

  enviarEmail(){
    let email: Email; 
    let body: string[] = [];
    let cuerpo: string;

    body.push(`<h1>Ruta: ${this.isa.varConfig.numRuta}</h1>`);
    body.push(`<h1>Cliente nuevo: ${this.clienteNuevo.nombre}</h1>`);
    body.push('<br/>');
    body.push('<TABLE BORDER>');
    body.push('<TR><TH>ITEM</TH><TH>VALORES</TH></TR>');
    body.push(`<TR><TD>Razón Social</TD><TD>${this.clienteNuevo.razonSocial}</TD></TR>`);
    body.push(`<TR><TD>Representante Legal</TD><TD>${this.clienteNuevo.representante}</TD></TR>`);
    body.push(`<TR><TD>Cédula Jurídica / Física</TD><TD>${this.clienteNuevo.cedula}</TD></TR>`);
    body.push(`<TR><TD>Categoría</TD><TD>${this.clienteNuevo.categoria}</TD></TR>`);
    body.push(`<TR><TD>Día de Visita</TD><TD>${this.clienteNuevo.diaVisita}</TD></TR>`);
    body.push(`<TR><TD>Día de Entrega</TD><TD>${this.clienteNuevo.diaEntrega}</TD></TR>`);
    body.push(`<TR><TD>Ruta de Entrega</TD><TD>${this.clienteNuevo.rutaDist}</TD></TR>`);
    body.push(`<TR><TD>Contacto</TD><TD>${this.clienteNuevo.contacto}</TD></TR>`);
    body.push(`<TR><TD>Teléfonos</TD><TD>${this.clienteNuevo.telefono}</TD></TR>`);
    body.push(`<TR><TD>Email Contacto</TD><TD>${this.clienteNuevo.emailContacto}</TD></TR>`);
    body.push(`<TR><TD>Email Factura Elec</TD><TD>${this.clienteNuevo.emailFE}</TD></TR>`);
    body.push(`<TR><TD>Provincia</TD><TD>${this.clienteNuevo.provincia}</TD></TR>`);
    body.push(`<TR><TD>Cantón</TD><TD>${this.clienteNuevo.canton}</TD></TR>`);
    body.push(`<TR><TD>Distrito</TD><TD>${this.clienteNuevo.distrito}</TD></TR>`);
    body.push(`<TR><TD>Barrio</TD><TD>${this.clienteNuevo.barrio}</TD></TR>`);
    body.push(`<TR><TD>Otras señas</TD><TD>${this.clienteNuevo.direccion}</TD></TR>`);
    body.push(`<TR><TD>Latitud</TD><TD>${this.clienteNuevo.Latitud}</TD></TR>`);
    body.push(`<TR><TD>Longitud</TD><TD>${this.clienteNuevo.Longitud}</TD></TR>`);
    body.push('</TABLE>');
    body.push('<br>');
    body.push('Este correo ha sido enviado de forma automática por medio de ISA, con carácter confidencial.<br/>');
    body.push('Favor no responder o escribir a esta cuenta, cualquier consulta pueden dirigirse con el vendedor a cargo de la ruta.<br/>');
    body.push('Distribuidora Isleña de Alimentos<br/>');
    cuerpo = body.join('');
    email = new Email( this.isa.varConfig.emailCxC, `Ruta: ${this.isa.varConfig.numRuta}. Solicitud Cliente Nuevo de Contado`, cuerpo );
    this.isa.enviarEmail( email );
    email.toEmail = this.isa.varConfig.emailVendedor;
    this.isa.enviarEmail( email );

    console.log('Formulario Enviado...');
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
