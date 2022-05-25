import React, { Fragment } from "react";
import Sketch from "react-p5";
import { Socket } from "socket.io-client"


let playerWidth = 15;
let finalScore = 10;
let buttonAdder = 15;
let ballSpeed = 20;
let magicBallSpeed = ballSpeed;

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

function negRand()
{
	if (Math.random() > 0.5)
		return (-1);
	else
		return (1);
}

function gameEngine(game: any, socket: Socket, match_id: number, width: number, height: number)
{
	if(game.ball.x + game.ball.xv > width - game.ball.xr || game.ball.x + game.ball.xv < game.ball.xr )
	{
		if (game.ball.x + game.ball.xv > width - game.ball.xr)
		{
			if (game.ball.y >= game.playerTwo.y && game.ball.y <= game.playerTwo.y + game.playerTwo.h)
			{
				//magicBallSpeed += 5;	//for special mode

				var relativeIntersectY = (game.playerTwo.y + 50) - game.ball.y;
				var normalizedRelativeIntersectionY = (relativeIntersectY/(100 / 2));
				var bounceAngle = normalizedRelativeIntersectionY * (5 * Math.PI / 12);
				game.ball.xv = -(magicBallSpeed * Math.cos(bounceAngle));
				game.ball.yv = magicBallSpeed * -Math.sin(bounceAngle);
			}
			else
			{
				game.playerOne.score++;
				magicBallSpeed = ballSpeed;
				socket.emit('masterScored', {match_id: match_id});
				delete game.ball;

				let bounceAngle = Math.random() - 0.5;
				game.ball = new Ball(width / 2, height / 2, (magicBallSpeed * Math.cos(bounceAngle)) * negRand(), (magicBallSpeed * - Math.sin(bounceAngle)) * negRand(), 20, 20)
			}
		}
		else if (game.ball.x + game.ball.xv < game.ball.xr)
		{
			if (game.ball.y >= game.playerOne.y && game.ball.y <= game.playerOne.y + game.playerOne.h)
			{
				//magicBallSpeed += 5;	//for special mode

				var relativeIntersectY = (game.playerOne.y + 50) - game.ball.y;
				var normalizedRelativeIntersectionY = (relativeIntersectY/(100 / 2));
				var bounceAngle = normalizedRelativeIntersectionY * (5 * Math.PI / 12);
				game.ball.xv = magicBallSpeed * Math.cos(bounceAngle);
				game.ball.yv = magicBallSpeed * -Math.sin(bounceAngle);
			}
			else
			{
				game.playerTwo.score++;
				magicBallSpeed = ballSpeed;
				socket.emit('slaveScored', {match_id: match_id});
				delete game.ball;

				let bounceAngle = Math.random() - 0.5;
				game.ball = new Ball(width / 2, height / 2, (magicBallSpeed * Math.cos(bounceAngle)) * negRand(), (magicBallSpeed * - Math.sin(bounceAngle)) * negRand(), 20, 20)
			}
		}
	}
	if (game.ball.y + game.ball.yv > height - game.ball.yr || game.ball.y + game.ball.yv < game.ball.yr)
		game.ball.yv = - game.ball.yv;

	game.ball.x += game.ball.xv;
	game.ball.y += game.ball.yv;
}

function playerMove(started: number, game: any, playerInput: any, width: number, height: number)
{
	if (playerInput.masterA === true && game.playerOne.y >= 0 && started === 1)
	{
		if (game.playerOne.y !== 0)
			game.playerOne.y -= buttonAdder;
	}
	if (playerInput.masterZ === true && game.playerOne.y < height - 100 && started === 1)
		game.playerOne.y += buttonAdder;

	if (playerInput.slaveA === true && game.playerTwo.y >= 0 && started === 1)
	{
		if (game.playerTwo.y !== 0)
			game.playerTwo.y -= buttonAdder;
	}
	else if (playerInput.slaveZ === true && game.playerTwo.y < height - 100 && started === 1)
		game.playerTwo.y += buttonAdder;
}

function printer(p5: any, data: any, width: number, height: number)
{
	p5.rect(data.playerOne.x, data.playerOne.y, data.playerOne.w, data.playerOne.h);
	p5.rect(data.playerTwo.x, data.playerTwo.y, data.playerTwo.w, data.playerTwo.h);

	if (data.countdown != 0)
	{
		p5.textSize(200);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.text(data.countdown, width / 2, height / 2);
	}
	else
	{
		p5.rect(width / 2, 0, 2, height);
		p5.ellipse(data.ball.x, data.ball.y, data.ball.xr, data.ball.yr);
		p5.textSize(50);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.TOP);
		p5.text(`${data.playerOne.score}      ${data.playerTwo.score}`, width / 2, 10);
	}

}

