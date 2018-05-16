import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Injectable()
export class ImageProvider {

  cameraImage: string;

    constructor(public camera: Camera) {}

    selectImage(sourceType): Promise<any> {
        return new Promise(resolve => {
            const options: CameraOptions = {
                quality: 33,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                sourceType: sourceType
            }
        this.camera.getPicture(options)
            .then((data) => {
                this.cameraImage = "data:image/jpeg;base64," + data;
                resolve(this.cameraImage);
            });
        });
    }
}