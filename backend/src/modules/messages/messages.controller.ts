import { Controller, Post, Body, Get, Param, Query } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  async findAll() {
    return this.messagesService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.messagesService.findById(id);
  }

  @Get("/recipient/:recipientId")
  async findByRecipient(@Param("recipientId") recipientId: string) {
    return this.messagesService.findByRecipient(recipientId);
  }
}
