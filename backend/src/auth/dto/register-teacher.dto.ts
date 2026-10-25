import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterTeacherDto {
  @ApiProperty({ example: 'teacher@school.edu', description: 'Teacher email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Teacher@Pass123',
    minLength: 8,
    description: 'Password with min 8 characters, at least 1 letter and 1 number',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'Dr. John Smith', description: 'Full legal or display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'john_smith_teacher', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  username: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the organization/school the teacher is affiliated with',
  })
  @IsUUID('4', { message: 'organizationId must be a valid UUID' })
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ example: 'Senior Physics Lecturer', description: 'Teacher title or designation' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;
}
