import React, { Component } from "react";
import Sketch from "react-p5";
import {io, Socket} from "socket.io-client"

let width = 800;
let height = 400;
let playerWidth = 15;

function Player(x, y, w, h, score)
{
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.score = score;
}

function Ball(x, y, xv, yv, xr, yr)
{
	this.x = x;
	this.y = y;
	this.xv = xv;
	this.yv = yv;
	this.xr = xr;
	this.yr = yr;
}

function Game(playerOne, playerTwo, ball, cd)
{
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.ball = ball;
	this.countdown = cd;
}

function rand(min, max)
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

function gameEngine(game)
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
				delete game.ball;

				var a2 = rand(80, 120);
				var b2 = 200 - a2;
				game.ball = new Ball(width / 2, height / 2, Math.sqrt(a2) * negRand(), Math.sqrt(b2) * negRand(), 20, 20);
			}
		}
	}
	if(game.ball.y + game.ball.yv > height - game.ball.yr || game.ball.y + game.ball.yv < game.ball.yr)
	{
		game.ball.yv = - game.ball.yv;
	}

	game.ball.x += game.ball.xv;
	game.ball.y += game.ball.yv;
}

//UP_ARROW = 26
//DOWN_ARROW = 25


export class Match extends Component
{
	socket: Socket;
	type = "";
	started = 0;
	countdown = 3;
	fq = 30;

	movePlayer(p5)
	{
		if (p5.keyIsDown(25) && this.type == "master" && this.started == 1)
			this.socket.emit('masterKeyPressed', 25);

		if (p5.keyIsDown(26) && this.type == "master" && this.started == 1)
			this.socket.emit('masterKeyPressed', 26);

		if (p5.keyIsDown(25) && this.type == "slave" && this.started == 1)
			this.socket.emit('slaveKeyPressed', 25);

		if (p5.keyIsDown(26) && this.type == "slave" && this.started == 1)
			this.socket.emit('slaveKeyPressed', 26);
	}

	setup = (p5) =>
	{
		this.socket = io('http://localhost:8000', {withCredentials: true});


		let cvn = p5.createCanvas(width, height);
		cvn.position(250, 220);												//gonna need some tweaks

		p5.background(0);
		p5.textSize(50);
		p5.fill(p5.color(255, 255, 255));
		p5.text('Waiting for other player...', 120, height / 2);			//add width change

		this.socket.emit('askConnectionNumber');
		this.socket.on('sendConnectionNb', (data) =>
		{
			if (data == "1")		//Master
			{
				this.type = "master";

				var a2 = rand(80, 120);
				var b2 = 200 - a2;

				var game = new Game(
					new Player(15, 150, playerWidth, 100, 0),
					new Player(770, 150, playerWidth, 100, 0),
					new Ball(width / 2, height / 2, Math.sqrt(a2) * negRand(), Math.sqrt(b2) * negRand(), 20, 20),
					this.countdown);

				p5.background(0);
				p5.textSize(50);
				p5.fill(p5.color(255, 255, 255));
				p5.text('Waiting for other player...', 120, height / 2);	//add width change

				this.socket.on('updateGame', (data) =>
				{
					p5.clear();
					p5.background(0);
					p5.printer(data);
				});

				this.socket.on('slaveToMasterKeyPressed', data =>
				{
					if (data == 26 && game.playerTwo.y >= 0 && this.started == 1)
					{
						if (game.playerTwo.y != 0)
							game.playerTwo.y -= 5;
					}
					else if (game.playerTwo.y < height - 100 && this.started == 1)		//add player height change ?
						game.playerTwo.y += 5;
				});

				this.socket.on('masterToMasterKeyPressed', data =>
				{
					if (data == 26 && game.playerOne.y >= 0 && this.started == 1)
					{
						if (game.playerOne.y != 0)
							game.playerOne.y -= 5;
					}
					else if (game.playerOne.y < height - 100 && this.started == 1)		//add player height change ?
						game.playerOne.y += 5;
				});

				this.socket.on('launchMatch', () =>
				{
					var counter = 0;
					this.socket.emit('sendUpdateMatch', game);
					this.socket.on('serverTick', () =>
					{
						if (counter <= this.fq * this.countdown)
							counter++;
						if (counter % this.fq == 0 && counter > 0)
						{
							game.countdown--;
							this.socket.emit('sendUpdateMatch', game);
						}
						if (counter > this.fq * this.countdown)
						{
							this.started = 1;
							gameEngine(game);
							this.socket.emit('sendUpdateMatch', game);
						}
					});
				});

				this.socket.on('playerDisconnect', () =>
				{
					window.location.reload(); //change this
				});

			}
			else if (data == "2")	//Slave
			{
				this.type = "slave";

				this.socket.emit('readyToStart');
				this.started = 1;

				this.socket.on('updateMatch', (data) =>
				{
					p5.clear();
					p5.background(0);
					p5.printer(data);
				});

				this.socket.on('playerDisconnect', () =>
				{
					window.location.reload(); //change this
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

		});
	}

	draw = (p5) => {
		this.movePlayer(p5);
	}

	render() {
		return <Sketch setup={this.setup} draw={this.draw} />
	}
}

export default Match;