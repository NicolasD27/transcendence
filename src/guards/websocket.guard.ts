// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';

// @Injectable()
// export class WebsocketGuard extends AuthGuard('42') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const activate: boolean = (await super.canActivate(context)) as boolean;
//     const request: Request = context.switchToWs().
//     await super.logIn(request);
//     return activate;
//   }
// }
