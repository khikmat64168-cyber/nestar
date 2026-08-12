import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberInput } from '../../libs/dto/member/member.input';

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}
	public async signup(input: MemberInput): Promise<Member> {
		//Hashing password
		try {
			const result = await this.memberModel.create(input);
			//Auth via tokens
			return result;
		} catch (err) {
			console.log('Error servicemodel: ', err);
			if (err instanceof Error && 'code' in err && err.code === 11000) {
				throw new BadRequestException('Member already exists with this phone number or nickname');
			}
			throw new BadRequestException();
		}
	}

	public async login(): Promise<string> {
		return 'login executed';
	}

	public async updateMember(): Promise<string> {
		return 'updateMember executed';
	}

	public async getMember(): Promise<string> {
		return 'getMember executed';
	}
}
