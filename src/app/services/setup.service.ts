import { Injectable } from '@angular/core';
import companiesJSON from '../../assets/data/companies.json';
import { environment } from 'src/environments/environment';

interface modulos {
  id:string,
  name: string,
  title:string,
  description:string,
  image:string,
  url:string,
  included:boolean
}

interface company {
  companyCode: string,
  company: string,
  user: string,
  website: string,
  email: string,
  contact: string,
  preURL1: string,
  postURL1: string,
  preURL2: string,
  postURL2: string,
  mapboxKey: string,
  latitud: number,
  longitud: number,
  description: string,
  logo:string,
  taxId: string,
  fax: string,
  address: string,
  modules:modulos[]
}

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  company: company = null

  companies: company[] = companiesJSON;

  constructor() { }

  async cargarDatos(){

    const i = this.companies.findIndex( c => c.companyCode == environment.companyCode);
    
    if(i >=0){
      this.company = {
        companyCode: null,
        company: null,
        website: null,
        user: null,
        email: null,
        contact: null,
        preURL1: null,
        postURL1: null,
        preURL2: null,
        postURL2: null,
        mapboxKey: null,
        latitud: null,
        longitud: null,
        description: null,
        logo:null,
        taxId: null,
        fax: null,
        address: null,
        modules:null
      }
    
      this.company.companyCode = this.companies[i].companyCode;
      this.company.company = this.companies[i].company;
      this.company.website = this.companies[i].website;
      this.company.email = this.companies[i].email;
      this.company.contact = this.companies[i].contact;
      this.company.preURL1 = this.companies[i].preURL1;
      this.company.postURL1 = this.companies[i].postURL1;
      this.company.preURL2 = this.companies[i].preURL2;
      this.company.postURL2 = this.companies[i].postURL2;
      this.company.mapboxKey = this.companies[i].mapboxKey;
      this.company.latitud = this.companies[i].latitud;
      this.company.longitud = this.companies[i].longitud;
      this.company.description = this.companies[i].description;
      this.company.logo = this.companies[i].logo;
      this.company.taxId = this.companies[i].taxId;
      this.company.fax = this.companies[i].fax;
      this.company.address = this.companies[i].address
      this.company.modules = this.companies[i].modules
      console.log('informacion compañia', this.company);
          
    }else{
      console.log('error cargando datos de la compañia..')
    }
    
  }
}
