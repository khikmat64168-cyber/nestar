import { Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from "url"

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberdata: Member | null;
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger('SocketsExentsGateway');
	private summaryClient: number = 0;
	private clientsAuthMap = new Map<WebSocket, Member | null>()
	private	messagesList : MessagePayload[]=[]

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server!: WebSocket.Server;

	public afterInit(server: WebSocket.Server) {
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`);
	}

	private async retriveAuth(req: any): Promise<Member | null> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req : any) {
		const authMember = await  this.retriveAuth(req)

		console.log("authMember", authMember)
		this.summaryClient++;
		this.clientsAuthMap.set(client, authMember)

		const clientNick: string = authMember?.memberNick ?? "Guest"
		this.logger.verbose(`Connection & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberdata: authMember, 
			action: "joined"
		};
		this.emitMessage(infoMsg);
		// CLIENT MESSAGES
		client.send(JSON.stringify({event: "getMessages", list: this.messagesList}))

	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client) ?? null;
		this.summaryClient--;
		this.clientsAuthMap.delete(client)

		const clientNick: string = authMember?.memberNick ?? "Guest"
		this.logger.verbose(`Disconnection [${clientNick}] $ total [${this.summaryClient}]`);



		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberdata: authMember,
			action: "left"
		};
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authMember = this.clientsAuthMap.get(client) ?? null;
		const newMessage: MessagePayload = { event: 'message', text: payload , memberData: authMember};


		const clientNick: string = authMember?.memberNick ?? "Guest"
		this.logger.verbose(`NEW MESSAGE: ${payload}`);

		this.messagesList.push(newMessage)
		if (this.messagesList.length > 5) this.messagesList.splice(0, this.messagesList.length -5);
		this.emitMessage(newMessage);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
