"use client";

import { getComment } from "@/app/_api/board";
import {
  deleteBookmark,
  getBookmarkList,
  postBookmark,
} from "@/app/_api/bookmark";
import BoardView from "@/app/_components/BoardView";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type BoardType = {
  postId: number;
  title: string;
  postType: string;
  content: string;
  member: {
    memberId: number;
    memberName: string;
    profileImage: string;
  };
  projectId: number;
  boardId: number;
  createDate: string;
  updateDate: string;
  postTags: { tagId: number; tagName: string }[];
  notice: boolean;
  bookmark: boolean;
};

export type CommentType = {
  postCommentId: number;
  content: string;
  member: {
    memberId: number;
    memberName: string;
    profileImage: string;
  };
  profileSrc: string;
  createDate: string;
  updateDate: string;
};

const Page = () => {
  const [boardData, setBoardData] = useState<BoardType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isBookmark, setIsBookmark] = useState<boolean>(false);

  const params = useParams<{ id: string }>();

  useEffect(() => {
    // 상세 조회
    const fetchData = async () => {
      try {
        const res = await getBookmarkList(`/my/bookmark/${params.id}`);
        console.log("res : ", res);

        setBoardData(res.data);
        setIsBookmark(res.data.bookmark);

        try {
          const _res = await getComment(
            `/team/${res.data.projectId}/${res.data.boardId}/${res.data.postId}/`
          );

          setComments(_res.data.postCommentResponseList);
        } catch (err) {
          console.log("err  : ", err);
        }
      } catch (err) {
        console.log("err  : ", err);
      }
    };

    fetchData();
  }, [params]);

  // 북마크 토글
  const handleBookmark = useCallback(
    async (data: BoardType) => {
      if (!isBookmark) {
        try {
          const res = await postBookmark(`/my/bookmark/${data.postId}`);

          if (res.status === 200) {
            setIsBookmark(!isBookmark);

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
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          const res = await deleteBookmark(
            `/my/bookmark/post?postId=${data.postId}`
          );

          if (res.status === 200) {
            setIsBookmark(!isBookmark);

            toast.success("북마크가 등록되었습니다!", {
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
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    [isBookmark]
  );

  return (
    <div>
      {boardData !== null && (
        <>
          <title>{boardData.title}</title>
          <BoardView
            projectId={"undefined"}
            boardData={boardData}
            comments={comments}
            setComments={setComments}
            handleBookmark={handleBookmark}
            type={"bookmark"}
            isBookmark={isBookmark}
          />
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default Page;
