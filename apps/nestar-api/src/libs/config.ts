import { ObjectId } from 'bson';

export const availableAgentsSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];

export const availableMembersSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

// IMAGE CONFIGURATION (config.js)
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export const ensureUploadDir = (dir: string) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const validImageExtensions = ['.png', '.jpg', '.jpeg'];

export const isValidImage = (filename: string, mimetype: string): boolean => {
	const ext = path.parse(filename).ext.toLowerCase();
	return validMimeTypes.includes(mimetype) || validImageExtensions.includes(ext);
};

export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};
export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
