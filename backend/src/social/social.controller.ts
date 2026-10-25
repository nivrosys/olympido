import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('posts')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a new post',
    description:
      'Creates a social feed post, optionally linking official ContestResult scorecards or rating milestones.',
  })
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.socialService.createPost(req.user.id, dto);
  }

  @Get('posts/feed')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get personalized activity feed',
    description:
      'Returns chronological posts from followed Olympiad peers and self, including like state.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getPersonalFeed(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.socialService.getPersonalFeed(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('posts/explore')
  @Public()
  @ApiOperation({
    summary: 'Get public explore feed',
    description: 'Returns all posts across the platform ordered chronologically.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getExploreFeed(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.socialService.getExploreFeed(
      Number(page) || 1,
      Number(limit) || 20,
      req?.user?.id,
    );
  }

  @Get('users/:username/posts')
  @Public()
  @ApiOperation({
    summary: 'Get posts published by a specific user',
    description: 'Returns all timeline posts and scorecards by the specified username.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getUserPosts(
    @Param('username') username: string,
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.socialService.getUserPosts(
      username,
      Number(page) || 1,
      Number(limit) || 20,
      req?.user?.id,
    );
  }

  @Get('posts/:id')
  @Public()
  @ApiOperation({
    summary: 'Get single post by ID',
    description: 'Returns post content, author details, linked contest results, and likes count.',
  })
  async getPostById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.socialService.getPostById(id, req?.user?.id);
  }

  @Delete('posts/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete post',
    description: 'Deletes post and all associated comments/likes. Author or Admin only.',
  })
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.socialService.deletePost(id, req.user.id, req.user.role);
  }

  @Post('posts/:id/like')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Toggle like on post',
    description:
      'Atomically adds or removes a like. Sends real-time notification to the post author.',
  })
  async toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.socialService.toggleLike(id, req.user.id);
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Add comment to post',
    description:
      'Adds a top-level or threaded reply to a post and notifies the post author.',
  })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.socialService.addComment(id, req.user.id, dto);
  }

  @Get('posts/:id/comments')
  @Public()
  @ApiOperation({
    summary: 'Get comments for post',
    description: 'Returns threaded comment hierarchy with authors and replies.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 30 })
  async getCommentsForPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
  ) {
    return this.socialService.getCommentsForPost(
      id,
      Number(page) || 1,
      Number(limit) || 30,
    );
  }

  @Delete('posts/comments/:commentId')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete comment',
    description: 'Deletes comment. Comment author or Admin only.',
  })
  async deleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Request() req: any,
  ) {
    return this.socialService.deleteComment(commentId, req.user.id, req.user.role);
  }

  @Post('users/:username/follow')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Follow a user',
    description: 'Follows another student or teacher and triggers a real-time notification.',
  })
  async followUser(
    @Param('username') username: string,
    @Request() req: any,
  ) {
    return this.socialService.followUser(req.user.id, username);
  }

  @Delete('users/:username/follow')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Removes user from following list.',
  })
  async unfollowUser(
    @Param('username') username: string,
    @Request() req: any,
  ) {
    return this.socialService.unfollowUser(req.user.id, username);
  }

  @Get('users/:username/followers')
  @Public()
  @ApiOperation({
    summary: 'Get followers of a user',
    description: 'Returns paginated list of followers.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getFollowers(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.socialService.getFollowers(
      username,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('users/:username/following')
  @Public()
  @ApiOperation({
    summary: 'Get users followed by a user',
    description: 'Returns paginated list of accounts this user follows.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getFollowing(
    @Param('username') username: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.socialService.getFollowing(
      username,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }
}
