
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { IsaService } from '../../services/isa.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  usuario: string;
  navegaA: string;
  usuarioForm = {
    usuarioF: '',
    claveF: '',
  }

  constructor( private navController: NavController,
               private activatedRoute: ActivatedRoute,
               private router: Router,
               private isa: IsaService ) {

    this.activatedRoute.params.subscribe((data: any) => {
      this.usuario = data.usuario;
      this.navegaA = data.navega;
    });
  }

  login(){
    if ( this.usuario === 'admin'){
      if ( this.usuarioForm.usuarioF === 'admin' && this.usuarioForm.claveF === environment.adminClave ){
        this.router.navigate([this.navegaA]);
      } else {
        this.isa.presentAlertW('', 'Usuario o clave incorrectos...');
      }
    } else if ( this.usuario === 'user'){
      if ( this.usuarioForm.usuarioF == this.isa.varConfig.usuario && this.usuarioForm.claveF == this.isa.varConfig.clave ){
        this.isa.userLogged = true;
        this.regresar();
      } else {
        this.isa.presentAlertW('', 'Usuario o clave incorrectos...');
      }
    } else if ( this.usuario === 'CXC' ){
      if ( this.usuarioForm.usuarioF === this.isa.varConfig.usuarioCxC && this.usuarioForm.claveF === this.isa.varConfig.claveCxC ){
        this.router.navigate([this.navegaA]);
      } else {
        this.isa.presentAlertW('', 'Usuario o clave incorrectos...');
      }
    }
  }

  regresar(){
    this.navController.back();
  }

}
