import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class UtilProvider {

  constructor(public toastCtrl: ToastController) { }

  presentToast(message, position) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: position
    });
    toast.present();
  }

  formatDate(date) {
    
    var monthNames = [
    "Januari", "Februari", "Maart",
    "April", "Mei", "Juni", "Juli",
    "Augustus", "September", "Oktober",
    "November", "December"
    ];

    var dayNames = [
      "Zondag", "Maandag", "Dinsdag", "Woensdag",
      "Donderdag", "Vrijdag", "Zaterdag", 
    ];

    var day = date.getDate();
    var dayIndex = date.getDay(); 
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return dayNames[dayIndex] + ' ' + day + ' ' + monthNames[monthIndex] + ' ' + year;
  } // formatDate() 


}
