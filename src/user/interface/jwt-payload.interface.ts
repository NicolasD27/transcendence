import { User } from "../entity/user.entity";

export interface JwtPayload {
    isTwoFactorEnable?: boolean
    username: string
    isTwoFaAuthenticated?: boolean
}