import React, { useEffect } from "react";
import board from "../../static/img/board.svg";
import greenface from "../../static/img/greenface.svg";
import { modalBlurHandler, authAxios } from "../../static/js/util";
import { backendUrl } from "../../static/js/const";

import { useForm } from "react-hook-form";

const CreateTeamModal = ({ setShowModal, addProject }) => {
    useEffect(modalBlurHandler(setShowModal), []);
    const { register, handleSubmit, errors, watch } = useForm();
    const titleValue = watch("title", "");

    const animateFaces = () => {
        const face1 = document.querySelector(".create-team__face--1");
        if (titleValue !== "") {
            face1.style.top = "230px";
            face1.style.left = "60px";
        }
    };

    const onSubmit = async (data) => {
        const invitedMembers =
            data.members !== ""
                ? data.members.split(",").map((user) => user.trim()) // usernames and emails
                : [];

        try {
            const { data: resData } = await authAxios.post(
                backendUrl + "/projects/",
                data
            );
            if (invitedMembers.length !== 0) {
                await authAxios.post(
                    backendUrl + `/projects/${resData.id}/invite/`,
                    {
                        users: invitedMembers,
                    }
                );
            }
            addProject(resData);
        } catch (error) {
            console.log(error);
        }
        setShowModal(false);
    };

    return (
        <div className="create-team">
            <div className="create-team__form">
                <p className="create-team__title">Start a Project</p>
                <p className="create-team__subtitle">
                    Boost your productivity by making it easier for everyone to
                    access boards in one location.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="title">Project Name</label>
                    <input
                        name="title"
                        ref={register({ required: true })}
                        type="text"
                        placeholder="The Boys"
                        onBlur={animateFaces}
                    />

                    <label htmlFor="description">Project Description</label>
                    <textarea
                        name="description"
                        ref={register}
                        placeholder="Get your members on board with a few words about your project"
                    ></textarea>

                    <label htmlFor="members">Invite Members</label>
                    <input
                        name="members"
                        ref={register}
                        type="text"
                        placeholder="Type in username or email"
                    />

                    {titleValue.trim() !== "" ? (
                        <button type="submit" className="btn">
                            Create Project
                        </button>
                    ) : (
                        <button className="btn btn--disabled" disabled>
                            Create Project
                        </button>
                    )}
                </form>
            </div>
            <div className="create-team__bg">
                <button onClick={() => setShowModal(false)}>
                    <i className="fal fa-times"></i>
                </button>
                <img className="create-team__img" src={board} />
                <img
                    className="create-team__face create-team__face--1"
                    src={greenface}
                />
            </div>
        </div>
    );
};

export default CreateTeamModal;
