"use client";

import BoardList from "@/app/_components/BoardList";
import { ToggleDownBtnIcon, ToggleUpBtnIcon } from "@/app/_components/Icons";
import React, { useCallback, useEffect, useState } from "react";
import "./TeamBoard.scss";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPostList, getPostTag, getPostTagList } from "@/app/_api/board";
import { deleteBookmark, postBookmark } from "@/app/_api/bookmark";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkeletonBoard from "@/app/_components/SkeletonBoard";

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

type TagType = {
  tagId: number;
  tagName: string;
  tagCategory: string;
  projectId: number;
};

const Page = () => {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [tagLists, setTagLists] = useState<TagType[]>([]);
  const [activeTags, setActiveTags] = useState<TagType[]>([]);
  const [isToggle, setIsToggle] = useState<boolean>(true);

  const params = useParams<{ projectId: string; boardId: string }>();

  const fetchTagToggleData = useCallback(
    async (tag: number[]) => {
      const queryString = tag.map((tag) => `tags=${tag}`).join("&");

      try {
        const res = await getPostTagList(
          `/team/${params.projectId}/${params.boardId}/tags?${queryString}`
        );

        const sortNotice = sortNoticeData(res.data.postResponses);
        const sortDate = sortDateData(res.data.postResponses);

        setBoards([...sortNotice, ...sortDate]);
      } catch (err) {
        console.log(err);
        alert("태그 검색 조회에 실패했습니다.");
      }
    },
    [params]
  );

  useEffect(() => {
    const fetchData = () => {
      setTimeout(async () => {
        try {
          const res = await getPostList(
            `/team/${params.projectId}/${params.boardId}/`
          );
          const sortNotice = sortNoticeData(res.data.postResponses);
          const sortDate = sortDateData(res.data.postResponses);

          setBoards([...sortNotice, ...sortDate]);
        } catch (err) {
          console.log("err  : ", err);
          alert("게시글 조회에 실패했습니다.");
        }
      }, 500);
    };

    const fetchTagData = async () => {
      try {
        const res = await getPostTag(`/team/${params.projectId}/post/tag`);
        setTagLists(res.data.tagResponses);
      } catch (err) {
        console.log("err  : ", err);
        alert("태그 조회에 실패했습니다.");
      }
    };

    fetchTagData();

    // 태그가 all 일 경우
    if (activeTags.length === 0) {
      fetchData();
    }

    // 태그별 게시글 조회
    if (activeTags.length > 0 && activeTags[0].tagName !== "all") {
      fetchTagToggleData(activeTags.map((_tag) => _tag.tagId));
    }
  }, [params, activeTags, fetchTagToggleData]);

  // 공지일 경우 가장 위로 보내기
  const sortNoticeData = (data: Board[]) => {
    return data.filter((item) => item.notice);
  };

  // 일반 게시글 최신순 정렬
  const sortDateData = (data: Board[]) => {
    return data
      .filter((item) => !item.notice)
      .sort(
        (a, b) =>
          Number(new Date(b.createDate)) - Number(new Date(a.createDate))
      );
  };

  // 태그 토글 기능
  const onTagToggle = useCallback((tag: TagType) => {
    setActiveTags((prevTags: TagType[]) =>
      prevTags.map((_tag) => _tag.tagName).includes(tag.tagName)
        ? prevTags.filter((t) => t.tagName !== tag.tagName)
        : [...prevTags, tag]
    );
  }, []);

  // All 태그 클릭 - 초기화
  const onAllToggle = useCallback(() => {
    setActiveTags([]);
  }, []);

  // 북마크 토글
  const handleBookmark = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, data: Board) => {
      e.preventDefault();
      e.stopPropagation();

      if (!boards) return;

      const isBoards = boards?.map((item) =>
        item.postId === data.postId
          ? { ...item, bookmark: !item.bookmark }
          : item
      );
      setBoards(isBoards);

      if (!data.bookmark) {
        try {
          const res = await postBookmark(`/my/bookmark/${data.postId}`);

          if (res.status === 200) {
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
      } else {
        try {
          const res = await deleteBookmark(
            `/my/bookmark/post?postId=${data.postId}`
          );

          if (res.status === 200) {
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
      }
    },
    [boards]
  );

  return (
    <div>
      <title>게시판</title>
      <div className='top-box'>
        <h1>게시판</h1>
        <Link
          href={`/teamPage/${params.projectId}/teamBoard/${params.boardId}/write`}
          className='write-add-btn'
        >
          글쓰기
        </Link>
      </div>

      <div className='tag-wrap'>
        <div className='tag-info-top'>
          <button onClick={() => setIsToggle(!isToggle)}>
            {isToggle ? (
              <ToggleUpBtnIcon size={15} />
            ) : (
              <ToggleDownBtnIcon size={15} />
            )}
          </button>

          <span>태그선택</span>
        </div>
        {isToggle ? (
          <div className='tags'>
            <button
              className={`tag ${activeTags.length === 0 ? "active" : ""}`}
              onClick={onAllToggle}
              tag-data='all'
            >
              ALL
            </button>
            {tagLists?.map((tag) => {
              return (
                <button
                  key={tag.tagId}
                  className={`tag ${
                    activeTags.map((_tag) => _tag.tagName).includes(tag.tagName)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => onTagToggle(tag)}
                  tag-data={tag}
                >
                  {tag.tagName}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {boards !== null ? (
        <>
          {boards.length === 0 ? (
            <p style={{ textAlign: "center", padding: "32px 0" }}>
              게시글이 없습니다.
            </p>
          ) : (
            <>
              {boards.map((board: Board) => {
                return (
                  <BoardList
                    key={board.postId}
                    projectId={params.projectId}
                    boardId={params.boardId}
                    board={board}
                    bookmark={null}
                    handleBookmark={handleBookmark}
                    type={"board"}
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
