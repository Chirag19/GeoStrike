import { Component, Input } from '@angular/core';
import { AcNotification } from 'angular-cesium';
import { Observable } from 'rxjs/Observable';
import { UtilsService } from '../../../services/utils.service';
import { InterpolationService, InterpolationType } from '../../../services/interpolation.service';
import { PlayerFields } from '../../../../types';

@Component({
  selector: 'other-players',
  templateUrl: './other-players.component.html',
})
export class OtherPlayersComponent {
  @Input() private playersPositions: Observable<AcNotification>;
  playersPositionMap = new Map<string, any>();
  Cesium = Cesium;

  constructor(public utils: UtilsService) {
  }

  interpolatePlayerPosition(playerId, playerPosition) {
    const positionProperty = this.playersPositionMap.get(playerId);
    if (!positionProperty) {
      const result = InterpolationService.interpolate({
        data: playerPosition
      }, InterpolationType.POSITION);
      this.playersPositionMap.set(playerId, result);
      return result;
    }
    else {
      return InterpolationService.interpolate({
        data: playerPosition,
        cesiumSampledProperty: positionProperty,
      }, InterpolationType.POSITION);
    }
  }

  getOrientation(location, heading: number, player: PlayerFields.Fragment) {
    if (player.state === 'DEAD') {
      return this.utils.getOrientation(location, heading, 0, 90);
    } else {
      const playerHeading = player.type === 'PLAYER' ? heading : heading + 90;
      return this.utils.getOrientation(location, playerHeading);
    }
  }

  getModel(player: PlayerFields.Fragment) {
    if (player.type === 'PLAYER') {
      return '/assets/models/soldier.gltf';

    } else {
      return '/assets/models/Cesium_Man.gltf';
    }
  }

  getModelScale(player: PlayerFields.Fragment) {
    if (player.type === 'PLAYER') {
      return 0.01;

    } else {
      return 1.5;
    }
  }

  runAnimation(player: PlayerFields.Fragment) {
    return player.state === 'DEAD';
  }

  getIconPic(player: PlayerFields.Fragment){
    return player.team === 'BLUE' ? '/assets/icons/blue-mark.png' : '/assets/icons/red-mark.png';
  }




}