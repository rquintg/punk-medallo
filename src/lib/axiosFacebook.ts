import axios from "axios";

// Server-only helper for fetching photos from Facebook Graph API.
// Uses server env vars (do NOT use NEXT_PUBLIC_ for tokens).
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export type FacebookPhoto = {
  id: string;
  full_picture: string;
  message?: string;
  permalink_url?: string;
  created_time?: string;
};

export const fetchFacebookPhotos = async (): Promise<FacebookPhoto[]> => {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error(
      "Facebook configuration is missing (FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN)."
    );
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v24.0/${PAGE_ID}/posts`,
      {
        params: {
          fields:
            "id,full_picture,permalink_url,message,created_time,attachments{media_type,type,subattachments,media}",
          access_token: ACCESS_TOKEN,
          limit: 100,
        },
      }
    );

    const posts = response.data?.data || [];
    const photos: FacebookPhoto[] = [];

    for (const post of posts) {
      // Prefer full_picture when available
      if (post.full_picture) {
        photos.push({
          id: post.id,
          full_picture: post.full_picture,
          message: post.message,
          permalink_url: post.permalink_url,
          created_time: post.created_time,
        });
        continue;
      }

      // If not, try to extract from attachments / subattachments
      if (
        post.attachments &&
        post.attachments.data &&
        post.attachments.data.length > 0
      ) {
        const attachment = post.attachments.data[0];

        // Album/subattachments
        if (attachment.subattachments && attachment.subattachments.data) {
          for (const [i, sub] of attachment.subattachments.data.entries()) {
            const mediaUrl = sub.media?.image?.src || sub.media?.image?.url || sub.media?.src;
            if (mediaUrl) {
              photos.push({
                id: `${post.id}_${i}`,
                full_picture: mediaUrl,
                message: post.message,
                permalink_url: post.permalink_url,
                created_time: post.created_time,
              });
            }
          }
          continue;
        }

        // Single attachment with media
        const mediaUrl = attachment.media?.image?.src || attachment.media?.image?.url || attachment.media?.src;
        if (mediaUrl) {
          photos.push({
            id: post.id,
            full_picture: mediaUrl,
            message: post.message,
            permalink_url: post.permalink_url,
            created_time: post.created_time,
          });
        }
      }
    }

    return photos;
  } catch (error) {
    console.error("Error fetching Facebook posts:", error);
    throw error;
  }
};
