import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Cuota } from 'src/app/models/ruta';
import { IsaService } from 'src/app/services/isa.service';
import { Chart, registerables  } from 'chart.js';
import { destroyView } from '@ionic/angular/directives/navigation/stack-utils';
Chart.register(...registerables);

@Component({
  selector: 'app-cuota',
  templateUrl: './cuota.page.html',
  styleUrls: ['./cuota.page.scss'],
})
export class CuotaPage {

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;

  cuotas: Cuota[] = [];
  cuota: Cuota = {
    anno: 0,
    mes: 0,
    ruta: '',
    cuota: 0,
    venta_Bruta:     0,
    devoluciones:    0,
    c__Devoluciones: 0,
    venta_Neta:      0,
    c__Alcance:      0,
    c__Margen:       0,
  };
  meta: number;
  doughnutChart: any;

  constructor( private navController: NavController,
               private isa: IsaService ) { 
    this.cuotas = this.isa.cargarCuota();
    if (this.cuotas.length !== 0 ){ 
      this.cuota = this.cuotas[this.cuotas.length-1];
      this.meta = this.cuota.c__Alcance / 100;
    }
  }

  ngAfterViewInit() {
    this.doughnutChartMethod();
  }

  refrescar(){
    this.doughnutChart.destroy();
    this.doughnutChartMethod();
  }

  doughnutChartMethod() {
    const avance = this.cuota.c__Alcance;
    const pendiente = 100 - avance;
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Avance', 'Pendiente'],
        datasets: [{
          label: 'Cumplimiento',
          data: [avance, pendiente],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#FF6384',
          ]
        }]
      }
    });
  }

  regresar(){
    this.navController.back();
  }

}
