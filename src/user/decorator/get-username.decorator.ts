import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../entity/user.entity";

export const GetUsername = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user.username;
})
