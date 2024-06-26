"use client";

import {
  deleteBookmark,
  getBookmarkList,
  postBookmark,
} from "@/app/_api/bookmark";
import BoardList from "@/app/_components/BoardList";
import SkeletonBoard from "@/app/_components/SkeletonBoard";
import React, { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type Board = {
  postId: number;
  title: string;
  postType: string;
  content: string;
  member: {
    memberId: number;
    memberName: string;
    profileImage: string;
  };
  postTags: { tagId: number; tagName: string }[];
  createDate: string;
  updateDate: string;
  notice: boolean;
  bookmark: boolean;
};

export type BookmarkType = {
  bookmarkId: number;
  member: {
    memberId: number;
    memberName: string;
    profileImage: string;
  };
  post: {
    boardId: number;
    postId: number;
    boardName: string;
    title: string;
    content: string;
    bookmark: boolean;
    createDate: string;
    notice: boolean;
    postTags: { tagId: number; tagName: string }[];
    postType: string;
    member: {
      memberId: number;
      memberName: string;
      profileImage: string;
    };
  };
};

const Page = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[] | null>(null);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(async () => {
        try {
          const res = await getBookmarkList(`/my/bookmark/`);

          const sortNotice = sortNoticeData(res.data.bookmarkResponses);
          const sortDate = sortDateData(res.data.bookmarkResponses);

          setBookmarks([...sortNotice, ...sortDate]);
        } catch (err) {
          console.log("err  : ", err);
        }
      }, 500);
    };

    fetchData();
  }, []);

  // 공지일 경우 가장 위로 보내기
  const sortNoticeData = (data: BookmarkType[]) => {
    return data
      .filter((item) => item.post.notice)
      .sort(
        (a, b) =>
          Number(new Date(a.post.createDate)) -
          Number(new Date(b.post.createDate))
      );
  };

  // 일반 게시글 최신순 정렬
  const sortDateData = (data: BookmarkType[]) => {
    return data
      .filter((item) => !item.post.notice)
      .sort(
        (a, b) =>
          Number(new Date(b.post.createDate)) -
          Number(new Date(a.post.createDate))
      );
  };

  // 북마크 토글
  const handleBookmark = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, data: BookmarkType) => {
      e.preventDefault();
      e.stopPropagation();

      if (!bookmarks) return;

      const isBookmarks = bookmarks?.map((item) =>
        item.post.postId === data.post.postId
          ? { ...item, bookmark: !item.post.bookmark }
          : item
      );
      setBookmarks(isBookmarks);

      try {
        const res = await deleteBookmark(
          `/my/bookmark/post?postId=${data.post.postId}`
        );

        const newBookmarks = bookmarks?.filter(
          (item) => item.post.postId !== data.post.postId
        );

        setBookmarks(newBookmarks);

        toast.success("북마크가 해제되었습니다!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } catch (err) {
        console.log(err);
      }
    },
    [bookmarks]
  );

  return (
    <div>
      <title>북마크</title>
      <h1 style={{ marginBottom: "24px" }}>북마크</h1>

      {bookmarks !== null ? (
        <>
          {bookmarks.length === 0 ? (
            <p style={{ textAlign: "center", padding: "32px 0" }}>
              북마크한 게시글이 없습니다.
            </p>
          ) : (
            <>
              {bookmarks.map((bookmark: BookmarkType) => {
                return (
                  <BoardList
                    projectId={"undefined"}
                    boardId={"undefined"}
                    key={bookmark.bookmarkId}
                    board={null}
                    bookmark={bookmark}
                    handleBookmark={handleBookmark}
                    type={"bookmark"}
                  />
                );
              })}
            </>
          )}
        </>
      ) : (
        <SkeletonBoard />
      )}

      <ToastContainer />
    </div>
  );
};

export default Page;
