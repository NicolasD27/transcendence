import React, { Fragment, Dispatch, SetStateAction } from "react";
import Sketch from "react-p5";
import { Socket } from "socket.io-client"
import './Match.css'

let playerWidth = 15;
let finalScore = 3;
let buttonAdder = 5;
let ballSpeed = 10;
let magicBallSpeed = ballSpeed;
let accelerator = 0.5;
let basicW = 1000;
let basicH = 590;
let scored = false;
let fq = 60;

function PlayerInput(this: any) {
	this.masterA = false;
	this.masterZ = false;
	this.slaveA = false;
	this.slaveZ = false;
	this.masterAcc = 0;
	this.slaveAcc = 0;
}

function Player(this: any, x: number, y: number, w: number, h: number, score: number) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.score = score;
}

function Ball(this: any, x: number, y: number, xv: number, yv: number, xr: number, yr: number) {
	this.x = x;
	this.y = y;
	this.xv = xv;
	this.yv = yv;
	this.xr = xr;
	this.yr = yr;
}

function Game(this: any, playerOne: any, playerTwo: any, ball: any, cd: number, mode: string) {
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
	this.ball = ball;
	this.countdown = cd;
	this.mode = mode;
	this.scoredCt = 0;
}

function negRand() {
	if (Math.random() > 0.5)
		return (-1);
	else
		return (1);
}

function gameEngine(game: any, socket: Socket, match_id: number, width: number, height: number) {
	const ballElasticity = 4
	if (game.ball.x + game.ball.xv > width - game.ball.xr / 2 - playerWidth + ballElasticity || game.ball.x + game.ball.xv < game.ball.xr / 2 + playerWidth - ballElasticity) {
		if (game.ball.x + game.ball.xv > width - game.ball.xr / 2 - playerWidth + ballElasticity) {
			if (game.ball.y >= game.playerTwo.y && game.ball.y <= game.playerTwo.y + game.playerTwo.h) {
				if (game.mode === "HARDCORE")
					magicBallSpeed += 2;	//for special mode

				var relativeIntersectY = (game.playerTwo.y + 50) - game.ball.y;
				var normalizedRelativeIntersectionY = (relativeIntersectY / (100 / 2));
				var bounceAngle = normalizedRelativeIntersectionY * (5 * Math.PI / 12);
				game.ball.xv = -(magicBallSpeed * Math.cos(bounceAngle));
				game.ball.yv = magicBallSpeed * -Math.sin(bounceAngle);
			}
			else if (game.ball.x >= width) {
				scored = true;
				game.playerOne.score++;
				magicBallSpeed = ballSpeed;
				socket.emit('masterScored', { match_id: match_id });
				delete game.ball;


				game.ball = new Ball(width / 2, height / 2, (magicBallSpeed * Math.cos((Math.random() - 0.5))) * negRand(),
					(magicBallSpeed * - Math.sin((Math.random() - 0.5))) * negRand(), 20, 20)
			}
		}
		else if (game.ball.x + game.ball.xv < game.ball.xr / 2 + playerWidth - ballElasticity) {
			if (game.ball.y >= game.playerOne.y && game.ball.y <= game.playerOne.y + game.playerOne.h) {
				if (game.mode === "HARDCORE")
					magicBallSpeed += 2;	//for special mode

				relativeIntersectY = (game.playerOne.y + 50) - game.ball.y;
				normalizedRelativeIntersectionY = (relativeIntersectY / (100 / 2));
				bounceAngle = normalizedRelativeIntersectionY * (5 * Math.PI / 12);
				game.ball.xv = magicBallSpeed * Math.cos(bounceAngle);
				game.ball.yv = magicBallSpeed * -Math.sin(bounceAngle);
			}
			else if (game.ball.x <= 0) {
				scored = true;
				game.playerTwo.score++;
				magicBallSpeed = ballSpeed;
				socket.emit('slaveScored', { match_id: match_id });
				delete game.ball;

				game.ball = new Ball(width / 2, height / 2, (magicBallSpeed * Math.cos((Math.random() - 0.5))) * negRand(),
					(magicBallSpeed * - Math.sin((Math.random() - 0.5))) * negRand(), 20, 20)
			}
		}
	}
	if (game.ball.y + game.ball.yv + ballElasticity > height - game.ball.yr / 2 || game.ball.y + game.ball.yv < game.ball.yr / 2 - ballElasticity)
		game.ball.yv = - game.ball.yv;

	game.ball.x += game.ball.xv;
	game.ball.y += game.ball.yv;
}

