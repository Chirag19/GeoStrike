import { Component , OnInit } from '@angular/core';
import { CesiumService , GeoUtilsService , KeyboardControlParams , KeyboardControlService } from 'angular-cesium';
import { CharacterService , MeModelState , ViewState } from '../../../services/character.service';
import { GameService } from '../../../services/game.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'keyboard-control' ,
  template: '' ,
})
export class KeyboardControlComponent implements OnInit {
  inspector = false;

  constructor (private gameService: GameService ,
               private character: CharacterService ,
               private keyboardControlService: KeyboardControlService ,
               private cesiumService: CesiumService) {
  }

  buildMovementConfig (multipleBy) {
    return {
      validation: () => {
        return this.character.state === MeModelState.RUNNING || this.character.state === MeModelState.WALKING;
      } ,
      action: () => {
        const position = this.character.location;
        let speed = 0.15;

        if (this.character.state === MeModelState.RUNNING) {
          speed = 0.3;
        }

        this.character.location = GeoUtilsService.pointByLocationDistanceAndAzimuth(
          position ,
          multipleBy * speed ,
          Cesium.Math.toRadians(this.character.heading) ,
          true);
        this.gameService.updatePosition(this.character.location , this.character.heading);
      } ,
    } as KeyboardControlParams;
  }

  changeViewMove () {
    let newState = ViewState.SEMI_FPV;
    if (this.character.viewState === ViewState.SEMI_FPV) {
      newState = ViewState.FPV;
    }
    this.character.viewState = newState;
  }

  changeMeShootState () {
    let newState = MeModelState.WALKING;
    if (this.character.state !== MeModelState.SHOOTING) {
      newState = MeModelState.SHOOTING;
    }
    this.character.state = newState;
  }


  toggleInspector (inspectorClass) {
    if (!environment.production) {
      if (!this.inspector) {
        this.cesiumService.getViewer().extend(inspectorClass);
        this.inspector = true;
      } else {
        this.cesiumService.getViewer().cesiumInspector.container.remove();
        this.inspector = false;
      }
    }
  }

  ngOnInit () {
    this.keyboardControlService.setKeyboardControls({
      Forward: this.buildMovementConfig(-1) ,
      Backward: this.buildMovementConfig(1) ,
    } , (keyEvent: KeyboardEvent) => {
      if (keyEvent.code === 'KeyW' || keyEvent.code === 'ArrowUp') {
        if (this.character.state !== MeModelState.SHOOTING) {
          this.character.state = keyEvent.shiftKey ? MeModelState.RUNNING : MeModelState.WALKING;
        }
        return 'Forward';
      } else if (keyEvent.code === 'KeyS' || keyEvent.code === 'ArrowDown') {
        return 'Backward';
      } else {
        return String.fromCharCode(keyEvent.keyCode);
      }
    });

    // Regitster Other keys because keyboardControl key are triggered by cesium tick
    document.addEventListener('keydown' , (keyEvent: KeyboardEvent) => {
      switch (keyEvent.code) {
        case 'Tab':
          keyEvent.preventDefault();
          this.changeViewMove();
          break;
        case 'Space':
          keyEvent.preventDefault();
          this.changeMeShootState();
          break;
        case 'KeyI':
          this.toggleInspector(Cesium.viewerCesiumInspectorMixin);
          break;
        case 'KeyO':
          this.toggleInspector(Cesium.viewerCesium3DTilesInspectorMixin);
          break;
        default:
          break;
      }
    });
  }
}
