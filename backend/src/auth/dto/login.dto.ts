import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'student@example.com',
    description: 'Email address or username to log in with',
  })
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @ApiProperty({ example: 'P@ssword123', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
