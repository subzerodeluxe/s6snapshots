import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SnapModalPage } from './snap-modal';
import { ComponentsModule } from '../../components/components.module';
import { ImageProvider } from '../../providers/image/image';
import { Camera } from '@ionic-native/camera';

@NgModule({
  declarations: [
    SnapModalPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(SnapModalPage),
  ],
  providers: [
    Camera,
    ImageProvider
  ]
})
export class SnapModalPageModule {}
