import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../../enums/member.enums';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../../enums/property.enum';
import { Member, TotalCounter } from '../member';

@ObjectType()
export class Property {
	@Field(() => String)
	_id!: ObjectId;

	@Field(() => PropertyType)
	propertyType!: PropertyType;
	@Field(() => PropertyStatus)
	propertyStatus!: PropertyStatus;

	@Field(() => PropertyLocation)
	propertyLocation!: PropertyLocation;

	@Field(() => String)
	propertyAddress!: string;

	@Field(() => String)
	propertyTitle!: string;

	@Field(() => Number)
	propertyPrice!: number;

	@Field(() => Number)
	propertySquare!: number;

	@Field(() => String)
	propertyBeds!: string;

	@Field(() => String)
	propertyComments!: string;

	@Field(() => String)
	propertyLikes!: string;

	@Field(() => String)
	propertyRooms!: string;

	@Field(() => Int)
	propertyViews!: number;

	@Field(() => String)
	propertyRank!: string;

	@Field(() => [String])
	propertyImages!: string[];

	@Field(() => String, { nullable: true })
	propertyDesc!: string;

	@Field(() => Boolean)
	propertyBarter!: boolean;

	@Field(() => Boolean)
	propertyRent!: boolean;

	@Field(() => String)
	memberId!: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt!: Date;

	@Field(() => Date, { nullable: true })
	deletedAt!: Date;

	@Field(() => Date, { nullable: true })
	constructedAt!: Date;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	//from aggregation

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Properties {
	@Field(() => [Property])
	list!: Property[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
}