interface Props {
	socket: any
}

export class Match extends React.Component<Props>
{
	state = {
		width: 954,
		height: 532
	}
	type = "";
	started = 0;
	countdown = 3;
	fq = 30;
	match_id: number;
	match_size: number;
	slaveId: string;
	masterId: string;
	myId: string;
	spacePressed = false;

	componentDidMount() {

		const gameArea = document.getElementById("gameArea")
		this.setState({
			width: gameArea ? gameArea.offsetWidth - 8 : 954,
			height: gameArea ? gameArea.offsetHeight - 8 : 532
		})
		window.addEventListener('resize', () => {
			console.log("resized")
			const gameArea = document.getElementById("gameArea")
			const width = gameArea ? gameArea.offsetWidth : 954
			const height = gameArea ? gameArea.offsetHeight : 532
			this.setState({
				width: width - 8,
				height: height - 8
			})
		})
	}

	windowResized = (p5: any) => {
		const gameArea = document.getElementById("gameArea")
		const width = gameArea ? gameArea.offsetWidth : 954
		const height = gameArea ? gameArea.offsetHeight : 532
		p5.resizeCanvas(width - 8, height - 8, true)
	}

	setup = (p5: any) =>
	{

		let cvn = p5.createCanvas(this.state.width, this.state.height);
		cvn.parent("gameArea");

		p5.background(0);
		p5.textSize(50);
		p5.fill(p5.color(255, 255, 255));
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.text('Press SPACE to find a match', this.state.width / 2, this.state.height / 2);

		this.props.socket.on('launch_match', (data) =>
		{
			console.log("launching match...")
			this.match_id = data.id;
			this.match_size = data.room_size;
			this.slaveId = data.user2.username;
			this.masterId = data.user1.username;
			//this.mode = data.mode (savoir si c'est un mod special)

			this.props.socket.emit("askForMyID");
			this.props.socket.on("receiveMyID", (data) =>
			{
				this.myId = data

				if (this.myId === this.masterId && this.masterId)		//Master
				{
					console.log("IM A MASTER")
					this.type = "master";

					let bounceAngle = Math.random() - 0.5;

					var game = new Game(
						new Player(0, this.state.height / 2 - 50, playerWidth, 100, 0),
						new Player(this.state.width - playerWidth, this.state.height / 2 - 50, playerWidth, 100, 0),
						new Ball(this.state.width / 2, this.state.height / 2, (magicBallSpeed * Math.cos(bounceAngle)) * negRand(), (magicBallSpeed * - Math.sin(bounceAngle)) * negRand(), 20, 20),
						this.countdown);

					var playerInput = new PlayerInput();

					p5.background(0);
					p5.textSize(50);
					p5.fill(p5.color(255, 255, 255));
					p5.textAlign(p5.CENTER, p5.CENTER);
					p5.text('Waiting for other player...', this.state.width / 2, this.state.height / 2);

					this.props.socket.on('updateMatch', (data) =>
					{
						p5.clear();
						p5.background(0);
						printer(p5, data, this.state.width, this.state.height);
					});

					this.props.socket.on('masterToMasterKeyPressed', data =>
					{
						if (data === 'a')
							playerInput.masterA = true;
						else if (data === 'z')
							playerInput.masterZ = true;
					});

					this.props.socket.on('slaveToMasterKeyPressed', data =>
					{
						if (data === 'a')
							playerInput.slaveA = true;
						else if (data === 'z')
							playerInput.slaveZ = true;
					});

					this.props.socket.on('masterToMasterKeyReleased', data =>
					{
						if (data === 'a')
							playerInput.masterA = false;
						else if (data === 'z')
							playerInput.masterZ = false;
					});

					this.props.socket.on('slaveToMasterKeyReleased', data =>
					{
						if (data === 'a')
							playerInput.slaveA = false;
						else if (data === 'z')
							playerInput.slaveZ = false;
					});

					var counter = 0;
					this.props.socket.emit('sendUpdateMatch', {match_id: this.match_id, game: game});
					this.props.socket.on('serverTick', () =>
					{
						if (counter <= this.fq * this.countdown)
							counter++;
						if (counter % this.fq === 0 && counter > 0)
						{
							game.countdown--;
							this.props.socket.emit('sendUpdateMatch', {match_id: this.match_id, game: game});
						}
						if (counter > this.fq * this.countdown)
						{
							this.started = 1;
							playerMove(this.started, game, playerInput, this.state.width, this.state.height);
							gameEngine(game, this.props.socket, this.match_id, this.state.width, this.state.height);
							this.props.socket.emit('sendUpdateMatch', {match_id: this.match_id, game: game});
						}
						if (game.playerOne.score >= finalScore)
						{
							this.props.socket.off('serverTick');
							this.props.socket.emit('gameFinished', {match_id: this.match_id, winner: this.masterId, score1: game.playerOne.score, score2: game.playerTwo.score});
						}
						else if (game.playerTwo.score >= finalScore)
						{
							this.props.socket.off('serverTick');
							this.props.socket.emit('gameFinished', {match_id: this.match_id, winner: this.slaveId, score1: game.playerOne.score, score2: game.playerTwo.score});
						}
					});

					this.props.socket.on('serverGameFinished', (data) =>
					{
						let winner: string;
						if (data === 1)
							winner = this.masterId;
						else
							winner = this.slaveId;
						p5.background(0);
						p5.textSize(50);
						p5.fill(p5.color(255, 255, 255));
						p5.textAlign(p5.CENTER, p5.CENTER);
						p5.text(`The winner is : ${winner}`, this.state.width / 2, this.state.height / 2);
					});

					this.props.socket.on('clientDisconnect', (data) =>
					{
						if (data === this.slaveId)
						{
							this.props.socket.off('serverTick');
							this.props.socket.emit('gameFinished', {match_id: this.match_id, winner: this.masterId, score1: game.playerOne.score, score2: game.playerTwo.score});
						}
					});

			}
				else if (this.myId === this.slaveId && this.slaveId)	//Slave
				{
					console.log("IM A SLAVE")
					this.type = "slave";

					this.started = 1;

					this.props.socket.on('updateMatch', (data) =>
					{
						p5.clear();
						p5.background(0);
						printer(p5, data, this.state.width, this.state.height);
					});

					this.props.socket.on('serverGameFinished', (data) =>
					{
						let winner: string;
						if (data === 1)
							winner = this.masterId;
						else
							winner = this.slaveId;
						p5.background(0);
						p5.textSize(50);
						p5.fill(p5.color(255, 255, 255));
						p5.textAlign(p5.CENTER, p5.CENTER);
						p5.text(`The winner is : ${winner}`, this.state.width / 2, this.state.height / 2);
					});

					this.props.socket.on('clientDisconnect', (data) =>
					{
						if (data === this.masterId)
							this.props.socket.emit('gameFinished', {match_id: this.match_id, winner: this.slaveId, score1: game.playerOne.score, score2: game.playerTwo.score});
					});

				}
				else					//Spect
				{
					this.type = "spect";

					this.props.socket.on('serverGameFinished', (data) =>
					{
						let winner: string;
						if (data === 1)
							winner = this.masterId;
						else
							winner = this.slaveId;
						p5.background(0);
						p5.textSize(50);
						p5.fill(p5.color(255, 255, 255));
						p5.textAlign(p5.CENTER, p5.CENTER);
						p5.text(`The winner is : ${winner}`, this.state.width / 2, this.state.height / 2);
					});

					this.props.socket.on('updateMatch', (data) =>
					{
						p5.clear();
						p5.background(0);
						printer(p5, data, this.state.width, this.state.height);
					});
				}
			});
		});
	}

