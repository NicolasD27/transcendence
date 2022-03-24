import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// import { User } from "../entity/user.entity";

export const GetAuthor = createParamDecorator((data, ctx: ExecutionContext): any => {
    const author = ctx.switchToWs().getData().author;
    return author;
})