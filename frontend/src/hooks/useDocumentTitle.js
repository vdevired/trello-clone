import React, { useRef, useEffect } from "react";

const useDocumentTitle = (title, retainOnUnmount = false) => {
    const defaultTitle = useRef(document.title).current;

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        return () => {
            if (!retainOnUnmount) {
                document.title = defaultTitle;
            }
        };
    }, []);
};

export default useDocumentTitle;
