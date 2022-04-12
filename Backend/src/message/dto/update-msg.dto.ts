import { PartialType } from "@nestjs/mapped-types";
import { CreateMsgDto } from "./create-msg.dto"

export class UpdateMsgDto extends PartialType(CreateMsgDto) {}
