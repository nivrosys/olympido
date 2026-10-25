import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterStudentDto {
  @ApiProperty({ example: 'student@example.com', description: 'Student email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssword123',
    minLength: 8,
    description: 'Password with min 8 characters, at least 1 letter and 1 number',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full legal or display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'johndoe', description: 'Unique username alphanumeric and underscores' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  username: string;

  @ApiPropertyOptional({ example: 'Dhaka Residential Model College', description: 'School or College name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  institutionName?: string;
}
