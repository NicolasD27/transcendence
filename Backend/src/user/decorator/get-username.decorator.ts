import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../entity/user.entity";

<<<<<<< HEAD
export const GetUsername = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user.username;
=======
export const GetUsername = createParamDecorator((data, ctx: ExecutionContext): string => {
    const cookie_string = ctx.switchToHttp().getRequest().headers.cookie
    if (!cookie_string)
        throw new UnauthorizedException("No cookie");
    const cookies = cookie_string.split('; ');
    let username = "";
    if (cookies.find((cookie: string) => cookie.startsWith('username')))
        username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
    else
        throw new UnauthorizedException("No username");
    return username;
>>>>>>> master
})
