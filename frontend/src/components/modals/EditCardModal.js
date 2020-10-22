import React, { useEffect, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import Labels from "../boards/Labels";
import useAxiosGet from "../../hooks/useAxiosGet";
import useBlurSetState from "../../hooks/useBlurSetState";
import globalContext from "../../context/globalContext";
import { timeSince, modalBlurHandler, authAxios } from "../../static/js/util";
import { backendUrl } from "../../static/js/const";
import { updateCard } from "../../static/js/board";
import ProfilePic from "../boards/ProfilePic";

const EditCardModal = ({ card, list, setShowModal }) => {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);

    useEffect(modalBlurHandler(setShowModal), []);
    useBlurSetState(".edit-modal__title-edit", editingTitle, setEditingTitle);
    useBlurSetState(
        ".edit-modal__form",
        editingDescription,
        setEditingDescription
    );

    const {
        data: comments,
        addItem: addComment,
        replaceItem: replaceComment,
        removeItem: removeComment,
    } = useAxiosGet(`/boards/comments/?item=${card.id}`);

    return (
        <div className="edit-modal">
            <button
                className="edit-modal__exit"
                onClick={() => setShowModal(false)}
            >
                <i className="fal fa-times"></i>
            </button>
            <div className="edit-modal__cols">
                <div className="edit-modal__left">
                    <Labels labels={card.labels} />
                    {!editingTitle ? (
                        <p
                            onClick={() => setEditingTitle(true)}
                            className="edit-modal__title"
                        >
                            {card.title}
                        </p>
                    ) : (
                        <EditCardTitle
                            list={list}
                            card={card}
                            setEditingTitle={setEditingTitle}
                        />
                    )}
                    <div className="edit-modal__subtitle">
                        in list <span>{list.title}</span>
                    </div>

                    <div className="edit-modal__section-header">
                        <div>
                            <i className="fal fa-file-alt"></i> Description
                        </div>
                        {card.description !== "" && (
                            <div>
                                <button
                                    className="btn btn--secondary btn--small"
                                    onClick={() => setEditingDescription(true)}
                                >
                                    <i className="fal fa-pencil"></i> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {card.description !== "" && !editingDescription && (
                        <p className="edit-modal__description">
                            {card.description}
                        </p>
                    )}

                    {editingDescription ? (
                        <EditCardDescription
                            list={list}
                            card={card}
                            setEditingDescription={setEditingDescription}
                        />
                    ) : (
                        card.description === "" && (
                            <button
                                className="btn btn--secondary btn--small btn--description"
                                onClick={() => setEditingDescription(true)}
                            >
                                Add description
                            </button>
                        )
                    )}

                    <div
                        className="edit-modal__section-header"
                        style={
                            card.attachments.length === 0
                                ? {
                                      marginBottom: "1.75em",
                                  }
                                : null
                        }
                    >
                        <div>
                            <i className="fal fa-paperclip"></i> Attachments
                        </div>
                        <div>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-plus"></i> Add
                            </a>
                        </div>
                    </div>

                    <Attachments attachments={card.attachments} />
                    <CommentForm
                        card={card}
                        style={
                            (comments || []).length === 0
                                ? { marginBottom: 0 }
                                : null
                        }
                        addComment={addComment}
                    />
                    <Comments
                        card={card}
                        comments={comments || []}
                        replaceComment={replaceComment}
                        removeComment={removeComment}
                    />
                </div>

                <div className="edit-modal__right">
                    <div className="edit-modal__section-header">
                        <div>Actions</div>
                    </div>

                    <ul className="edit-modal__actions">
                        <li>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-tags"></i> Edit Labels
                            </a>
                        </li>
                        <li>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-user"></i> Change Members
                            </a>
                        </li>
                        <li>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-arrow-right"></i> Move
                            </a>
                        </li>
                        <li>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-clock"></i> Change Due Date
                            </a>
                        </li>
                        <li>
                            <a className="btn btn--secondary btn--small">
                                <i className="fal fa-image"></i> Cover
                            </a>
                        </li>
                    </ul>

                    <Members members={card.assigned_to} />
                </div>
            </div>
        </div>
    );
};

const EditCardTitle = ({ list, card, setEditingTitle }) => {
    const { board, setBoard } = useContext(globalContext);
    const [title, setTitle] = useState(card.title);

    useEffect(() => {
        const titleInput = document.querySelector(".edit-modal__title-edit");
        titleInput.focus();
        titleInput.select();
    }, []);

    const onEditTitle = async (e) => {
        e.preventDefault();
        if (title.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title,
            }
        );
        setEditingTitle(false);
        updateCard(board, setBoard)(list.id, data);
    };

    return (
        <form onSubmit={onEditTitle}>
            <input
                className="edit-modal__title-edit"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            ></input>
        </form>
    );
};

const EditCardDescription = ({ list, card, setEditingDescription }) => {
    const { board, setBoard } = useContext(globalContext);
    const [description, setDescription] = useState(card.description);

    const onEditDesc = async (e) => {
        e.preventDefault();
        if (description.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title: card.title,
                description,
            }
        );
        setEditingDescription(false);
        updateCard(board, setBoard)(list.id, data);
    };

    return (
        <form className="edit-modal__form" onSubmit={onEditDesc}>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
            ></textarea>
            {description.trim() !== "" && (
                <button type="submit" className="btn btn--small">
                    Save
                </button>
            )}
        </form>
    );
};

