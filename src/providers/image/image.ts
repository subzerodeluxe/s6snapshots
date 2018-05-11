import { Injectable } from '@angular/core';
import { Camera } from '@ionic-native/camera';

@Injectable()
export class ImageProvider {

  cameraImage: string;

  constructor(public camera: Camera) {}

    selectImage(sourceType): Promise<any> {
        return new Promise(resolve => {
            let cameraOptions = {
                sourceType         : sourceType, 
                destinationType    : this.camera.DestinationType.DATA_URL,
                correctOrientation : true,
                quality: 100,
                targetWidth: 900,
                targetHeight: 600,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                saveToPhotoAlbum: false
            };

        this.camera.getPicture(cameraOptions)
            .then((data) => {
                this.cameraImage = "data:image/jpeg;base64," + data;
                resolve(this.cameraImage);
            });
        });
    }
}