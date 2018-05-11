import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SnapshotProvider } from '../../providers/snapshot/snapshot';
import { SnapListPage } from './snap-list';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    SnapListPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(SnapListPage),
  ],
  providers: [
    SnapshotProvider
  ]
})
export class SnapListPageModule {}
