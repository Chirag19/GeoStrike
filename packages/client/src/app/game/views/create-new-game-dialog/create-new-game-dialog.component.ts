import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CreateNewGame } from '../../../types';
import { ApolloQueryResult } from 'apollo-client';
import { AuthorizationMiddleware } from '../../../core/network/authorization-middleware';
import { ActiveGameService } from '../../services/active-game.service';
import { Router } from '@angular/router';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'create-new-game-dialog',
  templateUrl: './create-new-game-dialog.component.html',
  styleUrls: ['./create-new-game-dialog.component.scss']
})
export class CreateNewGameDialogComponent {
  private characterName: string = null;
  private loading = false;
  private gameCode: string = null;

  constructor(private dialogRef: MdDialogRef<any>,
              private router: Router,
              private gameService: GameService,
              private activeGameService: ActiveGameService) {
  }

  characterChanged(name) {
    this.characterName = name;
  }

  createGame() {
    this.loading = true;

    this.gameService.createNewGame(this.characterName).subscribe((result: ApolloQueryResult<CreateNewGame.Mutation>) => {
      this.loading = result.loading;

      if (!result.loading && result.data) {
        AuthorizationMiddleware.setToken(result.data.createNewGame.playerToken);
        this.gameCode = result.data.createNewGame.game.gameCode;
        this.activeGameService.current = result.data.createNewGame.game.id;
      }
    });
  }

  goToGame() {
    this.dialogRef.close();
    this.router.navigate(['/room']);
  }
}
