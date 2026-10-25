import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Creates a new post, optionally linked to an official ContestResult scorecard.
   */
  async createPost(userId: string, dto: CreatePostDto) {
    if (dto.contestResultId) {
      const result = await this.prisma.contestResult.findUnique({
        where: { id: dto.contestResultId },
      });
      if (!result) {
        throw new NotFoundException(`ContestResult with ID ${dto.contestResultId} not found`);
      }
      if (result.userId !== userId) {
        throw new ForbiddenException('You can only attach your own official contest results to posts');
      }
    }

    const post = await this.prisma.post.create({
      data: {
        userId,
        caption: dto.caption,
        postType: dto.postType || 'SCORECARD',
        contestResultId: dto.contestResultId,
        scorecardImageUrl: dto.scorecardImageUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            institutionName: true,
          },
        },
        contestResult: {
          include: {
            contest: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Created post ${post.id} for user @${post.user.username}`);
    return {
      ...post,
      isLikedByMe: false,
    };
  }

  /**
   * Retrieves single post details including comments and like status.
   */
  async getPostById(postId: string, requestingUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            institutionName: true,
          },
        },
        contestResult: {
          include: {
            contest: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    let isLikedByMe = false;
    if (requestingUserId) {
      const like = await this.prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: requestingUserId,
          },
        },
      });
      isLikedByMe = !!like;
    }

    return {
      ...post,
      isLikedByMe,
    };
  }

  /**
   * Personalized feed: Posts from followed users and own posts, ordered chronologically.
   */
  async getPersonalFeed(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // 1. Get user IDs being followed
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const authorIds = [userId, ...follows.map((f) => f.followingId)];

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where: { userId: { in: authorIds } } }),
      this.prisma.post.findMany({
        where: { userId: { in: authorIds } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
          contestResult: {
            include: {
              contest: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  category: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Check likes by requesting user
    const postIds = posts.map((p) => p.id);
    const myLikes = await this.prisma.postLike.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    const likedPostIds = new Set(myLikes.map((l) => l.postId));

    const formattedPosts = posts.map((p) => ({
      ...p,
      isLikedByMe: likedPostIds.has(p.id),
    }));

    return {
      items: formattedPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Public explore feed: All posts ordered by createdAt DESC.
   */
  async getExploreFeed(page: number = 1, limit: number = 20, requestingUserId?: string) {
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
          contestResult: {
            include: {
              contest: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  category: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let likedPostIds = new Set<string>();
    if (requestingUserId) {
      const postIds = posts.map((p) => p.id);
      const myLikes = await this.prisma.postLike.findMany({
        where: {
          userId: requestingUserId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      likedPostIds = new Set(myLikes.map((l) => l.postId));
    }

    const formattedPosts = posts.map((p) => ({
      ...p,
      isLikedByMe: likedPostIds.has(p.id),
    }));

    return {
      items: formattedPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Posts created by a specific user.
   */
  async getUserPosts(username: string, page: number = 1, limit: number = 20, requestingUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where: { userId: user.id } }),
      this.prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
          contestResult: {
            include: {
              contest: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  category: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let likedPostIds = new Set<string>();
    if (requestingUserId) {
      const postIds = posts.map((p) => p.id);
      const myLikes = await this.prisma.postLike.findMany({
        where: {
          userId: requestingUserId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      likedPostIds = new Set(myLikes.map((l) => l.postId));
    }

    return {
      items: posts.map((p) => ({
        ...p,
        isLikedByMe: likedPostIds.has(p.id),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Deletes a post. Restricted to post author or platform admin.
   */
  async deletePost(postId: string, userId: string, userRole: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully', postId };
  }

  /**
   * Toggles like on a post. Atomically creates/removes PostLike and updates likesCount.
   * Sends real-time notification to post author when liked.
   */
  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.postLike.delete({
          where: { id: existingLike.id },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);

      return {
        liked: false,
        likesCount: Math.max(0, post.likesCount - 1),
      };
    } else {
      // Like
      await this.prisma.$transaction([
        this.prisma.postLike.create({
          data: { postId, userId },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      // Notify post author if not liking own post
      if (post.userId !== userId) {
        const liker = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, username: true },
        });

        await this.notificationsService.createNotification({
          userId: post.userId,
          type: 'NEW_LIKE',
          title: 'New Like on your post',
          message: `${liker?.fullName || 'Someone'} (@${liker?.username}) liked your post.`,
          referenceType: 'POST',
          referenceId: postId,
        });
      }

      return {
        liked: true,
        likesCount: post.likesCount + 1,
      };
    }
  }

  /**
   * Adds a comment to a post (supports optional parentCommentId for threading).
   * Sends real-time notification to post author.
   */
  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (dto.parentCommentId) {
      const parent = await this.prisma.postComment.findUnique({
        where: { id: dto.parentCommentId },
      });
      if (!parent || parent.postId !== postId) {
        throw new BadRequestException('Invalid parentCommentId for this post');
      }
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.postComment.create({
        data: {
          postId,
          userId,
          content: dto.content.trim(),
          parentCommentId: dto.parentCommentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    // Send notification to post author
    if (post.userId !== userId) {
      const commenter = comment.user;
      const snippet = dto.content.length > 50 ? `${dto.content.slice(0, 50)}...` : dto.content;
      await this.notificationsService.createNotification({
        userId: post.userId,
        type: 'NEW_COMMENT',
        title: 'New Comment on your post',
        message: `${commenter.fullName} commented: "${snippet}"`,
        referenceType: 'POST',
        referenceId: postId,
      });
    }

    return comment;
  }

  /**
   * Retrieves threaded comments for a post.
   */
  async getCommentsForPost(postId: string, page: number = 1, limit: number = 30) {
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.postComment.count({
        where: { postId, parentCommentId: null },
      }),
      this.prisma.postComment.findMany({
        where: { postId, parentCommentId: null },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
            },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarUrl: true,
                  institutionName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      items: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Deletes a comment. Restricted to comment author or platform admin.
   */
  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.$transaction([
      this.prisma.postComment.delete({
        where: { id: commentId },
      }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment deleted successfully', commentId };
  }

  /**
   * Follows a user by username.
   */
  async followUser(followerId: string, targetUsername: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });

    if (!targetUser) {
      throw new NotFoundException(`User @${targetUsername} not found`);
    }

    if (followerId === targetUser.id) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      return {
        following: true,
        message: `Already following @${targetUsername}`,
        targetUser: {
          id: targetUser.id,
          username: targetUser.username,
          fullName: targetUser.fullName,
        },
      };
    }

    await this.prisma.userFollow.create({
      data: {
        followerId,
        followingId: targetUser.id,
      },
    });

    // Notify target user
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { fullName: true, username: true },
    });

    await this.notificationsService.createNotification({
      userId: targetUser.id,
      type: 'NEW_FOLLOWER',
      title: 'New Follower',
      message: `${follower?.fullName || 'Someone'} (@${follower?.username}) started following you.`,
      referenceType: 'USER',
      referenceId: followerId,
    });

    return {
      following: true,
      message: `Successfully followed @${targetUsername}`,
      targetUser: {
        id: targetUser.id,
        username: targetUser.username,
        fullName: targetUser.fullName,
      },
    };
  }

  /**
   * Unfollows a user by username.
   */
  async unfollowUser(followerId: string, targetUsername: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });

    if (!targetUser) {
      throw new NotFoundException(`User @${targetUsername} not found`);
    }

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.userFollow.delete({
        where: { id: existingFollow.id },
      });
    }

    return {
      following: false,
      message: `Unfollowed @${targetUsername}`,
    };
  }

  /**
   * Retrieves paginated followers for a user.
   */
  async getFollowers(username: string, page: number = 1, limit: number = 20) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const skip = (page - 1) * limit;

    const [total, followers] = await Promise.all([
      this.prisma.userFollow.count({ where: { followingId: user.id } }),
      this.prisma.userFollow.findMany({
        where: { followingId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
              studentStats: true,
            },
          },
        },
      }),
    ]);

    return {
      items: followers.map((f) => ({
        followedAt: f.createdAt,
        user: f.follower,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves paginated users that this user is following.
   */
  async getFollowing(username: string, page: number = 1, limit: number = 20) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const skip = (page - 1) * limit;

    const [total, following] = await Promise.all([
      this.prisma.userFollow.count({ where: { followerId: user.id } }),
      this.prisma.userFollow.findMany({
        where: { followerId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              institutionName: true,
              studentStats: true,
            },
          },
        },
      }),
    ]);

    return {
      items: following.map((f) => ({
        followedAt: f.createdAt,
        user: f.following,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