function playerMove(started: number, game: any, playerInput: any, width: number, height: number) {
	if (playerInput.masterA === true && game.playerOne.y >= accelerator && started === 1 && playerInput.masterZ === false) {
		if (game.playerOne.y !== 0)
			game.playerOne.y -= (buttonAdder + (playerInput.masterAcc += accelerator));
	}
	if (playerInput.masterZ === true && game.playerOne.y < height - 100 - accelerator && started === 1 && playerInput.masterA === false)
		game.playerOne.y += (buttonAdder + (playerInput.masterAcc += accelerator));

	if (playerInput.slaveA === true && game.playerTwo.y >= accelerator && started === 1 && playerInput.slaveZ === false) {
		if (game.playerTwo.y !== 0)
			game.playerTwo.y -= (buttonAdder + (playerInput.slaveAcc += accelerator));
	}
	else if (playerInput.slaveZ === true && game.playerTwo.y < height - 100 - accelerator && started === 1 && playerInput.slaveA === false)
		game.playerTwo.y += (buttonAdder + (playerInput.slaveAcc += accelerator));

}

function printer(p5: any, data: any, width: number, height: number, type: string) {
	p5.fill(p5.color("#3772FF"));
	if (type === "master")
		p5.fill(p5.color("#E11515"));
	p5.rect(data.playerOne.x, data.playerOne.y, data.playerOne.w, data.playerOne.h);
	p5.fill(p5.color("#3772FF"));
	if (type === "slave")
		p5.fill(p5.color("#E11515"));
	p5.rect(data.playerTwo.x, data.playerTwo.y, data.playerTwo.w, data.playerTwo.h);

	if (data.countdown !== 0) {
		p5.textSize(200);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.text(data.countdown, width / 2, height / 2);
		p5.textSize(50);
		p5.text("Use 'a' and 'z' to move the paddle", width / 2, height * 0.80);
	}
	else {
		p5.fill(p5.color(255, 255, 255));
		p5.rect((width / 2) - 1, 0, 2, height);
		p5.ellipse(data.ball.x, data.ball.y, data.ball.xr, data.ball.yr);
		p5.textAlign(p5.CENTER, p5.TOP);
		p5.text(`${data.playerOne.score}      ${data.playerTwo.score}`, width / 2, 10);
		if (data.scoredCt !== 0) {
			p5.ellipse(width * 0.4, height * 0.2, 50, 50);
			if (data.scoredCt >= 1 * fq)
				p5.ellipse(width * 0.5, height * 0.2, 50, 50);
			if (data.scoredCt >= 2 * fq)
				p5.ellipse(width * 0.6, height * 0.2, 50, 50);
		}
	}

}

interface Props {
	socket: any,
	idMatch: any
	setInPlay: Dispatch<SetStateAction<boolean>>;
}

export class Match extends React.Component<Props>
{

	width = basicW;
	height = basicH;
	winner = "";
	type = "";
	started = 0;
	countdown = 3;
	match_id: number;
	slaveId: string;
	masterId: string;
	myId: string;
	leftClick = false;
	modeSelected = false;
	mode = "";
	tooSmall = false;
	launched = false;

	windowResized = (p5: any) => {
		this.width = document.getElementById("gameArea")!.offsetWidth - 8;
		this.height = document.getElementById("gameArea")!.offsetHeight - 8;
		p5.resizeCanvas(this.width, this.height);
	}

