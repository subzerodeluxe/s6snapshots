import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { Snapshot } from '../../models/snapshot.interface';
import { AuthProvider } from '../../providers/auth/auth';
import { SnapshotProvider } from '../../providers/snapshot/snapshot';
import { UtilProvider } from '../../providers/util/util';
import { Http } from '@angular/http';

@IonicPage({
  name: 'snaps' 
})
@Component({
  selector: 'page-snap-list',
  templateUrl: 'snap-list.html',
})
export class SnapListPage implements OnInit, OnDestroy {

  snapshots: Snapshot[];
  snapshotSubscription: Subscription;  
  fetchingData: boolean = false;  
 
  constructor(public navCtrl: NavController, public http: Http, public auth: AuthProvider, public util: UtilProvider,
    public snapProvider: SnapshotProvider, public modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.fetchingData = true;
    this.loadSnapshots();
    //this.loadMock(); 
  }

  doRefresh(refresher) {
    this.loadSnapshots(); 
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  loadMock() {
      this.http.get('./assets/example_data/lists.json')
       .toPromise()
       .then(response => { 
         this.snapshots = response.json(); 
         //console.log(response.json() as Snapshot)
        })
  }
  loadSnapshots() {
    this.snapshotSubscription = this.snapProvider.snapshotsChanged
      .subscribe((data) => {
        this.snapshots = data;
        this.fetchingData = false;  
      }); 
    this.snapProvider.fetchSnapshots();
  }

  logOut() {
    this.snapProvider.cancelSubscriptions(); 
    this.auth.logOut()
      .then(_ => {
        this.util.presentToast('Uitgelogd', 'bottom'); 
        this.navCtrl.setRoot('login');
      })
      .catch(err => {
        this.util.presentToast(err.message, 'bottom'); 
      });
  }

  editSnapshot(snapshot) {
    let params = { snapshot: snapshot, isEdited: true };
    let modal = this.modalCtrl.create('snapModal', params); 
    modal.present(); 
  }

  addSnapshot() {
    let modal = this.modalCtrl.create('snapModal');
    modal.onDidDismiss((data) => {
      if(data) {
        this.loadSnapshots();
      }
    });
    modal.present(); 
  }

  ngOnDestroy() {
    this.snapshotSubscription.unsubscribe(); 
  }
} 