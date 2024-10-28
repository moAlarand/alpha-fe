'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '../../utils/supabase/client'
import Image from 'next/image'

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null;
  url: string | null;
  size: number;
  onUpload?: (url: string) => void;
}) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  const readeOnly = !onUpload;
  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        console.log("Error downloading image: ", error);
      }
    }

    if (url) downloadImage(url);
  }, [url, supabase]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      if (onUpload) onUpload(filePath);
    } catch (error) {
      console.log(
        "🚀 ~ constuploadAvatar:React.ChangeEventHandler<HTMLInputElement>= ~ error:",
        error
      );
      alert("Error uploading avatar!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={
        readeOnly
          ? "avatar"
          : "avatar-upload flex flex-col items-center bg-gray-900 p-6 rounded-xl shadow-lg text-white text-center space-y-4"
      }
    >
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full border-4 border-gray-700 hover:border-gray-500 transition-colors duration-300"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-gray-700 rounded-full"
          style={{ height: size, width: size }}
        >
          <span className="text-sm text-gray-400">No Avatar</span>
        </div>
      )}

      {readeOnly ? null : (
        <div className="w-full flex flex-col items-center">
          <label
            className={`cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              uploading
                ? "bg-gray-600 text-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            htmlFor="single"
          >
            {uploading ? "Uploading ..." : "Upload Avatar"}
          </label>
          <input
            style={{ display: "none" }}
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}