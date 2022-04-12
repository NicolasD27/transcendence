import { PartialType } from "@nestjs/mapped-types";
import { CreateMsgDto } from "../../chat/dto/create-msg.dto";

export class UpdateMsgDto extends PartialType(CreateMsgDto) {}