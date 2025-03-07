import { ApiProperty } from '@nestjs/swagger';

export enum ResponseApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export class ResponseDto<T> {
  @ApiProperty({
    description: 'The status of the response',
  })
  status: ResponseApiStatus;

  @ApiProperty({
    description: 'The message of the response',
  })
  message: string;

  @ApiProperty({
    description: 'The data of the response',
  })
  data: T;

  constructor(status: ResponseApiStatus, message: string, data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
