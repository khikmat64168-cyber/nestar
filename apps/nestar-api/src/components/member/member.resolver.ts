import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput, MemberUpdateInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	// @UsePipes(ValidationPipe). Global integration dan so'ng olib tashlandi ?
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		try {
			console.log('Mutation : signup');
			console.log('input:', input);
			return await this.memberService.signup(input);
		} catch (err) {
			console.log('Error, signup:', err);
			throw new InternalServerErrorException(err);
		}
	}

	@Mutation(() => Member)
	// @UsePipes(ValidationPipe). Global integration dan so'ng olib tashlandi ?
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		try {
			console.log('Mutation: login');
			console.log('input:', input);

			return await this.memberService.login(input);
		} catch (err) {
			console.log('Error, login:', err);
			throw new InternalServerErrorException(err);
		}
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query : checkAuth');
		console.log('memberNicd:', authMember.memberNick);

		return `hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query : checkAuthRoles');
		console.log('memberNicd:', authMember.memberNick);

		return `hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	// Authenticated

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: mongoose.ObjectId,
	): Promise<Member> {
		console.log('Mutation: updateMember');
		// console.log('memberId', memberId);

		delete (input as Partial<MemberUpdate>)._id;

		return this.memberService.updateMember(memberId, input);
	}

	//Admin

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: mongoose.ObjectId,
	): Promise<Member> {
		console.log('Query: getMember');
		const tergetId = shapeIntoMongoObjectId(input);

		return this.memberService.getMember(tergetId, memberId);
	}

	/** Admin  **/

	//Authorization

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => [Member])
	public async getAllMembersByAdmin(@AuthMember() authMember: Member): Promise<Member[]> {
		console.log('authMember.memberType:', authMember.memberType);
		return this.memberService.getAllMembersByAdmin();
	}

	//Authorization
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdateInput): Promise<Member> {
		console.log('Mutation: updateMemberByAdmin ');

		return this.memberService.updateMemberByAdmin(input);
	}
}