const Attachments = ({ attachments }) =>
    attachments.length !== 0 && (
        <ul className="edit-modal__attachments">
            {attachments.map((attachment) => (
                <li key={uuidv4()}>
                    <div className="attachment">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png" />
                        <div className="attachment__content">
                            <div className="attachment__subtitle">
                                {timeSince(attachment.created_at)}
                            </div>
                            <div className="attachment__title">
                                {attachment.title}
                            </div>
                            <div className="attachment__buttons">
                                <a className="btn btn--secondary btn--small">
                                    Download
                                </a>
                                <a className="btn btn--secondary btn--small">
                                    Delete
                                </a>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );

const Comments = ({ card, comments, replaceComment, removeComment }) => {
    const { authUser } = useContext(globalContext);
    const [isEditing, setIsEditing] = useState(false);
    useBlurSetState(".edit-modal__form--comment", isEditing, setIsEditing);

    if (comments.length === 0) return null;

    const onDelete = async (comment) => {
        await authAxios.delete(`${backendUrl}/boards/comments/${comment.id}/`);
        removeComment(comment.id);
    };

    return (
        <ul className="edit-modal__comments">
            {comments.map((comment) => (
                <li key={uuidv4()}>
                    <div className="comment">
                        <div className="comment__header">
                            <div className="comment__header-left">
                                <ProfilePic user={comment.author} />
                                <div className="comment__info">
                                    <p>{comment.author.full_name}</p>
                                    <p>{timeSince(comment.created_at)}</p>
                                </div>
                            </div>
                            {comment.author.username === authUser.username && (
                                <div className="comment__header-right">
                                    <button
                                        onClick={() => setIsEditing(comment.id)}
                                    >
                                        Edit
                                    </button>{" "}
                                    -{" "}
                                    <button onClick={() => onDelete(comment)}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditing !== comment.id ? (
                            <div className="comment__content">
                                {comment.body}
                            </div>
                        ) : (
                            <CommentForm
                                card={card}
                                comment={comment}
                                replaceComment={replaceComment}
                                setIsEditing={setIsEditing}
                            />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

const CommentForm = ({
    card,
    comment,
    style,
    addComment,
    replaceComment,
    setIsEditing,
}) => {
    // If comment not null, edit form
    const [commentBody, setCommentBody] = useState(comment ? comment.body : "");

    const onAddComment = async (e) => {
        e.preventDefault();
        if (commentBody.trim() === "") return;
        const { data } = await authAxios.post(
            `${backendUrl}/boards/comments/`,
            {
                item: card.id,
                body: commentBody,
            }
        );
        addComment(data);
        setCommentBody("");
    };

    const onEditComment = async (e) => {
        e.preventDefault();
        if (commentBody.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/comments/${comment.id}/`,
            {
                body: commentBody,
            }
        );
        replaceComment(data);
        setIsEditing(false);
    };

    // Modifier is only for useBlurSetState, as doc.querySelector is selecting description form otherwise
    // Only add if comment is not null, otherwise doc.querySelector selects create comment form
    return (
        <form
            className={`edit-modal__form${
                comment ? " edit-modal__form--comment" : ""
            }`}
            style={style}
            onSubmit={comment ? onEditComment : onAddComment}
        >
            <textarea
                placeholder="Leave a comment..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
            ></textarea>
            {commentBody.trim() !== "" && (
                <button className="btn btn--small" type="submit">
                    Comment
                </button>
            )}
        </form>
    );
};

const Members = ({ members }) =>
    members.length !== 0 && (
        <>
            <div className="edit-modal__section-header">
                <div>Members</div>
            </div>
            <ul className="edit-modal__members">
                {members.map((member) => (
                    <li key={uuidv4()}>
                        <ProfilePic user={member} />
                        <p>{member.full_name}</p>
                    </li>
                ))}
            </ul>
        </>
    );

export default EditCardModal;
