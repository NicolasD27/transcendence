import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// import { User } from "../entity/user.entity";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): any => {
    const user = ctx.switchToWs().getData().author;
    return user;
})