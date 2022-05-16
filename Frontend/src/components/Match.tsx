import React, { Component } from "react";
import Sketch from "react-p5";
import { io, Socket } from "socket.io-client"

let width = 954;
let height = 532;
let playerWidth = 15;
let finalScore = 5;

function PlayerInput(this: any)
{
	this.masterA = false;
	this.masterZ = false;
	this.slaveA = false;
	this.slaveZ = false;
}

function Player(this: any, x: number, y: number, w: number, h: number, score: number)
{
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.score = score;
}

function Ball(this: any, x: number, y: number, xv: number, yv: number, xr: number, yr: number)
{
	this.x = x;
	this.y = y;
	this.xv = xv;
	this.yv = yv;
	this.xr = xr;
	this.yr = yr;
}

function Game(this: any, playerOne: any, playerTwo: any, ball: any, cd: number)
{
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.ball = ball;
	this.countdown = cd;
}

function rand(min: number, max: number)
{
	return Math.random() * (max - min) + min;
}

function negRand()
{
	if (Math.random() > 0.5)
		return (-1);
	else
		return (1);
}

function gameEngine(game: any, socket: Socket, match_id: number)
{
	if(game.ball.x + game.ball.xv > width - playerWidth - game.ball.xr || game.ball.x + game.ball.xv < game.ball.xr + playerWidth)
	{
		if (game.ball.x + game.ball.xv > width - playerWidth - game.ball.xr)
		{
			if (game.ball.y >= game.playerTwo.y && game.ball.y <= game.playerTwo.y + game.playerTwo.h)
				game.ball.xv = -game.ball.xv;
			else
			{
				game.playerOne.score++;
				socket.emit('masterScored', match_id);
				delete game.ball;

				var a2 = rand(80, 120);
				var b2 = 200 - a2;
				game.ball = new Ball(width / 2, height / 2, Math.sqrt(a2) * negRand(), Math.sqrt(b2) * negRand(), 20, 20);
			}
		}
		else if (game.ball.x + game.ball.xv < game.ball.xr + playerWidth)
		{
			if (game.ball.y >= game.playerOne.y && game.ball.y <= game.playerOne.y + game.playerOne.h)
				game.ball.xv = -game.ball.xv;
			else
			{
				game.playerTwo.score++;
				socket.emit('slaveScored', match_id);
				delete game.ball;

				var a22 = rand(80, 120);
				var b22 = 200 - a22;
				game.ball = new Ball(width / 2, height / 2, Math.sqrt(a22) * negRand(), Math.sqrt(b22) * negRand(), 20, 20);
			}
		}
	}
	if (game.ball.y + game.ball.yv > height - game.ball.yr || game.ball.y + game.ball.yv < game.ball.yr)
		game.ball.yv = - game.ball.yv;

	game.ball.x += game.ball.xv;
	game.ball.y += game.ball.yv;
}

function playerMove(this: any, game: any, playerInput: any)
{
	if (playerInput.masterA === true && game.playerOne.y >= 0 && this.started === 1)
	{
		if (game.playerOne.y !== 0)
			game.playerOne.y -= 5;
	}
	if (playerInput.masterZ === true && game.playerOne.y < height - 100 && this.started === 1)
		game.playerOne.y += 5;

	if (playerInput.slaveA === true && game.playerTwo.y >= 0 && this.started === 1)
	{
		if (game.playerTwo.y !== 0)
			game.playerTwo.y -= 5;
	}
	else if (playerInput.slaveZ === true && game.playerTwo.y < height - 100 && this.started === 1)
		game.playerTwo.y += 5;
}

export class Match extends Component
{
	socket: Socket;
	type = "";
	started = 0;
	countdown = 3;
	fq = 30;
	match_id: number;
	match_size: number;
	slaveId: string;
	masterId: string;

