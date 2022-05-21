import Ball from "./ball.interface";
import Player from "./player.interface";

export default class Game
{
    constructor(public playerOne: Player, public playerTwo: Player, public ball: Ball, public countdown: number) {}
	
}