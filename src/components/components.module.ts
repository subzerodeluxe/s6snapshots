import { NgModule } from '@angular/core';
import { PreloadImageComponent } from './preload-image/preload-image';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';

@NgModule({
	declarations: [PreloadImageComponent],
	imports: [CommonModule, IonicModule],
	exports: [PreloadImageComponent]
})
export class ComponentsModule {}