	setup = (p5: any) =>
	{
		this.socket = io('http://localhost:8000', {withCredentials: true, transports: ['websocket', 'polling', 'flashsocket']});

		let cvn = p5.createCanvas(width, height);
		cvn.parent("gameArea");

		p5.background(0);
		p5.textSize(50);
		p5.fill(p5.color(255, 255, 255));
		p5.text('Waiting for other player...', 220, height / 2);

		//ICI IMPLEMENTER L'ATTENTE POUR LE MATCHMAKING, BOUTONS ETC...

		this.socket.emit('find_match');
		this.socket.on('launch_match', (data) => {
			this.match_id = data.id;
			this.match_size = data.room_size;
			this.slaveId = data.user2.username;
			this.masterId = data.user1.username;
			//on peut recup ici bcp d'autres data, genre la taille du match ou autres
		});

		if (this.match_size === 1)		//Master
		{
			this.type = "master";
			var a2 = rand(80, 120);
			var b2 = 200 - a2;

			var game = new Game(
				new Player(15, 150, playerWidth, 100, 0),
				new Player(770, 150, playerWidth, 100, 0),
				new Ball(width / 2, height / 2, Math.sqrt(a2) * negRand(), Math.sqrt(b2) * negRand(), 20, 20),
				this.countdown);

			var playerInput = new PlayerInput();

			p5.background(0);
			p5.textSize(50);
			p5.fill(p5.color(255, 255, 255));
			p5.text('Waiting for other player...', 120, height / 2);

			this.socket.on('updateMatch', (data) =>
			{
				p5.clear();
				p5.background(0);
				p5.printer(data);
			});

			this.socket.on('masterToMasterKeyPressed', data =>
			{
				if (data === 'a')
					playerInput.masterA = true;
				else if (data === 'z')
					playerInput.masterZ = true;
			});

			this.socket.on('slaveToMasterKeyPressed', data =>
			{
				if (data === 'a')
					playerInput.slaveA = true;
				else if (data === 'z')
					playerInput.slaveZ = true;
			});

			this.socket.on('masterToMasterKeyReleased', data =>
			{
				if (data === 'a')
					playerInput.masterA = false;
				else if (data === 'z')
					playerInput.masterZ = false;
			});

			this.socket.on('slaveToMasterKeyReleased', data =>
			{
				if (data === 'a')
					playerInput.slaveA = false;
				else if (data === 'z')
					playerInput.slaveZ = false;
			});

			this.socket.on('launchMatch', () =>
			{
				var counter = 0;
				this.socket.emit('sendUpdateMatch', this.match_id, game);
				this.socket.on('serverTick', () =>
				{
					if (counter <= this.fq * this.countdown)
						counter++;
					if (counter % this.fq === 0 && counter > 0)
					{
						game.countdown--;
						this.socket.emit('sendUpdateMatch', this.match_id, game);
					}
					if (counter > this.fq * this.countdown)
					{
						this.started = 1;
						playerMove(game, playerInput);
						gameEngine(game, this.socket, this.match_id);
						this.socket.emit('sendUpdateMatch', this.match_id, game);
					}
					if (game.playerOne.score >= finalScore || game.playerTwo.score >= finalScore)
						this.socket.emit("gameFinished");		//envoyer au server qui a gagne aussi ca serait pas mal lol
				});
			});

			this.socket.on('clientDisconnect', (data) =>
			{
				this.socket.off('serverTick');
				if (data === this.slaveId)
				{
					//le slave vient de se deco, master gagne par defaut et renvoie l'info au server
				}
			});

	}
		else if (this.match_size === 2)	//Slave
		{
			this.type = "slave";

			this.socket.emit('readyToStart', this.match_id,);
			this.started = 1;

			this.socket.on('updateMatch', (data) =>
			{
				p5.clear();
				p5.background(0);
				p5.printer(data);
			});

			this.socket.on('clientDisconnect', (data) =>
			{
				if (data === this.masterId)
				{
					//le master vient de se deco, slave gagne par defaut et renvoie l'info au server
				}
			});

		}
		else					//Spect
		{
			this.type = "spect";

			this.socket.on('updateMatch', (data) =>
			{
				p5.clear();
				p5.background(0);
				p5.printer(data);
			});
		}
	}

	draw = (p5: any) =>
	{}

	keyTyped = (p5: any) =>
	{
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.socket.emit('masterKeyPressed', this.match_id, p5.key);

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.socket.emit('slaveKeyPressed', this.match_id, p5.key);
	}

	keyReleased = (p5: any) =>
	{
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.socket.emit('masterKeyReleased', this.match_id, p5.key);

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.socket.emit('slaveKeyReleased', this.match_id, p5.key);
	}

	render()
	{
		return <Sketch setup={this.setup} draw={this.draw} keyTyped={this.keyTyped} keyReleased={this.keyReleased}/>
	}
}

export default Match;