	setup = (p5: any) => {
		this.launched = false
		if (this.props.idMatch)
			this.props.socket.emit('connect_to_match', { match_id: this.props.idMatch })
		this.width = document.getElementById("gameArea")!.offsetWidth - 8;
		this.height = document.getElementById("gameArea")!.offsetHeight - 8;
		let cvn = p5.createCanvas(this.width, this.height);
		cvn.parent("gameArea");

		p5.frameRate(60);

		p5.textFont('Tourney');
		p5.clear()
		p5.fill(p5.color(141, 141, 141));
		p5.rect(basicW / 2, 0, basicW / 2, basicH);
		p5.textSize(50);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.text(`Normal mode`, basicW * 0.25, basicH / 2);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.text(`Hardcore mode`, basicW * 0.75, basicH / 2);

		this.props.socket.on('updateMatch', (data) => {
			if (this.type === "") {
				console.log("I'm Spect")
				this.type = "spect";
			}
			p5.clear();
			p5.background(0);
			if (data && this.tooSmall !== true)
				printer(p5, data, basicW, basicH, this.type);
		});

		this.props.socket.on('serverGameFinished', (data) => {
			this.launched = false
			if (this.type !== "master" && this.type !== "slave")
				this.winner = data;
		});

		if (!this.launched) {
			this.launched = true
			this.props.socket.on('launch_match', (data) => {
				console.log("launching match...")
				this.match_id = data.id;
				this.slaveId = data.user2.username;
				this.masterId = data.user1.username;

				this.props.socket.emit("askForMyID");
			})
		}
		this.props.socket.on("receiveMyID", (data) => {
			this.myId = data

			if (this.myId === this.masterId && this.masterId)		//Master
			{
				console.log("IM A MASTER")
				this.modeSelected = true;
				this.type = "master";

				var game = new Game(
					new Player(0, basicH / 2 - 50, playerWidth, 100, 0),
					new Player(basicW - playerWidth, basicH / 2 - 50, playerWidth, 100, 0),
					new Ball(basicW / 2, basicH / 2, (magicBallSpeed * Math.cos((Math.random() - 0.5))) * negRand(),
						(magicBallSpeed * - Math.sin((Math.random() - 0.5))) * negRand(), 20, 20), this.countdown, this.mode);

				var playerInput = new PlayerInput();

				p5.background(0);
				p5.fill(p5.color(255, 255, 255));
				p5.textAlign(p5.CENTER, p5.CENTER);
				p5.text('Waiting for other player...', basicW / 2, basicH / 2);

				this.props.socket.on('masterToMasterKeyPressed', data => {
					if (data === 'a')
						playerInput.masterA = true;
					else if (data === 'z')
						playerInput.masterZ = true;
				});

				this.props.socket.on('slaveToMasterKeyPressed', data => {
					if (data === 'a')
						playerInput.slaveA = true;
					else if (data === 'z')
						playerInput.slaveZ = true;
				});

				this.props.socket.on('masterToMasterKeyReleased', data => {
					if (data === 'a')
						playerInput.masterA = false;
					else if (data === 'z')
						playerInput.masterZ = false;
					playerInput.masterAcc = 0;
				});

				this.props.socket.on('slaveToMasterKeyReleased', data => {
					if (data === 'a')
						playerInput.slaveA = false;
					else if (data === 'z')
						playerInput.slaveZ = false;
					playerInput.slaveAcc = 0;
				});

				var counter = 0;
				this.props.socket.emit('sendUpdateMatch', { match_id: this.match_id, game: game });
				this.props.socket.on('serverTick', () => {
					if (counter <= fq * this.countdown)
						counter++;
					if (counter % fq === 0 && counter > 0) {
						game.countdown--;
						this.props.socket.emit('sendUpdateMatch', { match_id: this.match_id, game: game });
					}
					if (counter > fq * this.countdown) {
						this.started = 1;
						playerMove(this.started, game, playerInput, basicW, basicH);
						if (scored === false)
							gameEngine(game, this.props.socket, this.match_id, basicW, basicH);
						else {
							game.scoredCt++;
							if (game.scoredCt >= 3 * fq) {
								game.scoredCt = 0;
								scored = false;
							}
						}
						this.props.socket.emit('sendUpdateMatch', { match_id: this.match_id, game: game });
					}
					if (game.playerOne.score >= finalScore) {
						this.props.socket.off('serverTick');
						this.props.socket.emit('gameFinished', { match_id: this.match_id, winner: this.masterId, score1: game.playerOne.score, score2: game.playerTwo.score });
					}
					else if (game.playerTwo.score >= finalScore) {
						this.props.socket.off('serverTick');
						this.props.socket.emit('gameFinished', { match_id: this.match_id, winner: this.slaveId, score1: game.playerOne.score, score2: game.playerTwo.score });
					}
				});

				this.props.socket.on('serverGameFinished', (data) => {
					this.started = -1;
					this.props.socket.off('serverTick');
					this.winner = data;
				});

				this.props.socket.on('clientDisconnect', (data) => {
					if (data === this.slaveId && this.started !== -1) {
						this.props.socket.off('serverTick');
						this.props.socket.emit('gameFinished', { match_id: this.match_id, winner: this.masterId, score1: 0, score2: 0 });
					}
				});

			}
			else if (this.myId === this.slaveId && this.slaveId)	//Slave
			{
				console.log("IM A SLAVE")
				this.modeSelected = true;
				this.type = "slave";

				this.started = 1;

				this.props.socket.on('serverGameFinished', (data) => {
					this.launched = false
					this.started = -1;
					this.winner = data;
				});

				this.props.socket.on('clientDisconnect', (data) => {
					if (data === this.masterId && this.started !== -1)
						this.props.socket.emit('gameFinished', { match_id: this.match_id, winner: this.slaveId, score1: 0, score2: 0 });
				});

			}
		});


	}

