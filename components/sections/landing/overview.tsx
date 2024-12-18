"use client";

import Loading from "@/components/ui/(blocks)/loading";
import PostCard from "@/components/ui/(blocks)/postCard";
import { Post, PostList } from "@/lib/types";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

export default function Overview() {
  const [posts, setPosts] = useState<PostList[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/posts?page=1&limit=10&subject=categorized`);
        setPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-t-3xl">
      <div className="space-y-8 w-full max-w-[1400px]">
        <h1 className="text-xl font-semibold text-slate-900 text-center px-4">
          Önemsediğin konular hakkında yapılmış olan yürüyüşleri keşfet
        </h1>

        {posts.length < 1 ? (
          <div className="pt-4 flex justify-center">
            <Loading loading={true} />
          </div>
        ) : (
          <div className="space-y-10">
            {posts.map((subject, index) => (
              <div key={index} className="border-b-2 pb-2 overflow-hidden max-w-full">
                <div className="flex justify-between items-center mb-4">
                  <Link
                    href={`/discover/categories/${subject.subject}`}
                    className="text-lg font-semibold text-slate-600 uppercase hover:underline"
                  >
                    {subject.subject}
                  </Link>
                </div>

                <Swiper
                  slidesPerView={1}
                  spaceBetween={10}
                  breakpoints={{
                    540: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                  }}
                  className="space-x-7"
                >
                  {subject.posts.map((post: Post, idx: number) => (
                    <SwiperSlide key={idx}>
                      <PostCard post={post} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
