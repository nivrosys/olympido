import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterOrganizerDto {
  @ApiProperty({ example: 'director@matholympiad.org', description: 'Organizer contact email' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Organizer@123456',
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

  @ApiProperty({ example: 'Sarah Jenkins', description: 'Full legal name of the organizer / representative' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: 'sarah_jenkins_org', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  username: string;

  // Organization fields
  @ApiProperty({ example: 'National Mathematical Society', description: 'Official institution name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  organizationName: string;

  @ApiProperty({
    example: 'matholympiad.org',
    description: 'Official institutional domain name (must not be disposable)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officialDomain: string;

  @ApiPropertyOptional({ example: 'info@matholympiad.org', description: 'Public institutional contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: 'https://matholympiad.org', description: 'Official website URL' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({
    example: 'https://assets.olympido.com/docs/accreditation.pdf',
    description: 'Accreditation or legal entity document URL',
  })
  @IsOptional()
  @IsUrl()
  accreditationDocumentUrl?: string;
}
