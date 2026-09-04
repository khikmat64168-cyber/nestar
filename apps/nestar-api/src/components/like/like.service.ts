import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from '../../libs/dto/member/like/like';
import { Model } from 'mongoose';

@Injectable()
export class LikeService {
	constructor(@InjectModel('like') private readonly likeModel: Model<Like>) {}
}
