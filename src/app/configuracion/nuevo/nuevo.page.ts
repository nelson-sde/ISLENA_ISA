import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { Categorias, ClienteNuevo, RutasCanton } from 'src/app/models/cliente';
import { Email } from 'src/app/models/email';
import { Cantones, Distritos, RutasDist } from 'src/app/models/ruta';
import { IsaService } from 'src/app/services/isa.service';

export interface Provincia  {
  Cod_Provincia: string,
  Provincia: string
}
export interface Barrios  {
  Cod_Provincia: string,
  Cod_Canton: string,
  Cod_Distrito: string,
  Cod_Barrio: string,
  Barrio: string
}
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
  rutasCanton: RutasCanton[] = [];
  cantones:  Cantones[] = [];
  distritos: Distritos[] = [];
  provincias: Provincia[] = [];
  barrios:Barrios[] = [];
  codProvincia: string = '';
  codCanton: string = '';
  codDistrito: string = '';
  codBarrio:string  = '';

  constructor( private modalCtrl: ModalController,
               private isa: IsaService,
               private geolocation: Geolocation ) { }

  ngOnInit() {
    this.provincias = JSON.parse('[{"Cod_Provincia": "1","Provincia": "San José"},{"Cod_Provincia": "2","Provincia": "Alajuela"},{"Cod_Provincia": "3","Provincia": "Cartago"},{"Cod_Provincia": "4","Provincia": "Heredia"},{"Cod_Provincia": "5","Provincia": "Guanacaste"},{"Cod_Provincia": "6","Provincia": "Puntarenas"},{"Cod_Provincia": "7","Provincia": "Limón"}]');
    console.log(this.provincias);
    this.categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    this.rutasCanton = JSON.parse(localStorage.getItem('RutasCanton')) || [];
  }

 async  CambiaProvincia(){
    this.distritos = [];
    this.barrios  = [];
    this.codCanton = null;
    this.codDistrito = null;
    this.clienteNuevo.canton = null;
    this.clienteNuevo.distrito = null;
    this.clienteNuevo.barrio = null;

    
    const i = this.provincias.findIndex( x => x.Provincia === this.clienteNuevo.provincia);
    if (i >= 0){
      this.codProvincia = this.provincias[i].Cod_Provincia;
      this.cantones =  await this.isa.syncCantonesToPromise(this.codProvincia);
    }
   
  }

 async CambiaCanton(){
  this.codDistrito = null;
  this.clienteNuevo.distrito = null;
  this.clienteNuevo.barrio = null;
  this.barrios  = [];

    const i = this.cantones.findIndex( x => x.Cod_Provincia === this.codProvincia && x.Canton === this.clienteNuevo.canton);
      if (i >= 0){
      this.codCanton = this.cantones[i].Cod_Canton;
      this.distritos = await this.isa.syncDistritosToPromise(this.codProvincia, this.codCanton);
      
    }
  }

 async  CambiaDistrito(){
    const i = this.distritos.findIndex( x => x.Cod_Provincia === this.codProvincia && x.Cod_Canton === this.codCanton && x.Distrito === this.clienteNuevo.distrito);
    if (i >= 0){
      this.codDistrito = this.distritos[i].Cod_Distrito;
    }
  this.barrios = await this.isa.syncGetBarriosToPromise(this.codProvincia,this.codCanton,this.codDistrito);
  }

  async geoReference(){
   await this.isa.presentaLoading('Espere por favor...');
    this.geolocation.getCurrentPosition().then(async (resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp);
      await this.isa.loadingDissmiss();
      this.clienteNuevo.Latitud = resp.coords.latitude;
      this.clienteNuevo.Longitud = resp.coords.longitude;

    }).catch(async (error) => {
       console.log('Error getting location', error);
       await this.isa.loadingDissmiss();
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
    const j = this.rutasCanton.findIndex( x => x.Provincia === this.codProvincia && x.Canton === this.codCanton );
    if (j >= 0){
      this.clienteNuevo.rutaDist = this.rutasCanton[j].Ruta;
    } else {
      this.clienteNuevo.rutaDist = 'ND'
    }
    this.clienteNuevo.provincia = this.codProvincia;
    this.clienteNuevo.canton = this.codCanton;
    this.clienteNuevo.distrito = this.codDistrito;
    console.log(this.clienteNuevo);
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
      Canton:     this.clienteNuevo.canton,
      Distrito:   this.clienteNuevo.distrito,
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
    //this.isa.enviarEmail( email );
     //email.toEmail = this.isa.varConfig.emailVendedor;
    email.toEmail = 'nelson@sde.cr';

    this.isa.enviarEmail( email );

    console.log('Formulario Enviado...');
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
