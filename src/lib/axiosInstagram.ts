import axios from "axios";

// Server-only Instagram helper. Use server env vars (no NEXT_PUBLIC_ for tokens).
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export type InstagramPhoto = {
  id: string;
  caption?: string;
  media_type?: string;
  image_url?: string;
  permalink?: string;
  timestamp?: string;
  full_picture?: string;
  permalink_url?: string;
  message?: string;
};

export const fetchInstagramPhotos = async (): Promise<InstagramPhoto[]> => {
  if (!INSTAGRAM_BUSINESS_ACCOUNT_ID || !ACCESS_TOKEN) {
    throw new Error(
      "Instagram configuration is missing (INSTAGRAM_BUSINESS_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN)."
    );
  }

  try {
    const response = await axios.get(
      `https://graph.instagram.com/v24.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        params: {
          fields: "id,caption,media_type,media_url,permalink,timestamp",
          access_token: ACCESS_TOKEN,
          limit: 100,
        },
      }
    );

    // Define a lightweight type for the raw API items to avoid `any` usage
    type RawMedia = {
      id?: string;
      caption?: string;
      media_type?: string;
      media_url?: string;
      permalink?: string;
      timestamp?: string;
    };

    const items: RawMedia[] = response.data?.data || [];

    const photos: InstagramPhoto[] = items
      .filter((media) => media.media_type === "IMAGE" || media.media_type === "CAROUSEL_ALBUM")
      .map((media) => ({
        id: media.id || "",
        caption: media.caption || undefined,
        media_type: media.media_type,
        image_url: media.media_url,
        permalink: media.permalink,
        timestamp: media.timestamp,
        full_picture: media.media_url,
        permalink_url: media.permalink,
        message: media.caption,
      }));

    return photos;
  } catch (error) {
    console.error("Error fetching Instagram photos:", error);
    throw error;
  }
};
