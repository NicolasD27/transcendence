import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { User } from "../entity/user.entity";

export const GetUsername = createParamDecorator((data, ctx: ExecutionContext): string => {
    const cookies = ctx.switchToHttp().getRequest().headers.cookie.split('; ')
    if (cookies.find((cookie: string) => cookie.startsWith('username')))
        return cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
    else
        throw new UnauthorizedException("No username");
    
})
