import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Profile } from "passport";

export const GetProfile42 = createParamDecorator((data, ctx: ExecutionContext): Profile => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
})
