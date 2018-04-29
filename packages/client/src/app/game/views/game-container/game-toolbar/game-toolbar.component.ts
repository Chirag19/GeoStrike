import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { HowToPlayDialogComponent } from '../../how-to-play-dialog/how-to-play-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { GameService } from '../../../services/game.service';
import { CharacterService } from '../../../services/character.service';
import {SoundService} from '../../../services/sound.service';

@Component({
  selector: 'game-toolbar',
  template: `
    <div class="right-btn-panel">
      <button mat-icon-button class="help-btn" (click)="toggleMute()">
        <mat-icon [svgIcon]="mute ? 'volume-off' : 'volume'"></mat-icon>
      </button>
      <button mat-icon-button class="help-btn" (click)="toggleFullScreen()">
        <mat-icon [svgIcon]="fullScreenIcon"></mat-icon>
      </button>
      <button mat-icon-button class="help-btn" (click)="openHelp()">
        <mat-icon svgIcon="help"></mat-icon>
      </button>
      <button mat-icon-button class="help-btn" (click)="showMenu= !showMenu">
        <mat-icon svgIcon="setting"></mat-icon>
      </button>
    </div>
    <div class="settings-panel" *ngIf="showMenu" [excludeBeforeClick]="true" [delayClickOutsideInit]="100" (clickOutside)="showMenu=false">
      <div class="settings-item">GAME CODE: {{gameCode}}</div>

      <label class="settings-item">
        <input type="checkbox" (change)="checkClicked()">
        <strong *ngIf="fStatus">
          Flights Status: ON
        </strong>
        <strong *ngIf="!fStatus">
          Flights Status: OFF
        </strong>
      </label>
      <div class="settings-item" (click)="exitGame()">EXIT THE GAME</div>
    </div>
  `,
  styleUrls: ['./game-toolbar.component.scss']
})
export class GameToolbarComponent implements OnInit {

  @Input() gameCode: string;
  fStatus:boolean = true;
  @Output() flightStatus: EventEmitter<any> = new EventEmitter<any>(true);
  showMenu = false;
  mute = false;
  fullScreenIcon = 'full-screen';


  constructor(private  dialog: MatDialog,
              private gameService: GameService,
              private character: CharacterService,
              private audioService: SoundService) {
  }

  ngOnInit() {
  }

  openHelp() {
    this.dialog.open(HowToPlayDialogComponent, {
      height: '80%',
      width: '85%',
      panelClass: 'container-how-to-play'
    } as MatDialogConfig)
  }

  toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if ('requestFullScreen' in document.body) {
        document.body.requestFullscreen();
      } else if ('webkitRequestFullscreen' in document.body) {
        document.body.webkitRequestFullscreen();
      }
      this.fullScreenIcon = 'fullscreen-exit';

    } else {
      if ('exitFullscreen' in document) {
        document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        document.webkitExitFullscreen();
      }
      this.fullScreenIcon = 'full-screen';
    }
  }

  toggleMute() {
    this.audioService.toggleMute();
    this.mute = !this.mute;
  }

  checkClicked(){
    // console.log(`val: ${this.fStatus}`);
    if(this.fStatus){
      this.flightStatus.emit(false);
      this.fStatus = false;
    }
    else{
      this.fStatus = true;
      this.flightStatus.emit(true);

    }
    // console.log(`new val: ${this.fStatus}`);
  }

  exitGame() {
    const killSubscription = this.gameService.notifyKill(this.character.meFromServer.id)
      .subscribe(() => killSubscription.unsubscribe());
    location.href = '/';
  }

}
