import { CanActivate, Type } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function JwtAuthGuard(
  ...extendGuards: (Type<IAuthGuard> | CanActivate)[]
): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(AuthGuard('jwt'), ...extendGuards),
  );
}
