import React, { useEffect, useCallback } from "react";

// Mutate state if click occurs outside element with className
const useBlurSetState = (className, state, setState) => {
    const handleClick = useCallback((e) => {
        const elem = document.querySelector(className);
        if (!elem) {
            setState(false);
            return;
        }
        if (!elem.contains(e.target)) setState(false);
    }, []);

    useEffect(() => {
        if (state) {
            document.addEventListener("click", handleClick);
        } else {
            document.removeEventListener("click", handleClick);
        }
    }, [state]);
};

export default useBlurSetState;
