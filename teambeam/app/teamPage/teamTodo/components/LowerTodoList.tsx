import React from "react";
import { TodoItem } from "../types";

type Props = {
  subtask: TodoItem;
};

const LowerTodoList: React.FC<Props> = ({ subtask }) => {
  return (
    <div className="lowerTodoList">
      <h5 className="lowerTitle">{subtask.title}</h5>
      <span className="lowerDate">
        {subtask.startDate} - {subtask.endDate}
      </span>
      {subtask.assignees && subtask.assignees.length > 0 && (
        <div className="assigneeTags">
          {subtask.assignees.map((assignee, index) => (
            <span key={index} className="assigneeTag">
              {assignee}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowerTodoList;