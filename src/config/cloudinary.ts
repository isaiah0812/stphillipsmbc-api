import cloudinary from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

export const cloud = cloudinary.v2;

export const configCloud = (): void => {
  try {
    console.info("Configuring cloudinary...");

    cloud.config({
      secure: true,
    });

    console.info("Cloudinary SDK configured and ready for uploads!");
  } catch (cloudErr: any) {
    console.error("Error configuring Cloudinary SDK.");
    throw cloudErr;
  }
}