	draw = (p5: any) => {
		if (this.started === 1)
			this.props.setInPlay(true)
		else
			this.props.setInPlay(false)
		p5.scale(this.width / basicW)
		if (this.type !== "spect") {
			if (this.winner !== "") {
				p5.background(0);
				p5.fill(p5.color(255, 255, 255));
				p5.textAlign(p5.CENTER, p5.CENTER);
				p5.text(`The winner is : ${this.winner}`, basicW / 2, basicH / 2);
				p5.text('Left click to play another match', basicW / 2, basicH * 0.75)
				this.launched = false;
				if (this.leftClick === true && p5.mouseX > 0 && p5.mouseX < this.width && p5.mouseY > 0 && p5.mouseY < this.height)
					window.location.reload();
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			}
			if (this.width < 400)	//change values here
			{
				this.tooSmall = true;
				p5.clear()
				p5.fill(p5.color(255, 0, 0));
				p5.textAlign(p5.CENTER, p5.CENTER);
				p5.textSize(100)
				p5.text(`TOO SMALL`, basicW / 2, basicH / 2);
				p5.textSize(50)
			}
			else {

				this.tooSmall = false;
				if (p5.mouseX < this.width / 2 && p5.mouseX > 0 && this.modeSelected === false &&
					p5.mouseY > 0 && p5.mouseY < this.height) {
					p5.clear()
					p5.fill(p5.color("#3772FF"));
					p5.rect(0, 0, basicW / 2, basicH);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Normal mode`, basicW * 0.25, basicH / 2);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Hardcore mode`, basicW * 0.75, basicH / 2);
					if (this.leftClick === true) {
						this.mode = "NORMAL";
						this.props.socket.emit('find_match', { mode: 0 });
						this.modeSelected = true;
						p5.background(0);
						p5.fill(p5.color(255, 255, 255));
						p5.textAlign(p5.CENTER, p5.CENTER);
						p5.text(`Creating / Finding match...`, basicW / 2, basicH / 2);
					}
				}
				else if (p5.mouseX >= this.width / 2 && p5.mouseX < this.width && this.modeSelected === false &&
					p5.mouseY > 0 && p5.mouseY < this.height) {
					p5.clear()
					p5.fill(p5.color("#E11515"));
					p5.rect(basicW / 2, 0, basicW / 2, basicH);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Normal mode`, basicW * 0.25, basicH / 2);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Hardcore mode`, basicW * 0.75, basicH / 2);
					if (this.leftClick === true) {
						this.mode = "HARDCORE";
						this.props.socket.emit('find_match', { mode: 1 });
						this.modeSelected = true;
						p5.background(0);
						p5.fill(p5.color(255, 255, 255));
						p5.textAlign(p5.CENTER, p5.CENTER);
						p5.text(`Creating / Finding match...`, basicW / 2, basicH / 2);
					}
				}
				else if (this.modeSelected === false) {
					p5.clear()
					p5.fill(p5.color(255, 255, 255));
					p5.rect(basicW / 2, 0, 2, basicH);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Normal mode`, basicW * 0.25, basicH / 2);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text(`Hardcore mode`, basicW * 0.75, basicH / 2);
				}
			}
			if (this.leftClick === true)
				this.leftClick = false;
		}
		else {
			if (this.winner !== "") {
				p5.background(0);
				p5.fill(p5.color(255, 255, 255));
				p5.textAlign(p5.CENTER, p5.CENTER);
				p5.text(`The winner is : ${this.winner}`, basicW / 2, basicH / 2);
				p5.text('Left click to play a match', basicW / 2, basicH * 0.75)
				this.launched = false;
				if (this.leftClick === true && p5.mouseX > 0 && p5.mouseX < this.width && p5.mouseY > 0 && p5.mouseY < this.height)
					window.location.reload();
				setTimeout(() => {
					window.location.reload();
				}, 2000);
			}
		}
	}

	keyTyped = (p5: any) => {
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.props.socket.emit('masterKeyPressed', { match_id: this.match_id, command: p5.key });

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.props.socket.emit('slaveKeyPressed', { match_id: this.match_id, command: p5.key });
	}

	keyReleased = (p5: any) => {
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.props.socket.emit('masterKeyReleased', { match_id: this.match_id, command: p5.key });

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.props.socket.emit('slaveKeyReleased', { match_id: this.match_id, command: p5.key });
	}

	mouseClicked = (p5: any) => {
		if (p5.mouseButton === p5.LEFT)
			this.leftClick = true;
	}

	render() {
		return (
			<Fragment>
				{this.winner && <div className="pyro">
					<div className="before"></div>
					<div className="after"></div>
				</div>}
				{this.props.socket && <Sketch setup={this.setup} draw={this.draw} keyTyped={this.keyTyped} keyReleased={this.keyReleased}
					mouseClicked={this.mouseClicked} windowResized={this.windowResized} />}
			</Fragment>
		)
	}
}

export default Match;