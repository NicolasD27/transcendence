import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';

export  const getUsernameFromSocket = (socket: Socket): string => {
    const cookie_string = socket.handshake.headers.cookie
    if (!cookie_string)
        throw new UnauthorizedException("No cookie");
    const cookies = cookie_string.split('; ');
    let username = "";
    if (cookies.find((cookie: string) => cookie.startsWith('username')))
        username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
    else
        throw new UnauthorizedException("No username");
    return username;
}