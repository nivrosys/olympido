import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Dhaka University Science Club', description: 'Organization legal or operating name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'dusc.ac.bd', description: 'Institutional domain name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  officialDomain: string;

  @ApiProperty({ example: 'contact@dusc.ac.bd', description: 'Official contact email' })
  @IsEmail({}, { message: 'Please provide a valid contact email' })
  @IsNotEmpty()
  contactEmail: string;

  @ApiPropertyOptional({ example: 'https://dusc.ac.bd', description: 'Official website' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({
    example: 'https://assets.olympido.com/docs/verification.pdf',
    description: 'Accreditation or legal registration document URL',
  })
  @IsOptional()
  @IsUrl()
  accreditationDocumentUrl?: string;
}
