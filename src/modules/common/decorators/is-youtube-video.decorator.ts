import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import axios from 'axios';
import process from 'process';

@ValidatorConstraint({ name: 'IsYoutubeVideo', async: true })
@Injectable()
export class IsYoutubeVideo implements ValidatorConstraintInterface {
  async validate(
    value: string | string[],
    args: ValidationArguments,
  ): Promise<boolean> {
    if (Array.isArray(value)) {
      // Если это массив строк, проверяем каждую строку
      const validationResults = await Promise.all(
        value.map((url) => this.validateUrl(url)),
      );
      // Если хотя бы одно значение неверное, возвращаем false
      return validationResults.every((result) => result);
    } else {
      // Если это одиночная строка, проверяем её
      return this.validateUrl(value);
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'The provided URL is not a valid YouTube video link or the video does not exist.';
  }

  private async validateUrl(url: string): Promise<boolean> {
    const videoId = this.extractVideoId(url);
    if (!videoId) return false;

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=id`,
      );
      return response.data.items.length > 0;
    } catch (error) {
      return false;
    }
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  }
}
