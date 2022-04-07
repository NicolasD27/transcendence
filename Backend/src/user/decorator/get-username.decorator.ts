import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { User } from "../entity/user.entity";

export const GetUsername = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    try {
        return req.user.username;
    }
    catch {
        throw new UnauthorizedException()
    }
})
