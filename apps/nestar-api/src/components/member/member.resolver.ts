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

	// Authenticated

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async updateMember(@AuthMember('_id') memberId: mongoose.ObjectId): Promise<string> {
		console.log('Mutation: updateMember');

		return this.memberService.updateMember();
	}

	//Admin

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query : check Auth');
		console.log(' ');

		return `hi ${memberNick}`;
	}

	@Roles(MemberType.USER)
	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query : checkAuthRoles');
		console.log('memberNicd:', memberNick);

		return `hi ${memberNick}`;
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');

		return this.memberService.getMember();
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
