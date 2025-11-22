import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { currentUser } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
  propertyImages: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      
      if (!user) throw new Error('Unauthorized');
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      
      // Return an object to be sent to clientside onClientUploadComplete callback
      return { uploadedBy: metadata.userId, url: file.url };
    }),
  
  verifiedImages: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      
      if (!user) throw new Error('Unauthorized');
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Verified image upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      
      // Return an object to be sent to clientside onClientUploadComplete callback
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;