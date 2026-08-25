import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput, MemberUpdateInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enums';
import { Message } from '../../libs/Errors';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private authService: AuthService,
		private viewService: ViewService,
	) {}
	public async signup(input: MemberInput): Promise<Member> {
		//Hashing password
		input.memberPassword = await this.authService.hashPassword(input.memberPassword); //hashPassword auth.service dan call qilinvotti
		try {
			const result = await this.memberModel.create(input);
			//Auth via tokens
			result.accessToken = await this.authService.createToken(result);

			return result;
		} catch (err) {
			console.log('Error servicemodel: ', err instanceof Error ? err.message : String(err));
			if (err instanceof Error && 'code' in err && err.code === 11000) {
				throw new BadRequestException('Member already exists with this phone number or nickname');
			}
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response = await this.memberModel.findOne({ memberNick: memberNick }).select('+memberPassword').exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		//Compare Passwords

		console.log('response:', response);

		const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword ?? '');
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		delete response.memberPassword;
		response.accessToken = await this.authService.createToken(response);

		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};

		const targetMember = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		if (memberId) {
			// recordView
			const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				//increase memberView
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
		}
		return targetMember;
	}

	public async getProducts(): Promise<string> {
		return 'getMember executed';
	}

	public async getAllMembersByAdmin(): Promise<Member[]> {
		return await this.memberModel.find().exec();
	}

	public async updateMemberByAdmin(input: MemberUpdateInput): Promise<Member> {
		const { _id, ...rest } = input;
		const result = await this.memberModel.findByIdAndUpdate(_id, rest, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result;
	}
}
