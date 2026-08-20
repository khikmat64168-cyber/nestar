import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';

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

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query : check Auth');
		console.log(' ');

		return `hi ${memberNick}`;
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');

		return this.memberService.getMember();
	}

	/** Admin  **/

	//Authorization

	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		return this.memberService.getAllMembersByAdmin();
	}

	//Authorization
	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation: updateMemberByAdmin ');

		return this.memberService.updateMemberByAdmin();
	}
}
