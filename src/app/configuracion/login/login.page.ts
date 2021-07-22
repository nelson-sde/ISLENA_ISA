
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Ejecutivas } from 'src/app/models/cobro';
import { environment } from 'src/environments/environment';
import { IsaService } from '../../services/isa.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  usuario: string;
  navegaA: string;
  ejecutivas: Ejecutivas[] = [];
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

  ngOnInit() {
    if ( this.usuario === 'CXC'){
      this.ejecutivas = JSON.parse(localStorage.getItem('ejecutivas'));
    }
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
      const i = this.ejecutivas.findIndex( d => d.usuario === this.usuarioForm.usuarioF );
      if ( i >= 0 ){
        if ( this.ejecutivas[i].usuario === this.usuarioForm.usuarioF && this.ejecutivas[i].clave === this.usuarioForm.claveF ){
          this.router.navigate([this.navegaA]);
        } else {
          this.isa.presentAlertW('', 'Usuario o clave incorrectos..');
        }
      } else {
        this.isa.presentAlertW('', 'Usuario o clave incorrectos...');
      }
    }
  }

  regresar(){
    this.navController.back();
  }

}
