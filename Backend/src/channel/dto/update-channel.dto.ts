import { PartialType } from "@nestjs/mapped-types";
import { CreateMsgDto } from "../../message/dto/create-msg.dto";

export class UpdateMsgDto extends PartialType(CreateMsgDto) {}