import { PartialType } from "@nestjs/mapped-types";
import { CreateMsgDto } from "src/Back-end/chat/dto/create-msg.dto";

export class UpdateMsgDto extends PartialType(CreateMsgDto) { }