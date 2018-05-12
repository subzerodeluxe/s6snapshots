import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, AlertController, ActionSheetController, normalizeURL } from 'ionic-angular';
import { Snapshot } from '../../models/snapshot.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilProvider } from '../../providers/util/util';
import { SnapshotProvider } from '../../providers/snapshot/snapshot';
import { ImageProvider } from '../../providers/image/image';
import { Camera } from '@ionic-native/camera';

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
  downloadURL: any; 
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  public snapImage: string = '';  
  public snapTitle: string = '';
  public snapDate: string = ''; // this.alertCtrl.formatDate(new Date());  
  public snapSummary: any = '';
  public snapTags: string[] = [];
  
  constructor(public navCtrl: NavController, public sheetCtrl: ActionSheetController, public viewCtrl: ViewController, public alertCtrl: AlertController, public snapService: SnapshotProvider,
    public imageService: ImageProvider, public camera: Camera, public util: UtilProvider, public formBuilder: FormBuilder, public platform: Platform, public navParams: NavParams) {
    this.initForm(); 

    if(this.navParams.get('isEdited')) {
      this.snapshot = this.navParams.get('snapshot');  
      this.snapTitle = this.snapshot.title; 
      this.snapImage = this.snapshot.image;
      // if(this.platform.is('cordova')) {
      //   this.snapImage = this.snapshot.image; 
      // } else { this.snapImage = 'http://kb4images.com/images/random-image/37670495-random-image.jpg'}
      this.snapDate = this.snapshot.date;
      this.snapSummary = this.snapshot.summary;
     
      this.snapshot.tags.forEach(tag => { 
        this.snapTags.push(tag); 
      }); 

      this.isEditable = true; 
    } else {
      this.snapDate = this.util.formatDate(new Date());
    }
  }

  initForm() {
    this.snapForm = this.formBuilder.group({
      'snapTitle': ['', [Validators.required, Validators.minLength(4), Validators.maxLength(25)]],
      'snapImage': ['',],
      'snapDate': ['', [Validators.required]],
      'snapSummary': ['',[Validators.required, Validators.maxLength(150), Validators.minLength(10)]],
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
              .then((data) => {
                this.snapImage = data;
                this.util.presentToast('Foto toegevoegd', 'top'); 
              })
              .catch(_ => {
                this.util.presentToast('Er ging iets mis. Probeer het opnieuw', 'top'); 
              });
            }
          }, 
          {
          text: 'Maak een nieuwe foto',
          handler: () => {
            this.imageService.selectImage(this.camera.PictureSourceType.CAMERA)
            .then((data) => {
              this.snapImage = data;
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
    let title     : string	= this.snapForm.controls["snapTitle"].value,
        summary   : string 	= this.snapForm.controls["snapSummary"].value,
        image     : string	= this.snapForm.controls["snapImage"].value,
        //image     : string  = 'https://wallpaperbrowse.com/media/images/750806.jpg',
        tags      : any     = this.snapForm.controls["snapTags"].value,
        date      : any     = this.snapForm.controls["snapDate"].value;

      if(this.isEditable) {
        //console.log('Still editable?'); 
        if(image !== this.snapImage) {
          //image = normalizeURL(image);
          
          this.snapService.uploadImage(image)
            .then(photoURL => { 
              this.util.presentToast('Bezig met het uploaden van de afbeelding', 'bottom');
              const uploadedImage = photoURL;
              const newSnapObject = {
	              title    : title,
	              summary  : summary,
                date     : date, 
                image    : uploadedImage,
                tags     : tags 
              }; 
        
              // Update existing snapshot in database 
              this.snapService.updateDatabase(this.snapshot.id, newSnapObject)
                .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is gewijzigd!', 'bottom');})
                .catch(err => { this.util.presentToast(err, 'bottom');})
            })
            // Somethin went wrong trying to upload the image to storage 
            .catch(() => this.util.presentToast('Er ging iets mis :(', 'bottom'))
          } else {
            const newSnapObject = {
              title    : title,
              summary  : summary,
              date     : date, 
              image    : this.snapImage, 
              tags     : tags
            }
            console.log('Invoked! 1');
            this.snapService.updateDatabase(this.snapshot.id, newSnapObject)
              .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is gewijzigd!', 'bottom');})
              .catch(err => { this.util.presentToast(err, 'bottom');}) 
        }
      } else {
        //this.util.presentToast('TESTING', 'bottom'); 
        //image = normalizeURL(image);
        //this.util.presentToast(JSON.stringify(image), 'bottom'); 
        this.snapService.uploadImage(image)
          .then(photoURL => { 
              this.util.presentToast('Bezig met het uploaden van de afbeelding', 'bottom');
              const uploadedImage = photoURL; 
              const newSnapObject = {
	              title    : title,
	              summary  : summary,
                date     : date, 
                image    : uploadedImage,
                tags     : tags 
              }; 
      
              // Add snapshot to database 
              this.snapService.addToDatabase(newSnapObject) 
                .then(success => { this.closeModal(); this.util.presentToast('Hoera! De snapshot is toegevoegd!', 'bottom');})
                .catch(err => { this.util.presentToast(err, 'bottom');})
            });
      };
  }

  deleteSnapshot() {
    // console.log('Doorgegeven id: ', this.snapshot.id); 
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