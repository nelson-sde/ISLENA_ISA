import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  isLoading = false;
  loading: HTMLIonLoadingElement ;


  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) { }


  async presentaLoading(message: string ){
    this.isLoading = true;
    await this.loadingCtrl.create({
      message: message ? message : 'Please wait...',
      spinner: 'circles',
      mode:'ios',
      translucent:true,
      id:'loading',
    }).then(loader => {
      loader.present().then(() => {
        if (!this.isLoading) {
          loader.dismiss();
        }
      });
    });
  }

  async   loadingDissmiss(){
    this.isLoading = false;
    let topLoader = await this.loadingCtrl.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss()))  this.loadingDissmiss();
      topLoader = await this.loadingCtrl.getTop();
    }
  }
  
  async  message(header:string,message:string){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: header,
      mode:'ios',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
}
 
}
