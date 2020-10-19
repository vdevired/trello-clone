import React from "react";
import ProfilePic from "./ProfilePic";
import { v4 as uuidv4 } from "uuid";

const HomeBoard = ({ board }) => {
    return (
        <div className="board-preview">
            <i className="board-preview__star fal fa-star"></i>
            <div className="board-preview__image">
                <img src={board.image} />
            </div>
            <p
                className="board-preview__title"
                style={{ marginBottom: board.members ? "1em" : 0 }}
            >
                {board.title}
            </p>
            {board.members && <Members members={board.members} />}
        </div>
    );
};

const Members = ({ members }) => {
    return (
        <div className="board-preview__members">
            {members.slice(0, 3).map((member) => (
                <ProfilePic user={member} key={uuidv4()} />
            ))}
            {members.length > 3 && (
                <p>{`+${members.length - 3} other${
                    members.length - 3 === 1 ? "" : "s"
                }`}</p>
            )}
        </div>
    );
};

export default HomeBoard;