	draw = (p5: any) =>
	{}

	keyTyped = (p5: any) =>
	{
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.props.socket.emit('masterKeyPressed', {match_id: this.match_id, command: p5.key});

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.props.socket.emit('slaveKeyPressed', {match_id: this.match_id, command: p5.key});

		if ((p5.key === " ") && this.spacePressed === false)
		{
			this.spacePressed = true;
			this.props.socket.emit('find_match');
			p5.background(0);
			p5.textSize(50);
			p5.fill(p5.color(255, 255, 255));
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.text(`Creating / Finding match...`, this.state.width / 2, this.state.height / 2);
		}
	}

	keyReleased = (p5: any) =>
	{
		if ((p5.key === 'a' || p5.key === 'z') && this.type === "master" && this.started === 1)
			this.props.socket.emit('masterKeyReleased', {match_id: this.match_id, command: p5.key});

		if ((p5.key === 'a' || p5.key === 'z') && this.type === "slave" && this.started === 1)
			this.props.socket.emit('slaveKeyReleased', {match_id: this.match_id, command: p5.key});
	}

	render()
	{
		return (
			<Fragment>
				{this.props.socket && <Sketch setup={this.setup} draw={this.draw} keyTyped={this.keyTyped} keyReleased={this.keyReleased} windowResized={this.windowResized}/>}
			</Fragment>
		)
	}
}

export default Match;