import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController, ActionSheetController, normalizeURL } from 'ionic-angular';
import { Snapshot } from '../../models/snapshot.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilProvider } from '../../providers/util/util';
import { SnapshotProvider } from '../../providers/snapshot/snapshot';
import { ImageProvider } from '../../providers/image/image';
import { Camera } from '@ionic-native/camera';
import { tap } from 'rxjs/operators';

@IonicPage({
  name: 'snapModal'
})
@Component({
  selector: 'page-snap-modal',
  templateUrl: 'snap-modal.html',
})
export class SnapModalPage {
  
  isEditable: boolean = false; 
  snapshot: Snapshot;
  snapForm: FormGroup; 

  public snapImage: string = '';  
  public snapTitle: string = '';
  public snapDate: any;    
  public snapSummary: any = '';
  public snapTags: string[] = [];
  
  constructor(public navCtrl: NavController, public sheetCtrl: ActionSheetController, public viewCtrl: ViewController, public alertCtrl: AlertController, public snapService: SnapshotProvider,
    public imageService: ImageProvider, public camera: Camera, public util: UtilProvider, public formBuilder: FormBuilder, public platform: Platform, public navParams: NavParams) {
    this.initForm(); 

    if(this.navParams.get('isEdited')) {
      this.snapshot = this.navParams.get('snapshot');  
      
      this.snapTitle = this.snapshot.title; 
      this.snapImage = this.snapshot.image;
      this.snapSummary = this.snapshot.summary;
      this.snapDate = this.snapshot.createdAt; 
     
      this.snapshot.tags.forEach(tag => { 
        this.snapTags.push(tag); 
      }); 

      this.isEditable = true;  
    } 
  }

  initForm() {
    this.snapForm = this.formBuilder.group({
      'snapTitle': ['', [Validators.required, Validators.minLength(20), Validators.maxLength(25)]],
      'snapImage': ['',],
      'snapSummary': ['',[Validators.required, Validators.maxLength(250), Validators.minLength(10)]],
      'snapTags': ['', [Validators.required]]
    });
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  selectImage() {
    this.presentActionSheet(); 
  }

  presentActionSheet() {
    let actionSheet = this.sheetCtrl.create({
      title: 'Selecteer een afbeelding',
      buttons: [
        {
          text: 'Kies bestaande foto',
          handler: () => {
            this.imageService.selectImage(this.camera.PictureSourceType.PHOTOLIBRARY)
              .then((base64) => {
                this.snapImage = base64;
                this.util.presentToast('Foto toegevoegd', 'bottom'); 
              })
              .catch(_ => {
                this.util.presentToast('Er ging iets mis. Probeer het opnieuw', 'bottom'); 
              });
            }
          }, 
          {
          text: 'Maak een nieuwe foto',
          handler: () => {
            this.imageService.selectImage(this.camera.PictureSourceType.CAMERA)
            .then((base64) => {
              this.snapImage = base64;
              this.util.presentToast('Foto toegevoegd', 'top'); 
            })
            .catch(_ => {
              this.util.presentToast('Er ging iets mis. Probeer het opnieuw', 'top'); 
            });
          }
        },
          {
          text: 'Cancel',
          role: 'cancel'
          }
        ]
      });
      actionSheet.present();
    }

  saveSnapshot() {
    this.util.presentToast('Save snapshot function', 'bottom'); 

    let title     : string	= this.snapForm.controls["snapTitle"].value,
        summary   : string 	= this.snapForm.controls["snapSummary"].value,
        image     : string	= this.snapForm.controls["snapImage"].value,
        tags      : any     = this.snapForm.controls["snapTags"].value
        
      if(this.isEditable) {
        if(image !== this.snapImage) {
          this.snapService.startUpload(image)
            .then((photoURL) => {
              const uploadedImage = photoURL;

              const newSnapObject = {
                title    : title,
                summary  : summary,
                image    : uploadedImage,
                tags     : tags 
              }; 
              this.snapService.updateDatabase(this.snapshot.id, newSnapObject)
                  .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is gewijzigd!', 'bottom');})
                  .catch(() => { this.util.presentToast('Er ging iets mis met het plaatsen van de snapshot :(', 'bottom')})
              })
            .catch(() => this.util.presentToast('Er ging iets mis met het uploaden van de afbeelding :(', 'bottom'))
        } else {
          const newSnapObject = {
            title    : title,
            summary  : summary,
            image    : this.snapImage, 
            tags     : tags
          }
        
          this.snapService.updateDatabase(this.snapshot.id, newSnapObject)
            .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is gewijzigd!', 'bottom');})
            .catch(() => { this.util.presentToast('Er ging iets mis met het plaatsen van de snapshot :(', 'bottom')})
          }
      } else {
        this.snapService.startUpload(image)
          .then((photoURL) => {
            const uploadedImage = photoURL;

            const newSnapObject = {
              title    : title,
              summary  : summary,
              image    : uploadedImage,
              tags     : tags 
            }; 
            this.snapService.updateDatabase(this.snapshot.id, newSnapObject)
              .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is toegevoegd!', 'bottom');})
              .catch(() => { this.util.presentToast('Er ging iets mis :(', 'bottom')})
          })
          .catch(() => this.util.presentToast('Er ging iets mis met het uploaden van de afbeelding :(', 'bottom'))
      };
  }

  deleteSnapshot() {
     this.snapService.deleteSnapshot(this.snapshot.id)
       .then(() => { 
        this.util.presentToast('Snapshot is verwijderd', 'bottom');
         setTimeout(() => { 
          this.closeModal(); 
         }, 1000); 
       })
       .catch(err => this.util.presentToast('Kon snapshot niet verwijderen :(', 'bottom')); 
   }
}